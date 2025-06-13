import os

import uuid
from celery import Celery, group
from backend.db import database
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import ForeignKeyViolation

celery = Celery(__name__)
celery.conf.broker_url = os.environ.get(
    "CELERY_BROKER_URL", "amqp://rabbitmq:rabbitmq@rabbitmq-jam:5672//"
)
celery.conf.result_backend = os.environ.get(
    "CELERY_RESULT_BACKEND",
    "db+postgresql://postgres:postgres@postgres-jam-db/harmonicjam",
)

CHUNK_SIZE = 100


@celery.task(name="add_companies_to_collection")
def add_companies_to_collection(
    collection_id: uuid.UUID,
    company_ids: list[int],
) -> int:
    """Adds a chunk of companies to a collection and updates the progress in DB.

    Returns:
        int: the number of companies successfully added (or skipped adding) to the collection.
    Raises:
        IntegrityError: as long as it's not a ForeignKeyViolation, which is handled.
    """

    successful_companies = 0
    with database.SessionLocal() as db:
        # Attempt a bulk insertion to lower DB round trips
        try:
            query = (
                insert(database.CompanyCollectionAssociation.__table__)
                .values(
                    [
                        {"collection_id": collection_id, "company_id": company_id}
                        for company_id in company_ids
                    ]
                )
                .on_conflict_do_nothing()
            )
            db.execute(query)
            db.commit()
            successful_companies = len(company_ids)

        # In the event of a (known) bulk insertion error, like a ForeignKeyViolation,
        # retry insertions individually so as to only skip the failed rows.
        except IntegrityError as e:
            db.rollback()
            if isinstance(e.orig, ForeignKeyViolation):
                # Retry individually -- slower than a bulk insert, but we will insert every company that does exist
                # TODO: update task meta with the set of failed companies so specific results can be reported
                for company_id in company_ids:
                    try:
                        association = database.CompanyCollectionAssociation(
                            collection_id=collection_id, company_id=company_id
                        )
                        db.add(association)
                        db.flush()
                        successful_companies += 1
                    except IntegrityError as e:
                        if isinstance(e.orig, ForeignKeyViolation):
                            db.rollback()
                        else:
                            raise

                db.commit()

            # In case of unknown errors, just raise them
            else:
                raise

    return successful_companies


@celery.task(name="create_bulk_collection_insertion")
def create_bulk_collection_insertion(
    collection_id: uuid.UUID, company_ids: list[int]
) -> group:
    """Enqueues chunks of company IDs to be associated with a collection.

    Returns:
        group: the Celery group managing all the subtasks.
    """

    # Divide into chunks
    chunks = [
        (collection_id, company_ids[i : i + CHUNK_SIZE])
        for i in range(0, len(company_ids), CHUNK_SIZE)
    ]

    # Process each chunk as part of a group
    result = group(add_companies_to_collection.s(*chunk) for chunk in chunks)

    # We can use this ID to get the chunk progress
    return result
