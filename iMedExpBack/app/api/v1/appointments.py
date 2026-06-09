from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentListResponse,
    AppointmentResponse,
    AppointmentUpdate,
)
from app.schemas.auth import TokenPayload
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    body: AppointmentCreate,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await AppointmentService(session).create_appointment(body, caller=token)


@router.get("/", response_model=AppointmentListResponse)
async def list_appointments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    patient_id: int | None = Query(None),
    doctor_id: int | None = Query(None),
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await AppointmentService(session).list_appointments(
        page=page,
        limit=limit,
        patient_id=patient_id,
        doctor_id=doctor_id,
        caller=token,
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await AppointmentService(session).get_appointment(
        appointment_id, caller=token
    )


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    body: AppointmentUpdate,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await AppointmentService(session).update_appointment(
        appointment_id, body, caller=token
    )


@router.delete("/{appointment_id}", status_code=204)
async def cancel_appointment(
    appointment_id: int,
    token: TokenPayload = Depends(
        require_roles("secretary", "institution_admin", "superadmin", "doctor")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    await AppointmentService(session).cancel_appointment(
        appointment_id, caller=token
    )
