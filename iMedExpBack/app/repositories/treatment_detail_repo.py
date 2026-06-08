from datetime import date
from sqlalchemy import select
from app.models.treatment_detail import TreatmentDetail
from app.repositories.base import BaseRepository


class TreatmentDetailRepository(BaseRepository[TreatmentDetail]):
    model = TreatmentDetail

    async def create(
        self,
        prescription_id: int,
        dosage: str,
        frequency: str,
        duration_days: int,
        start_date: date,
        medication_id: int | None = None,
        free_text_medication: str | None = None,
        additional_notes: str | None = None,
    ) -> TreatmentDetail:
        from datetime import timedelta

        calculated_end_date = start_date + timedelta(days=duration_days)
        treatment = TreatmentDetail(
            prescription_id=prescription_id,
            medication_id=medication_id,
            free_text_medication=free_text_medication,
            dosage=dosage,
            frequency=frequency,
            duration_days=duration_days,
            start_date=start_date,
            calculated_end_date=calculated_end_date,
            additional_notes=additional_notes,
        )
        self.session.add(treatment)
        await self.session.flush()
        await self.session.refresh(treatment)
        return treatment

    async def list_by_prescription(self, prescription_id: int) -> list[TreatmentDetail]:
        stmt = select(TreatmentDetail).where(
            TreatmentDetail.prescription_id == prescription_id
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_status(
        self, treatment_id: int, status: str
    ) -> TreatmentDetail | None:
        treatment = await self.get_by_id(treatment_id)
        if treatment:
            treatment.status = status
            await self.session.flush()
            await self.session.refresh(treatment)
        return treatment
