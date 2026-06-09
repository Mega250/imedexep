from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_plain_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.disease import DiseaseEnsureRequest, DiseaseResponse
from app.services.disease_service import DiseaseService

router = APIRouter(prefix="/diseases", tags=["catalog"])


@router.get("/search", response_model=List[DiseaseResponse])
async def search_diseases(
    q: str = Query(..., min_length=2, description="Texto para autocompletar enfermedad o código CIE-10"),
    token: TokenPayload = Depends(
        require_roles(
            "patient",
            "doctor",
            "secretary",
            "institution_admin",
            "superadmin",
        )
    ),
    session: AsyncSession = Depends(get_plain_session),
):
    return await DiseaseService(session).search(q)


@router.post("/ensure", response_model=DiseaseResponse, status_code=201)
async def ensure_disease(
    body: DiseaseEnsureRequest,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_plain_session),
):
    return await DiseaseService(session).ensure_from_free_text(body.name, body.cie10_code)


@router.get("/{disease_id:int}", response_model=DiseaseResponse)
async def get_disease(
    disease_id: int,
    token: TokenPayload = Depends(
        require_roles(
            "patient",
            "doctor",
            "secretary",
            "institution_admin",
            "superadmin",
        )
    ),
    session: AsyncSession = Depends(get_plain_session),
):
    return await DiseaseService(session).get(disease_id)
