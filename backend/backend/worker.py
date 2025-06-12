import os

import uuid
from celery import Celery, group
from backend.db import database
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from psycopg2.errors import UniqueViolation, ForeignKeyViolation

celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "amqp://rabbitmq:rabbitmq@rabbitmq-jam:5672//")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "db+postgresql://postgres:postgres@postgres-jam-db/harmonicjam")

CHUNK_SIZE = 100

@celery.task(name="add_companies_to_collection")
def add_companies_to_collection(
    collection_id: uuid.UUID,
    company_ids: list[int],
):
    """Adds a chunk of companies to a collection and updates the progress in DB."""

    with database.SessionLocal() as db:
        try:
            query = insert(database.CompanyCollectionAssociation.__table__).values([
                {"collection_id": collection_id, "company_id": company_id} for company_id in company_ids
            ]).on_conflict_do_nothing()
            db.execute(query)
            db.commit()
        except IntegrityError as e:
            db.rollback()
            if isinstance(e.orig, ForeignKeyViolation):
                # Retry individually -- slower than a bulk insert, but we will insert every company that does exist
                nonexistent_company_ids = set()
                for company_id in company_ids:
                    try:
                        association = database.CompanyCollectionAssociation(collection_id=collection_id, company_id=company_id)
                        db.add(association)
                        db.flush()
                    except IntegrityError as e:
                        if isinstance(e.orig, ForeignKeyViolation):
                            db.rollback()
                            nonexistent_company_ids.add(company_id)
                        else:
                            pass

                # TODO: notify the user of a partial failure
                db.commit()
            else:
                raise


@celery.task(name="create_bulk_collection_insertion")
def create_bulk_collection_insertion(collection_id: uuid.UUID, company_ids: list[int]):
    # Divide into chunks
    chunks = [(collection_id, company_ids[i:i + CHUNK_SIZE]) for i in range(0, len(company_ids), CHUNK_SIZE)]
    # Process each chunk as part of a group
    result = group(add_companies_to_collection.s(*chunk) for chunk in chunks)
    # We can use this ID to get the chunk progress
    return result
