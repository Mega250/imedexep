from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_plain_session, get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.patient import (
    PatientCreate, PatientFullResponse,
    PatientListResponse, PatientResponse, PatientUpdate,
)
from app.services.patient_service import PatientService
from app.utils.ownership import resolve_patient_id_for_token

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=PatientResponse, status_code=201)
async def create_patient(
    body: PatientCreate,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientService(session).create_patient(body)

@router.get("/", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientService(session).list_patients(page=page, limit=limit)

@router.get("/me", response_model=PatientResponse)
async def get_my_patient_profile(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    patient_id = await resolve_patient_id_for_token(session, token)
    return await PatientService(session).get_patient(patient_id, caller=token)


@router.get("/me/full", response_model=PatientFullResponse)
async def get_my_full_profile(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    patient_id = await resolve_patient_id_for_token(session, token)
    return await PatientService(session).get_full_profile(patient_id, caller=token)

@router.get("/by-curp/{curp}", response_model=PatientResponse)
async def get_patient_by_curp(
    curp: str,
    token: TokenPayload = Depends(
        require_roles("secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientService(session).get_patient_by_curp(curp)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientService(session).get_patient(patient_id, caller=token)

@router.get("/{patient_id}/full", response_model=PatientFullResponse)
async def get_full_profile(
    patient_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientService(session).get_full_profile(patient_id, caller=token)

@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    body: PatientUpdate,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientService(session).update_patient(patient_id, body, caller=token)

@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: int,
    token: TokenPayload = Depends(require_roles("doctor", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    await PatientService(session).delete_patient(patient_id)
