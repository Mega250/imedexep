from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.common import MessageResponse
from app.schemas.secretary import (
    SecretaryCreate,
    SecretaryDoctorAssign,
    SecretaryDoctorListResponse,
    SecretaryResponse,
    SecretaryUpdate,
)
from app.services.secretary_service import SecretaryService

router = APIRouter(prefix="/secretary", tags=["secretaries"])


@router.post(
    "/",
    response_model=SecretaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Secretary",
    description="Crea una nueva secretaria. El institution_id se toma automaticamente del token del director.",
)
async def create_secretary(
    data: SecretaryCreate,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).create_secretary(data, token)


@router.get(
    "/",
    response_model=List[SecretaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar secretarias de la clinica",
)
async def get_secretaries(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).get_institution_secretaries(token, skip, limit)


@router.get(
    "/me",
    response_model=SecretaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Perfil de secretaria actual",
)
async def get_my_secretary_profile(
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("secretary")),
):
    return await SecretaryService(db).get_my_profile(token)


@router.patch(
    "/me",
    response_model=SecretaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar perfil de secretaria actual",
)
async def update_my_secretary_profile(
    data: SecretaryUpdate,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("secretary")),
):
    return await SecretaryService(db).update_my_profile(data, token)


@router.get(
    "/assignments",
    response_model=List[SecretaryDoctorListResponse],
    summary="Listar asignaciones doctor-secretaria de la clinica",
)
async def get_all_assignments(
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).list_all_assignments(token)


@router.patch(
    "/{secretary_id}",
    response_model=SecretaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar secretaria",
)
async def update_secretary(
    secretary_id: int,
    data: SecretaryUpdate,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).update_secretary(secretary_id, data, token)


@router.delete(
    "/{secretary_id}",
    response_model=SecretaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Eliminar secretaria (soft delete)",
)
async def delete_secretary(
    secretary_id: int,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).delete_secretary(secretary_id, token)


@router.post(
    "/{secretary_id}/doctors",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Asignar doctor a secretaria",
)
async def assign_secretary_to_doctor(
    secretary_id: int,
    data: SecretaryDoctorAssign,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).assign_to_doctor(secretary_id, data, token)


@router.delete(
    "/{secretary_id}/doctors/{doctor_id}",
    response_model=MessageResponse,
    summary="Desasignar doctor de secretaria",
)
async def unassign_secretary_from_doctor(
    secretary_id: int,
    doctor_id: int,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("institution_admin")),
):
    return await SecretaryService(db).unassign_from_doctor(
        secretary_id, doctor_id, token
    )
