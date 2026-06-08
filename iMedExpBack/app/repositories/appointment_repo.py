from datetime import datetime
from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload
from app.models.appointment import Appointment, AppointmentStatus
from app.repositories.base import BaseRepository


class AppointmentRepository(BaseRepository[Appointment]):
    model = Appointment

    async def create(self, **kwargs) -> Appointment:
        appointment = Appointment(**kwargs)
        self.session.add(appointment)
        await self.session.flush()
        await self.session.refresh(appointment)
        return appointment

    async def get_by_id(self, record_id: int) -> Appointment | None:
        result = await self.session.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.doctor),
                selectinload(Appointment.institution),
            )
            .where(Appointment.id == record_id)
        )
        return result.scalar_one_or_none()

    async def list_active(
        self,
        page: int = 1,
        limit: int = 20,
        patient_id: int | None = None,
        doctor_id: int | None = None,
    ) -> tuple[list[Appointment], int]:
        offset = (page - 1) * limit

        stmt = (
            select(Appointment)
            .options(
                selectinload(Appointment.doctor),
                selectinload(Appointment.institution),
            )
            .where(Appointment.deleted_at.is_(None))
        )
        count_stmt = select(func.count()).select_from(Appointment).where(Appointment.deleted_at.is_(None))

        if patient_id:
            stmt = stmt.where(Appointment.patient_id == patient_id)
            count_stmt = count_stmt.where(Appointment.patient_id == patient_id)
        if doctor_id:
            stmt = stmt.where(Appointment.doctor_id == doctor_id)
            count_stmt = count_stmt.where(Appointment.doctor_id == doctor_id)

        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        result = await self.session.execute(
            stmt.order_by(Appointment.scheduled_at).offset(offset).limit(limit)
        )
        return list(result.scalars().all()), total

    async def update_fields(self, appointment_id: int, fields: dict) -> Appointment | None:
        stmt = (
            update(Appointment)
            .where(Appointment.id == appointment_id, Appointment.deleted_at.is_(None))
            .values(**fields)
        )
        await self.session.execute(stmt)
        await self.session.flush()
        self.session.expire_all()

        result = await self.session.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.doctor),
                selectinload(Appointment.institution),
            )
            .where(Appointment.id == appointment_id)
            .execution_options(populate_existing=True)
        )
        return result.scalar_one_or_none()

    async def is_slot_taken(
        self, doctor_id: int, scheduled_at: datetime, exclude_id: int | None = None
    ) -> bool:
        stmt = select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.scheduled_at == scheduled_at,
            Appointment.deleted_at.is_(None),
            Appointment.status.notin_(
                (AppointmentStatus.cancelled, AppointmentStatus.no_show)
            ),
        )
        if exclude_id:
            stmt = stmt.where(Appointment.id != exclude_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None
