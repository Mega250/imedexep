from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.vital_sign import VitalSignCreate, VitalSignResponse
from app.services.vital_sign_service import VitalSignService

router = APIRouter(prefix="/vitals", tags=["vital signs"])

@router.post("/", response_model=VitalSignResponse, status_code=201)
async def record_vitals(
    body: VitalSignCreate,
    token: TokenPayload = Depends(require_roles("patient", "doctor", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await VitalSignService(session).add_vitals(body, caller=token)

@router.get("/patient/{patient_id}", response_model=List[VitalSignResponse])
async def get_patient_vitals_history(
    patient_id: int,
    limit: int = Query(50, ge=1, le=100, description="Número de registros a recuperar"),
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await VitalSignService(session).get_patient_vitals(patient_id, limit, caller=token)

@router.get("/patient/{patient_id}/latest", response_model=VitalSignResponse)
async def get_latest_vitals(
    patient_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await VitalSignService(session).get_latest_vitals(patient_id, caller=token)
