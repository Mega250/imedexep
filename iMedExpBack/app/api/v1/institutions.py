from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.common import MessageResponse
from app.schemas.institution import InstitutionCreate, InstitutionUpdate, InstitutionResponse, InstitutionAdminResponse, InstitutionAdminCreate, InstitutionAdminUpdate
from app.services.institution_service import InstitutionService

router = APIRouter(
    prefix="/institutions",
    tags=["institutions"]
)
@router.post("/", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
async def create_institution(
    body: InstitutionCreate, 
    token: TokenPayload = Depends(require_roles("superadmin")),
    session: AsyncSession = Depends(get_rls_session)
):
    return await InstitutionService(session).create_institution(body, token)

@router.post("/{institution_id}/admins", response_model=InstitutionAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    institution_id: int,
    body: InstitutionAdminCreate,
    token: TokenPayload = Depends(require_roles("superadmin")),
    session: AsyncSession = Depends(get_rls_session)
):
    return await InstitutionService(session).create_institution_admin(institution_id, body, token)

@router.get("/", response_model=list[InstitutionResponse])
async def list_institutions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    token: TokenPayload = Depends(require_roles("superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await InstitutionService(session).get_all_institutions(token, skip=skip, limit=limit)

@router.get("/{institution_id}", response_model=InstitutionResponse)
async def get_institution(
    institution_id: int, 
    token: TokenPayload = Depends(require_roles("superadmin", "institution_admin")),
    session: AsyncSession = Depends(get_rls_session)
):
    return await InstitutionService(session).get_institution_by_id(institution_id, token)

@router.patch("/{institution_id}", response_model=InstitutionResponse)
async def update_institution(
    institution_id: int, 
    body: InstitutionUpdate, 
    token: TokenPayload = Depends(require_roles("superadmin", "institution_admin")),
    session: AsyncSession = Depends(get_rls_session)
):
    return await InstitutionService(session).update_institution(institution_id, body, token)

@router.delete("/{institution_id}", response_model=InstitutionResponse)
async def delete_institution(
    institution_id: int,
    token: TokenPayload = Depends(require_roles("superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await InstitutionService(session).delete_institution(institution_id, token)

@router.patch(
    "/{institution_id}/admins/{admin_id}", 
    response_model=InstitutionAdminResponse,
    summary="Update institution_admin"
)
async def update_institution_admin(
    institution_id: int,
    admin_id: int,
    admin_in: InstitutionAdminUpdate,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("superadmin"))
):
    service = InstitutionService(db)
    return await service.update_institution_admin(institution_id, admin_id, admin_in, token)


@router.delete(
    "/{institution_id}/admins/{admin_id}", 
    response_model=MessageResponse,
    summary="Delete institution_admin"
)
async def delete_institution_admin(
    institution_id: int,
    admin_id: int,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("superadmin"))
):
    service = InstitutionService(db)
    return await service.delete_institution_admin(institution_id, admin_id, token)

@router.get(
    "/{institution_id}/admins",
    status_code=status.HTTP_200_OK,
    summary="Listar Administradores de Institución",
    description="Devuelve una lista de todos los directores activos asignados a una clínica."
)
async def get_institution_admins(
    institution_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_rls_session),
    token: TokenPayload = Depends(require_roles("superadmin"))
):
    service = InstitutionService(db)
    return await service.get_institution_admins(institution_id, token, skip, limit)
