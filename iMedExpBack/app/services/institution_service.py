from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from sqlalchemy import select, func
from app.schemas.institution import InstitutionCreate, InstitutionUpdate, InstitutionResponse, InstitutionAdminCreate, InstitutionAdminUpdate, InstitutionAdminResponse
from app.repositories.institution_repo import InstitutionRepository
from app.models.user import User, UserRole
from app.models.institution import Institution
from app.schemas.auth import TokenPayload
from app.core.security import hash_password
from app.core.exceptions import ConflictError

class InstitutionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = InstitutionRepository(session)

    def _role_value(self, token: TokenPayload) -> str:
        role = getattr(token, "role", "")
        return getattr(role, "value", role)

    def _verify_superadmin(self, token: TokenPayload):
        if self._role_value(token) != UserRole.superadmin.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado. Se requieren permisos de Superadmin."
            )

    def _verify_institution_access(self, token: TokenPayload, institution_id: int):
        role = self._role_value(token)
        if role == UserRole.superadmin.value:
            return
        if role == UserRole.institution_admin.value and token.institution_id == institution_id:
            return
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado para esta institución."
        )

    async def create_institution(self, data: InstitutionCreate, token: TokenPayload) -> InstitutionResponse:
        self._verify_superadmin(token)

        trimmed_name = data.name.strip()
        existing = await self.session.execute(
            select(Institution).where(
                func.lower(func.trim(Institution.name)) == trimmed_name.lower(),
                Institution.deleted_at.is_(None),
            )
        )
        if existing.scalars().first():
            raise ConflictError("Ya existe una institución con ese nombre.")

        institution = await self.repo.create(obj_in=data)
        return InstitutionResponse.from_orm_institution(institution)

    async def get_all_institutions(self, token: TokenPayload,skip: int = 0, limit: int = 100) -> list[InstitutionResponse]:
        self._verify_superadmin(token)
        institutions = await self.repo.get_multi(skip=skip, limit=limit)
        return [InstitutionResponse.from_orm_institution(i) for i in institutions]

    async def get_institution_by_id(self, institution_id: int, token: TokenPayload) -> InstitutionResponse:
        self._verify_institution_access(token, institution_id)
        institution = await self.repo.get_by_id(id=institution_id)
        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"La institución con ID {institution_id} no existe o fue eliminada."
            )
        return InstitutionResponse.from_orm_institution(institution)

    async def update_institution(self, institution_id: int, data: InstitutionUpdate, token: TokenPayload) -> InstitutionResponse:
        self._verify_institution_access(token, institution_id)
        db_obj = await self.repo.get_by_id(id=institution_id)
        if not db_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No se puede actualizar. Institución no encontrada."
            )
        if self._role_value(token) == UserRole.institution_admin.value and data.is_active is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El estado activo de la institución sólo puede cambiarlo superadmin."
            )

        updated_institution = await self.repo.update(db_obj=db_obj, obj_in=data)
        return InstitutionResponse.from_orm_institution(updated_institution)

    async def delete_institution(self, institution_id: int, token: TokenPayload) -> InstitutionResponse:
        self._verify_superadmin(token)
        institution = await self.repo.remove(id=institution_id)
        if not institution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No se puede eliminar. Institución no encontrada."
            )
        return InstitutionResponse.from_orm_institution(institution)
    
    async def create_institution_admin(self, institution_id: int, data: InstitutionAdminCreate, token: TokenPayload) -> dict:
        self._verify_superadmin(token)

        inst = await self.repo.get_by_id(id=institution_id)
        if not inst:
            raise HTTPException(status_code=404, detail="Institución no encontrada.")

        result = await self.session.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="El correo ya está en uso.")

        hashed_pwd = hash_password(data.password) 

        new_admin = User(
            email=data.email,
            password_hash=hashed_pwd,
            role=UserRole.institution_admin,
            institution_id=institution_id,
            access_attributes={"admin_name": data.admin_name},
            is_active=True,
            email_verified=True,
        )
        
        self.session.add(new_admin)
        await self.session.flush() 
        await self.session.refresh(new_admin)

        return InstitutionAdminResponse.from_orm_user(new_admin).model_dump()

    async def update_institution_admin(self, institution_id: int, admin_id: int, data: InstitutionAdminUpdate, token: TokenPayload) -> dict:
        self._verify_superadmin(token)
        query = select(User).where(
            User.id == admin_id,
            User.institution_id == institution_id,
            User.role == UserRole.institution_admin,
            User.deleted_at.is_(None)
        )
        result = await self.session.execute(query)
        admin = result.scalar_one_or_none()
        
        if not admin:
            raise HTTPException(status_code=404, detail="Administrador no encontrado en esta institución.")

        if data.email and data.email != admin.email:
            email_check = await self.session.execute(select(User).where(User.email == data.email))
            if email_check.scalar_one_or_none():
                raise HTTPException(status_code=409, detail="El nuevo correo ya está en uso.")
            admin.email = data.email

        if data.password:
            admin.password_hash = hash_password(data.password)

        if data.admin_name:
            attrs = dict(admin.access_attributes)
            attrs["admin_name"] = data.admin_name
            admin.access_attributes = attrs

        if data.is_active is not None:
            admin.is_active = data.is_active

        await self.session.flush()

        return InstitutionAdminResponse.from_orm_user(admin).model_dump()

    async def delete_institution_admin(self, institution_id: int, admin_id: int, token: TokenPayload) -> dict:
        self._verify_superadmin(token)

        query = select(User).where(
            User.id == admin_id,
            User.institution_id == institution_id,
            User.role == UserRole.institution_admin,
            User.deleted_at.is_(None)
        )
        result = await self.session.execute(query)
        admin = result.scalar_one_or_none()
        
        if not admin:
            raise HTTPException(status_code=404, detail="Administrador no encontrado.")

        admin.is_active = False
        admin.deleted_at = func.now()

        await self.session.flush()

        return {"message": f"Administrador {admin.email} eliminado lógicamente."}

    async def get_institution_admins(self, institution_id: int, token: TokenPayload, skip: int = 0, limit: int = 100) -> list[dict]:
        self._verify_superadmin(token)

        inst = await self.repo.get_by_id(id=institution_id)
        if not inst:
            raise HTTPException(status_code=404, detail="Institución no encontrada.")

        query = select(User).where(
            User.institution_id == institution_id,
            User.role == UserRole.institution_admin,
            User.deleted_at.is_(None)
        ).offset(skip).limit(limit)

        result = await self.session.execute(query)
        admins = result.scalars().all()

        return [InstitutionAdminResponse.from_orm_user(admin).model_dump() for admin in admins]
