from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_plain_session, get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.doctor import (
    DoctorActiveUpdate,
    DoctorCreate,
    DoctorFullResponse,
    DoctorListResponse,
    DoctorResponse,
    DoctorStatusResponse,
    DoctorUpdate,
    ShiftCreate,
    ShiftResponse,
)
from app.services.doctor_service import DoctorService
from app.utils.cedula import verify_cedula as verify_cedula_sep

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("/verify-cedula", summary="Verificar cédula profesional en la SEP")
async def verify_cedula(cedula: str = Query(..., min_length=6, max_length=12)):
    result = await verify_cedula_sep(cedula)
    return {
        "status": result.status,
        "titulo": result.titulo,
        "area": result.area,
        "nombre": result.nombre,
        "paterno": result.paterno,
        "materno": result.materno,
        "institucion": result.institucion,
        "anio": result.anio,
    }


@router.post("/", response_model=DoctorResponse, status_code=201)
async def create_doctor(
    body: DoctorCreate,
    token: TokenPayload = Depends(require_roles("institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session)
):
    return await DoctorService(session).create_doctor(body)

@router.get("/", response_model=DoctorListResponse)
async def list_doctors(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    institution_id: int | None = Query(None),
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await DoctorService(session).list_doctors(
        page=page,
        limit=limit,
        institution_id=institution_id
    )


@router.get("/available", response_model=DoctorListResponse)
async def list_available_doctors(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_plain_session),
):
    return await DoctorService(session).list_available_for_patient(
        token, page=page, limit=limit
    )


@router.get("/institution", response_model=List[DoctorResponse])
async def list_institution_doctors(
    current_token: TokenPayload = Depends(require_roles("institution_admin")),
    session: AsyncSession = Depends(get_rls_session)
):
    service = DoctorService(session)
    doctors = await service.get_institution_doctors(current_token)
    return doctors

@router.get("/{doctor_id:int}", response_model=DoctorResponse)
async def get_doctor(
    doctor_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session)
):
    return await DoctorService(session).get_doctor(doctor_id)

@router.get("/{doctor_id:int}/full", response_model=DoctorFullResponse)
async def get_full_doctor_profile(
    doctor_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session)
):
    return await DoctorService(session).get_full_profile(doctor_id, caller=token)

@router.patch("/{doctor_id:int}", response_model=DoctorResponse)
async def update_doctor(
    doctor_id: int,
    body: DoctorUpdate,
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session)
):
    return await DoctorService(session).update_doctor(doctor_id, body, caller=token)

@router.delete("/{doctor_id:int}", status_code=204)
async def delete_doctor(
    doctor_id: int,
    token: TokenPayload = Depends(require_roles("institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    await DoctorService(session).delete_doctor(doctor_id)

@router.patch("/{doctor_id:int}/active", response_model=DoctorStatusResponse)
async def set_doctor_active(
    doctor_id: int,
    body: DoctorActiveUpdate,
    token: TokenPayload = Depends(require_roles("institution_admin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await DoctorService(session).set_doctor_active(doctor_id, body.is_active)

@router.delete("/{doctor_id:int}/institution", status_code=204)
async def unlink_doctor_from_institution(
    doctor_id: int,
    token: TokenPayload = Depends(require_roles("institution_admin")),
    session: AsyncSession = Depends(get_rls_session),
):
    await DoctorService(session).unlink_doctor(doctor_id)

@router.post("/{doctor_id:int}/shifts", response_model=ShiftResponse, status_code=201)
async def add_doctor_shift(
    doctor_id: int,
    body: ShiftCreate,
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await DoctorService(session).add_shift(doctor_id, body, caller=token)

@router.get("/{doctor_id:int}/shifts", response_model=list[ShiftResponse])
async def get_doctor_shifts(
    doctor_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "secretary", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session)
):
    return await DoctorService(session).get_doctor_shifts(doctor_id)
