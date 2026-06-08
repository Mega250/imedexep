from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload

from app.models.doctor import Doctor
from app.models.user import User
from app.repositories.base import BaseRepository

class DoctorRepository(BaseRepository[Doctor]):
    model = Doctor

    async def create(self, **kwargs) -> Doctor:
        doctor = Doctor(**kwargs)
        self.session.add(doctor)
        await self.session.flush()
        await self.session.refresh(doctor)
        return doctor

    async def get_by_id(self, record_id: int) -> Doctor | None:
        result = await self.session.execute(
            select(Doctor)
            .options(selectinload(Doctor.user))
            .where(Doctor.id == record_id)
        )
        return result.scalar_one_or_none()

    async def list_active_doctors(
        self, page: int = 1, limit: int = 20, institution_id: int | None = None
    ) -> tuple[list[Doctor], int]:
        offset = (page - 1) * limit
        filters = [Doctor.deleted_at.is_(None)]
        count_stmt = select(func.count()).select_from(Doctor)
        stmt = select(Doctor).options(selectinload(Doctor.user))

        if institution_id is not None:
            count_stmt = count_stmt.join(User, Doctor.user_id == User.id)
            stmt = stmt.join(User, Doctor.user_id == User.id)
            filters.append(User.institution_id == institution_id)

        count_stmt = count_stmt.where(*filters)
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()
        stmt = stmt.where(*filters).order_by(Doctor.last_name).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def get_by_license(self, license_str: str) -> Doctor | None:
        stmt = select(Doctor).where(
            Doctor.general_license == license_str, 
            Doctor.deleted_at.is_(None)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id_from_user(self, user_id: int) -> Doctor | None:
        stmt = select(Doctor).join(User).where(
            User.id == user_id,
            Doctor.deleted_at.is_(None)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_doctors_by_institution(self, institution_id: int):
        query = (
            select(Doctor)
            .join(User)
            .options(selectinload(Doctor.user))
            .where(User.institution_id == institution_id)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_fields(self, doctor_id: int, fields: dict) -> Doctor | None:
        if not fields:
            return await self.get_by_id(doctor_id)
            
        stmt = (
            update(Doctor)
            .where(
                Doctor.id == doctor_id,
                Doctor.deleted_at.is_(None)
            )
            .values(**fields)
            .returning(Doctor)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
