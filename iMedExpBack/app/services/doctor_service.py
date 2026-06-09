from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.core.exceptions import ConflictError, NotFoundError
from app.models.doctor import Doctor, DoctorShift
from app.repositories.doctor_repo import DoctorRepository
from app.models.user import User
from app.schemas.auth import TokenPayload
from app.schemas.doctor import (
    DoctorCreate,
    DoctorFullResponse,
    DoctorListResponse,
    DoctorResponse,
    DoctorStatusResponse,
    DoctorUpdate,
    ShiftCreate,
    ShiftResponse,
)
from app.utils.ownership import ensure_doctor_management_rights


class DoctorService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = DoctorRepository(session)

    def _verify_institution_admin(self, token):
        role = getattr(token, 'role', None)
        role_str = getattr(role, 'value', role) 

        if role_str != "institution_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado. Solo los administradores pueden ver la lista del personal médico."
            )

    async def get_institution_doctors(self, current_token):
        self._verify_institution_admin(current_token)

        user_id = getattr(current_token, 'id', None) or getattr(current_token, 'sub', None) or getattr(current_token, 'user_id', None)
        
        if not user_id:
            raise HTTPException(status_code=400, detail="No se pudo extraer el ID del usuario.")

        query_admin = select(User).where(User.id == int(user_id))
        result_admin = await self.session.execute(query_admin)
        db_user = result_admin.scalar_one_or_none()

        if not db_user or not db_user.institution_id:
            raise HTTPException(status_code=400, detail="El administrador no existe o no tiene clínica asignada.")

        query_doctors = (
            select(Doctor)
            .join(User)
            .options(selectinload(Doctor.user))
            .where(
                User.institution_id == db_user.institution_id,
                Doctor.deleted_at.is_(None),
            )
        )
        result_doctors = await self.session.execute(query_doctors)

        return result_doctors.scalars().all()

    async def create_doctor(self, data: DoctorCreate) -> DoctorResponse:
        existing = await self.repo.get_by_license(data.general_license)
        if existing:
            raise ConflictError("Ya existe un doctor registrado con esa cédula profesional")

        doctor = await self.repo.create(**data.model_dump())
        stmt = (
            select(Doctor)
            .options(selectinload(Doctor.user)) 
            .where(Doctor.id == doctor.id)
        )
        result = await self.session.execute(stmt)
        doctor_created = result.scalar_one()

        return DoctorResponse.from_orm_doctor(doctor_created)

    async def get_doctor(self, doctor_id: int) -> DoctorResponse:
        doctor = await self.repo.get_by_id(doctor_id)
        if not doctor or doctor.deleted_at:
            raise NotFoundError("Doctor no encontrado")
        return DoctorResponse.from_orm_doctor(doctor)

    async def get_full_profile(
        self,
        doctor_id: int,
        caller: TokenPayload | None = None,
    ) -> DoctorFullResponse:
        if caller is not None:
            await ensure_doctor_management_rights(self.session, caller, doctor_id)

        stmt = (
            select(Doctor)
            .options(
                selectinload(Doctor.user),
                selectinload(Doctor.shifts)
            )
            .where(Doctor.id == doctor_id, Doctor.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        doctor = result.scalar_one_or_none()

        if not doctor:
            raise NotFoundError("Doctor no encontrado")

        return DoctorFullResponse.from_orm_doctor(doctor)

    async def list_doctors(self, page: int = 1, limit: int = 20, institution_id: int | None = None) -> DoctorListResponse:
        limit = min(limit, 100)
        doctors, total = await self.repo.list_active_doctors(page, limit, institution_id)
        
        return DoctorListResponse(
            total=total,
            page=page,
            limit=limit,
            items=[DoctorResponse.from_orm_doctor(d) for d in doctors],
        )

    async def list_available_for_patient(
        self,
        token: TokenPayload,
        page: int = 1,
        limit: int = 20,
    ) -> DoctorListResponse:
        limit = min(limit, 100)
        offset = (page - 1) * limit
        available_result = await self.session.execute(
            text(
                """
                SELECT doctor_id, institution_id, clearance_level
                FROM fn_available_doctors_for_patient(:user_id)
                ORDER BY last_name, first_name, doctor_id
                OFFSET :offset
                LIMIT :limit
                """
            ),
            {
                "user_id": token.user_id,
                "offset": offset,
                "limit": limit,
            },
        )
        available_rows = list(available_result.mappings().all())
        doctor_ids = [int(row["doctor_id"]) for row in available_rows]
        institution_by_doctor = {
            int(row["doctor_id"]): int(row["institution_id"])
            for row in available_rows
        }
        clearance_by_doctor = {
            int(row["doctor_id"]): int(row["clearance_level"])
            for row in available_rows
        }

        doctors: list[Doctor] = []
        if doctor_ids:
            doctors_result = await self.session.execute(
                select(Doctor).where(Doctor.id.in_(doctor_ids))
            )
            doctor_by_id = {
                doctor.id: doctor for doctor in doctors_result.scalars().all()
            }
            doctors = [
                doctor_by_id[doctor_id]
                for doctor_id in doctor_ids
                if doctor_id in doctor_by_id
            ]

        count_result = await self.session.execute(
            text(
                """
                SELECT count(*)
                FROM fn_available_doctors_for_patient(:user_id)
                """
            ),
            {"user_id": token.user_id},
        )
        total = int(count_result.scalar_one())
        return DoctorListResponse(
            total=total,
            page=page,
            limit=limit,
            items=[
                DoctorResponse(
                    id=doctor.id,
                    user_id=doctor.user_id,
                    first_name=doctor.first_name,
                    last_name=doctor.last_name,
                    general_license=doctor.general_license,
                    specialty_id=doctor.specialty_id,
                    sub_specialty_id=doctor.sub_specialty_id,
                    specialty_license=doctor.specialty_license,
                    graduation_university=doctor.graduation_university,
                    contact_phone=doctor.contact_phone,
                    office_location=doctor.office_location,
                    institution_id=institution_by_doctor[doctor.id],
                    clearance_level=clearance_by_doctor[doctor.id],
                    is_active=True,
                    created_at=doctor.created_at,
                )
                for doctor in doctors
            ],
        )

    async def update_doctor(
        self,
        doctor_id: int,
        data: DoctorUpdate,
        caller: TokenPayload | None = None,
    ) -> DoctorResponse:
        if caller is not None:
            await ensure_doctor_management_rights(self.session, caller, doctor_id)

        fields = data.model_dump(exclude_none=True)
        if not fields:
            return await self.get_doctor(doctor_id)

        doctor = await self.repo.update_fields(doctor_id, fields)
        if not doctor:
            raise NotFoundError("Doctor no encontrado")

        return DoctorResponse.from_orm_doctor(doctor)

    async def delete_doctor(self, doctor_id: int) -> None:
        deleted = await self.repo.soft_delete(doctor_id)
        if not deleted:
            raise NotFoundError("Doctor no encontrado")

    async def set_doctor_active(self, doctor_id: int, is_active: bool) -> DoctorStatusResponse:
        result = await self.session.execute(
            text("SELECT fn_director_set_doctor_active(:did, :active)"),
            {"did": doctor_id, "active": is_active},
        )
        user_id = result.scalar_one()
        if user_id is None:
            raise NotFoundError("Doctor no encontrado o no pertenece a tu institución")
        return DoctorStatusResponse(doctor_id=doctor_id, user_id=user_id, is_active=is_active)

    async def unlink_doctor(self, doctor_id: int) -> None:
        result = await self.session.execute(
            text("SELECT fn_director_unlink_doctor(:did)"),
            {"did": doctor_id},
        )
        user_id = result.scalar_one()
        if user_id is None:
            raise NotFoundError("Doctor no encontrado o no pertenece a tu institución")


    async def add_shift(
        self,
        doctor_id: int,
        data: ShiftCreate,
        caller: TokenPayload | None = None,
    ) -> ShiftResponse:
        if caller is not None:
            await ensure_doctor_management_rights(self.session, caller, doctor_id)
        await self.get_doctor(doctor_id)

        weekday = data.weekday if data.weekday is not None else data.day_of_week
        if weekday is None:
            raise HTTPException(status_code=422, detail="weekday es obligatorio")

        institution_id = data.institution_id
        if institution_id is None:
            institution_result = await self.session.execute(
                text("SELECT fn_doctor_institution_id(:doctor_id)"),
                {"doctor_id": doctor_id},
            )
            institution_id = institution_result.scalar_one_or_none()
        if institution_id is None:
            raise HTTPException(
                status_code=422,
                detail="El médico no tiene una institución activa asignada.",
            )

        shift = DoctorShift(
            doctor_id=doctor_id,
            institution_id=institution_id,
            weekday=weekday,
            start_time=data.start_time,
            end_time=data.end_time,
            assigned_office=data.assigned_office or data.location or "Consultorio Propio",
            shift_type=data.shift_type or "Consulta",
        )
        self.session.add(shift)
        await self.session.flush()
        await self.session.refresh(shift)
        return ShiftResponse.model_validate(shift)

    async def get_doctor_shifts(self, doctor_id: int) -> list[ShiftResponse]:
        result = await self.session.execute(
            select(DoctorShift).where(DoctorShift.doctor_id == doctor_id)
        )
        shifts = result.scalars().all()
        return [ShiftResponse.model_validate(s) for s in shifts]
