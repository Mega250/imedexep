from sqlalchemy import select
from app.models.consultation import Consultation
from app.repositories.base import BaseRepository


class ConsultationRepository(BaseRepository[Consultation]):
    model = Consultation

    async def create(
        self,
        institution_id: int,
        patient_id: int,
        doctor_id: int,
        appointment_id: int | None = None,
        chief_complaint: str | None = None,
        symptoms: str | None = None,
        medical_notes: str | None = None,
        sensitivity_level: int = 1,
        specialty_data: dict | None = None,
    ) -> Consultation:
        consultation = Consultation(
            institution_id=institution_id,
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            chief_complaint=chief_complaint,
            symptoms=symptoms,
            medical_notes=medical_notes,
            sensitivity_level=sensitivity_level,
            specialty_data=specialty_data,
        )
        self.session.add(consultation)
        await self.session.flush()
        await self.session.refresh(consultation)
        return consultation

    async def list_active(
        self,
        page: int = 1,
        limit: int = 20,
        patient_id: int | None = None,
        doctor_id: int | None = None,
    ) -> tuple[list[Consultation], int]:
        offset = (page - 1) * limit
        from sqlalchemy import func

        stmt = select(Consultation).where(Consultation.is_current.is_(True))
        count_stmt = select(func.count()).where(Consultation.is_current.is_(True))

        if patient_id is not None:
            stmt = stmt.where(Consultation.patient_id == patient_id)
            count_stmt = count_stmt.where(Consultation.patient_id == patient_id)

        if doctor_id is not None:
            stmt = stmt.where(Consultation.doctor_id == doctor_id)
            count_stmt = count_stmt.where(Consultation.doctor_id == doctor_id)

        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()
        result = await self.session.execute(
            stmt.order_by(Consultation.consulted_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars().all()), total
