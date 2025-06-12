import uuid

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from psycopg2.errors import UniqueViolation, ForeignKeyViolation

from backend.db import database
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
    company_ids: list[int]


class CompanyCollectionAssociationOutput(BaseModel):
    collection_id: uuid.UUID
    company_id: int


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


@router.post("/{collection_id}/companies/")
def add_company_associations_to_collection(
    collection_id: uuid.UUID,
    company_associations: CompanyCollectionAssociationInput,
    db: Session = Depends(database.get_db),
) -> CompanyCollectionAssociationOutput:
    """Add a company to a collection."""

    if len(company_associations.company_ids) < 1:
        raise HTTPException(
            status_code=400,
            detail="You must list at least one company to add to the collection.",
        )
    elif len(company_associations.company_ids) == 1:
        association = database.CompanyCollectionAssociation(
            company_id=company_associations.company_ids[0],
            collection_id=collection_id,
        )
        try:
            db.add(association)
            db.commit()
        except IntegrityError as e:
            if isinstance(e.orig, UniqueViolation):
                raise HTTPException(
                    400, detail="This company is already in the collection."
                )
            elif isinstance(e.orig, ForeignKeyViolation):
                raise HTTPException(
                    400, detail="Either the company or the collection does not exist."
                )
            else:
                raise HTTPException(400, detail="An unknown error occurred.")
        return CompanyCollectionAssociationOutput(
            company_id=company_associations.company_ids[0], collection_id=collection_id
        )
    else:
        raise HTTPException(status_code=404, detail="In progress!")


@router.delete("/{collection_id}/companies/{company_id}", status_code=204)
def remove_company_from_collection(
    collection_id: uuid.UUID,
    company_id: int,
    db: Session = Depends(database.get_db),
):
    """Remove a company from a collection."""
    association = (
        db.query(database.CompanyCollectionAssociation)
        .filter(
            database.CompanyCollectionAssociation.collection_id == collection_id,
            database.CompanyCollectionAssociation.company_id == company_id,
        )
        .first()
    )

    if association is None:
        raise HTTPException(404, "Company not in colelction.")

    try:
        db.delete(association)
        db.commit()
    except SQLAlchemyError as e:
        logging.error("Exception in remove_company_from_collection.", exc_info=e)
        raise HTTPException(500, "Unknown error -- we're working on it.")
