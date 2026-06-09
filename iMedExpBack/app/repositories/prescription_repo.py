from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.prescription import Prescription
from app.models.treatment_detail import TreatmentDetail
from app.models.doctor import Doctor
from app.repositories.base import BaseRepository
from datetime import datetime, timezone

class PrescriptionRepository(BaseRepository[Prescription]):
    model = Prescription

    async def create(
        self,
        consultation_id: int,
        patient_id: int,
        doctor_id: int,
        general_instructions: str | None = None,
    ) -> Prescription:
        prescription = Prescription(
            consultation_id=consultation_id,
            patient_id=patient_id,
            doctor_id=doctor_id,
            general_instructions=general_instructions,
        )
        self.session.add(prescription)
        await self.session.flush()
        await self.session.refresh(prescription)
        return prescription

    async def get_by_id_full(self, prescription_id: int) -> Prescription | None:
        stmt = (
            select(Prescription)
            .options(
                selectinload(Prescription.treatments),
                selectinload(Prescription.doctor).selectinload(Doctor.user),
                selectinload(Prescription.patient),
            )
            .where(Prescription.id == prescription_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_consultation(self, consultation_id: int) -> Prescription | None:
        stmt = (
            select(Prescription)
            .options(
                selectinload(Prescription.treatments),
                selectinload(Prescription.doctor).selectinload(Doctor.user),
                selectinload(Prescription.patient),
            )
            .where(Prescription.consultation_id == consultation_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def sign(self, prescription_id: int, signature_hash: str) -> Prescription | None:
        prescription = await self.get_by_id(prescription_id)
        if prescription:
            prescription.signature_hash = signature_hash
            prescription.signed_at = datetime.now(timezone.utc)
            await self.session.flush()
            await self.session.refresh(prescription)
        return prescription