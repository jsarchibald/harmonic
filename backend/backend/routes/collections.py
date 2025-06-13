import uuid

from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from celery.result import GroupResult
from celery.states import ALL_STATES as ALL_KNOWN_CELERY_STATES
from typing import Optional

from backend.db import database
from backend.worker import create_bulk_collection_insertion, celery
from backend.routes.companies import (
    CompanyBatchOutput,
    fetch_companies_with_liked,
)

import logging

router = APIRouter(
    prefix="/collections",
    tags=["collections"],
)


class CompanyCollectionMetadata(BaseModel):
    id: uuid.UUID
    collection_name: str


class CompanyCollectionOutput(CompanyBatchOutput, CompanyCollectionMetadata):
    pass


class CompanyCollectionAssociationInput(BaseModel):
    company_ids: list[int] = []
    source_collection_id: Optional[uuid.UUID] = None


class BulkCompanyCollectionAssociationEnqueueOutput(BaseModel):
    task_id: uuid.UUID
    companies_queued_count: int


class BulkCompanyCollectionAssociationStatusOutput(BaseModel):
    task_id: uuid.UUID
    status: str
    task_count: int
    # TODO: Literal or enum, but those are more complicated due to the constant import
    status_breakdown: dict[str, int]


@router.get("", response_model=list[CompanyCollectionMetadata])
def get_all_collection_metadata(
    db: Session = Depends(database.get_db),
):
    collections = db.query(database.CompanyCollection).all()

    return [
        CompanyCollectionMetadata(
            id=collection.id,
            collection_name=collection.collection_name,
        )
        for collection in collections
    ]


@router.get("/{collection_id}", response_model=CompanyCollectionOutput)
def get_company_collection_by_id(
    collection_id: uuid.UUID,
    offset: int = Query(
        0, description="The number of items to skip from the beginning"
    ),
    limit: int = Query(10, description="The number of items to fetch"),
    db: Session = Depends(database.get_db),
):
    query = (
        db.query(database.CompanyCollectionAssociation, database.Company)
        .join(database.Company)
        .filter(database.CompanyCollectionAssociation.collection_id == collection_id)
    )

    total_count = query.with_entities(func.count()).scalar()

    results = query.offset(offset).limit(limit).all()
    companies = fetch_companies_with_liked(db, [company.id for _, company in results])

    return CompanyCollectionOutput(
        id=collection_id,
        collection_name=db.query(database.CompanyCollection)
        .get(collection_id)
        .collection_name,
        companies=companies,
        total=total_count,
    )


@router.post("/{collection_id}/companies/", status_code=status.HTTP_202_ACCEPTED)
def add_company_associations_to_collection(
    collection_id: uuid.UUID,
    company_associations: CompanyCollectionAssociationInput,
    db: Session = Depends(database.get_db),
) -> BulkCompanyCollectionAssociationEnqueueOutput:
    """Add a company to a collection. If you specify both company IDs and a source collection ID, the union of all company IDs will be taken."""

    company_ids = set(company_associations.company_ids)

    # TODO: should there be different behavior for small changes? (probably yes)
    if company_associations.source_collection_id:
        res = (
            db.query(database.CompanyCollectionAssociation.company_id)
            .filter(
                database.CompanyCollectionAssociation.collection_id
                == company_associations.source_collection_id
            )
            .all()
        )
        company_ids = company_ids.union([company_id[0] for company_id in res])

    if len(company_ids) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must choose at least one company to add to the collection.",
        )
    else:
        # Note that we convert company_ids back to a list since that is what is
        # expected by the Celery task, and since the ordering of elements matters therein
        task = create_bulk_collection_insertion(
            collection_id=collection_id, company_ids=list(company_ids)
        )
        priority = 0 if len(company_ids) < 5 else 1
        res = task.apply_async(priority=priority).save()

        return BulkCompanyCollectionAssociationEnqueueOutput(
            task_id=res.id,
            companies_queued_count=len(company_ids),
        )


@router.get("/bulk_operation/{task_id}")
def get_bulk_operation_status(
    task_id: str,
) -> BulkCompanyCollectionAssociationStatusOutput:
    """Get the current status of a bulk operation."""
    task_result = GroupResult.restore(task_id, app=celery)

    status_breakdown = dict.fromkeys(ALL_KNOWN_CELERY_STATES, 0)
    for task in task_result.results:
        if task.state in ALL_KNOWN_CELERY_STATES:
            status_breakdown[task.state] += 1
        else:
            logging.warning(f"Unknown task result state: {task.state}")

    return BulkCompanyCollectionAssociationStatusOutput(
        task_id=uuid.UUID(task_id),
        task_count=len(task_result.results),
        status=(
            "SUCCESS"
            if task_result.successful()
            else "FAILURE"
            if task_result.failed()
            else "PENDING"
        ),
        status_breakdown = status_breakdown,
    )
