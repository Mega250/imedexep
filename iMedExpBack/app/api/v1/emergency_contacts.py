from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.emergency_contact import (
    EmergencyContactCreate,
    EmergencyContactResponse,
    EmergencyContactUpdate,
)
from app.services.emergency_contact_service import EmergencyContactService

router = APIRouter(prefix="/emergency-contacts", tags=["emergency-contacts"])


@router.post("/{patient_id}", response_model=EmergencyContactResponse, status_code=201)
async def create_contact(
    patient_id: int,
    body: EmergencyContactCreate,
    token: TokenPayload = Depends(require_roles("secretary", "institution_admin", "superadmin", "patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await EmergencyContactService(session).create(patient_id, body, caller=token)


@router.get("/{patient_id}", response_model=list[EmergencyContactResponse])
async def list_contacts(
    patient_id: int,
    token: TokenPayload = Depends(
        require_roles("patient", "secretary", "institution_admin", "superadmin", "doctor")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await EmergencyContactService(session).list_by_patient(patient_id, caller=token)


@router.patch("/{contact_id}", response_model=EmergencyContactResponse)
async def update_contact(
    contact_id: int,
    body: EmergencyContactUpdate,
    token: TokenPayload = Depends(
        require_roles("patient", "secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await EmergencyContactService(session).update(contact_id, body, caller=token)


@router.delete("/{contact_id}", status_code=204)
async def delete_contact(
    contact_id: int,
    token: TokenPayload = Depends(require_roles("secretary", "institution_admin", "superadmin", "patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await EmergencyContactService(session).delete(contact_id, caller=token)
