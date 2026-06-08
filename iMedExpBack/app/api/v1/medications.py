from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_plain_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.medication import MedicationResponse
from app.services.medication_service import MedicationService

router = APIRouter(prefix="/medications", tags=["catalog"])

@router.get("/search", response_model=List[MedicationResponse])
async def search_medications(
    q: str = Query(..., min_length=2, description="Texto para autocompletar medicamento"),
    token: TokenPayload = Depends(
        require_roles(
            "patient",
            "doctor",
            "secretary",
            "institution_admin",
            "superadmin",
        )
    ),
    session: AsyncSession = Depends(get_plain_session)
):
    return await MedicationService(session).search_medications(q)
