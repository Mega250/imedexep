from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.security import hash_password
from app.models.doctor import Doctor
from app.models.secretary import Secretary, SecretaryDoctor
from app.models.user import User, UserRole
from app.schemas.auth import TokenPayload
from app.schemas.secretary import (
    SecretaryCreate,
    SecretaryDoctorAssign,
    SecretaryUpdate,
)


class SecretaryService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _role_value(self, token: TokenPayload) -> str:
        role = getattr(token, "role", "")
        return getattr(role, "value", role)

    def _verify_institution_admin(self, token: TokenPayload):
        if self._role_value(token) != UserRole.institution_admin.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado. Solo los directores de clinica pueden gestionar secretarias.",
            )

    def _token_user_id(self, token: TokenPayload) -> int:
        raw = getattr(token, "user_id", None) or getattr(token, "id", None) or getattr(token, "sub", None)
        if raw is None:
            raise HTTPException(status_code=401, detail="No se pudo identificar la sesion.")
        return int(raw)

    def _secretary_response(self, secretary: Secretary, user: User) -> dict:
        return {
            **secretary.__dict__,
            "email": user.email,
            "is_active": user.is_active,
        }

    async def create_secretary(self, data: SecretaryCreate, token: TokenPayload) -> dict:
        self._verify_institution_admin(token)
        institution_id = token.institution_id

        result = await self.session.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="El correo ya esta en uso.")

        new_user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            role=UserRole.secretary,
            institution_id=institution_id,
            is_active=True,
            email_verified=True,
            access_attributes={"display_name": f"{data.first_name} {data.last_name}".strip()},
        )
        self.session.add(new_user)
        await self.session.flush()

        new_secretary = Secretary(
            user_id=new_user.id,
            first_name=data.first_name,
            last_name=data.last_name,
            employee_number=data.employee_number,
            contact_phone=data.contact_phone,
        )
        self.session.add(new_secretary)
        await self.session.flush()
        await self.session.refresh(new_secretary)

        return self._secretary_response(new_secretary, new_user)

    async def get_my_profile(self, token: TokenPayload) -> dict:
        if self._role_value(token) != UserRole.secretary.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo secretaria.")

        query = select(Secretary, User).join(User, Secretary.user_id == User.id).where(
            Secretary.user_id == self._token_user_id(token),
            Secretary.deleted_at.is_(None),
        )
        row = (await self.session.execute(query)).one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Perfil de secretaria no encontrado.")
        secretary, user = row
        return self._secretary_response(secretary, user)

    async def update_my_profile(self, data: SecretaryUpdate, token: TokenPayload) -> dict:
        if self._role_value(token) != UserRole.secretary.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo secretaria.")

        query = select(Secretary, User).join(User, Secretary.user_id == User.id).where(
            Secretary.user_id == self._token_user_id(token),
            Secretary.deleted_at.is_(None),
        )
        row = (await self.session.execute(query)).one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Perfil de secretaria no encontrado.")

        secretary, user = row
        fields = data.model_dump(exclude_none=True)
        fields.pop("is_active", None)
        for key, value in fields.items():
            setattr(secretary, key, value)

        attrs = dict(user.access_attributes or {})
        attrs["display_name"] = f"{secretary.first_name} {secretary.last_name}".strip()
        user.access_attributes = attrs

        await self.session.flush()
        await self.session.refresh(secretary)
        return self._secretary_response(secretary, user)

    async def delete_secretary(self, secretary_id: int, token: TokenPayload) -> dict:
        self._verify_institution_admin(token)

        query = select(Secretary).join(User).where(
            Secretary.id == secretary_id,
            User.institution_id == token.institution_id,
            Secretary.deleted_at.is_(None),
        )
        secretary = (await self.session.execute(query)).scalar_one_or_none()
        if not secretary:
            raise HTTPException(status_code=404, detail="Secretaria no encontrada o ya eliminada.")

        user = (await self.session.execute(select(User).where(User.id == secretary.user_id))).scalar_one()

        current_time = datetime.now(timezone.utc)
        secretary.deleted_at = func.now()
        user.is_active = False
        user.deleted_at = current_time

        await self.session.flush()

        response = self._secretary_response(secretary, user)
        response["deleted_at"] = current_time
        return response

    async def update_secretary(self, secretary_id: int, data: SecretaryUpdate, token: TokenPayload) -> dict:
        self._verify_institution_admin(token)

        query = select(Secretary, User).join(User, Secretary.user_id == User.id).where(
            Secretary.id == secretary_id,
            User.institution_id == token.institution_id,
            Secretary.deleted_at.is_(None),
        )
        row = (await self.session.execute(query)).one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Secretaria no encontrada.")

        secretary, user = row
        fields = data.model_dump(exclude_none=True)
        is_active = fields.pop("is_active", None)
        for key, value in fields.items():
            setattr(secretary, key, value)

        if is_active is not None:
            user.is_active = is_active

        await self.session.flush()
        await self.session.refresh(secretary)
        return self._secretary_response(secretary, user)

    async def get_institution_secretaries(self, token: TokenPayload, skip: int = 0, limit: int = 100) -> list[dict]:
        self._verify_institution_admin(token)

        query = select(Secretary, User).join(User, Secretary.user_id == User.id).where(
            User.institution_id == token.institution_id,
            Secretary.deleted_at.is_(None),
        ).offset(skip).limit(limit)

        result = await self.session.execute(query)
        return [self._secretary_response(sec, user) for sec, user in result.all()]

    async def assign_to_doctor(self, secretary_id: int, data: SecretaryDoctorAssign, token: TokenPayload) -> dict:
        self._verify_institution_admin(token)

        sec_query = select(Secretary).join(User).where(
            Secretary.id == secretary_id,
            User.institution_id == token.institution_id,
        )
        if not (await self.session.execute(sec_query)).scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Secretaria no encontrada en tu clinica.")

        doc_query = select(Doctor).join(User).where(
            Doctor.id == data.doctor_id,
            User.institution_id == token.institution_id,
        )
        if not (await self.session.execute(doc_query)).scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Doctor no encontrado en tu clinica.")

        assign_query = select(SecretaryDoctor).where(
            SecretaryDoctor.secretary_id == secretary_id,
            SecretaryDoctor.doctor_id == data.doctor_id,
        )
        existing = (await self.session.execute(assign_query)).scalar_one_or_none()
        if existing and existing.deleted_at is None:
            raise HTTPException(status_code=400, detail="Esta asignacion ya existe y esta activa.")
        if existing:
            existing.deleted_at = None
            existing.assigned_by_user_id = self._token_user_id(token)
            await self.session.flush()
            return {"message": "Asignacion reactivada con exito."}

        new_assignment = SecretaryDoctor(
            secretary_id=secretary_id,
            doctor_id=data.doctor_id,
            assigned_by_user_id=self._token_user_id(token),
        )
        self.session.add(new_assignment)
        await self.session.flush()
        return {"message": "Asignacion realizada con exito."}

    async def unassign_from_doctor(
        self,
        secretary_id: int,
        doctor_id: int,
        token: TokenPayload,
    ) -> dict:
        self._verify_institution_admin(token)
        query = (
            select(SecretaryDoctor)
            .join(Secretary, SecretaryDoctor.secretary_id == Secretary.id)
            .join(User, Secretary.user_id == User.id)
            .where(
                SecretaryDoctor.secretary_id == secretary_id,
                SecretaryDoctor.doctor_id == doctor_id,
                SecretaryDoctor.deleted_at.is_(None),
                User.institution_id == token.institution_id,
            )
        )
        assignment = (await self.session.execute(query)).scalar_one_or_none()
        if not assignment:
            raise HTTPException(
                status_code=404,
                detail="Asignacion activa no encontrada en tu clinica.",
            )
        assignment.deleted_at = func.now()
        await self.session.flush()
        return {"message": "Asignacion eliminada con exito."}

    async def list_all_assignments(self, token: TokenPayload):
        self._verify_institution_admin(token)

        query = (
            select(SecretaryDoctor)
            .join(Secretary, SecretaryDoctor.secretary_id == Secretary.id)
            .join(User, Secretary.user_id == User.id)
            .join(Doctor, SecretaryDoctor.doctor_id == Doctor.id)
            .options(
                joinedload(SecretaryDoctor.secretary),
                joinedload(SecretaryDoctor.doctor).joinedload(Doctor.user),
            )
            .where(User.institution_id == token.institution_id)
            .where(SecretaryDoctor.deleted_at.is_(None))
        )

        result = await self.session.execute(query)
        assignments = result.scalars().all()

        return [
            {
                "id": a.id,
                "secretary_id": a.secretary_id,
                "secretary_name": f"{a.secretary.first_name} {a.secretary.last_name}",
                "doctor_id": a.doctor_id,
                "doctor_name": f"Dr. {a.doctor.first_name} {a.doctor.last_name}".strip(),
                "assigned_by_user_id": a.assigned_by_user_id,
                "created_at": a.created_at,
            }
            for a in assignments
        ]
