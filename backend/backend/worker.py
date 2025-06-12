import os

import uuid
from celery import Celery, group


celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "amqp://rabbitmq:rabbitmq@localhost:5672/")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "amqp://rabbitmq:rabbitmq@localhost:5672/")

CHUNK_SIZE = 100

@celery.task(name="add_companies_to_collection")
def add_companies_to_collection(
    collection_id: uuid.UUID,
    company_ids: list[int],
):
    """Adds a chunk of companies to a collection and updates the progress in DB."""
    raise NotImplementedError()


@celery.task(name="create_bulk_collection_insertion")
def create_bulk_collection_insertion(collection_id: uuid.UUID, company_ids: list[int]):
    # Divide into chunks
    chunks = [(collection_id, company_ids[i:i + CHUNK_SIZE]) for i in range(0, len(company_ids), CHUNK_SIZE)]
    # Process each chunk as part of a group
    result = group(add_companies_to_collection.s(*chunk) for chunk in chunks)
    # We can use this ID to get the chunk progress
    return result.id
