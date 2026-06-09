from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_plain_session, get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.patient_institution import PatientInstitutionCreate, PatientInstitutionResponse
from app.services.patient_institution_service import PatientInstitutionService

router = APIRouter(prefix="/patient-institution", tags=["patient-institution"])


@router.post("/", response_model=PatientInstitutionResponse, status_code=201)
async def link_patient(
    body: PatientInstitutionCreate,
    token: TokenPayload = Depends(require_roles("secretary", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_plain_session),
):
    return await PatientInstitutionService(session).link(body, caller=token)


@router.get("/{patient_id}", response_model=list[PatientInstitutionResponse])
async def list_patient_institutions(
    patient_id: int,
    token: TokenPayload = Depends(
        require_roles("patient", "secretary", "institution_admin", "superadmin", "doctor")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PatientInstitutionService(session).list_by_patient(patient_id, caller=token)


@router.patch("/me/{institution_id}", status_code=204)
async def set_my_institution_access(
    institution_id: int,
    active: bool,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await PatientInstitutionService(session).set_self_access(token, institution_id, active)


@router.delete("/{patient_id}/{institution_id}", status_code=204)
async def unlink_patient(
    patient_id: int,
    institution_id: int,
    token: TokenPayload = Depends(require_roles("secretary", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    await PatientInstitutionService(session).unlink(patient_id, institution_id, caller=token)
