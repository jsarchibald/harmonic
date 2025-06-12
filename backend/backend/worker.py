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
        # association = database.CompanyCollectionAssociation(
        #     company_id=company_associations.company_ids[0],
        #     collection_id=collection_id,
        # )
        try:
            query = insert(database.CompanyCollectionAssociation.__table__).values([
                {"collection_id": collection_id, "company_id": company_id} for company_id in company_ids
            ]).on_conflict_do_nothing()
            # db.bulk_insert_mappings(database.CompanyCollectionAssociation, )
            # db.add(association)
            db.execute(query)
            db.commit()
            print("DONE!!")
        except IntegrityError as e:
            raise
            # if isinstance(e.orig, UniqueViolation):
            #     raise HTTPException(
            #         status.HTTP_400_BAD_REQUEST, detail="This company is already in the collection."
            #     )
            # elif isinstance(e.orig, ForeignKeyViolation):
            #     raise HTTPException(
            #         status.HTTP_400_BAD_REQUEST, detail="Either the company or the collection does not exist."
            #     )
            # else:
            #     raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unknown error occurred.")


@celery.task(name="create_bulk_collection_insertion")
def create_bulk_collection_insertion(collection_id: uuid.UUID, company_ids: list[int]):
    # Divide into chunks
    chunks = [(collection_id, company_ids[i:i + CHUNK_SIZE]) for i in range(0, len(company_ids), CHUNK_SIZE)]
    # Process each chunk as part of a group
    result = group(add_companies_to_collection.s(*chunk) for chunk in chunks)
    # We can use this ID to get the chunk progress
    return result
