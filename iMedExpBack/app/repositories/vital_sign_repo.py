from sqlalchemy import select
from app.models.vital_sign import VitalSign
from app.repositories.base import BaseRepository

class VitalSignRepository(BaseRepository[VitalSign]):
    model = VitalSign

    async def create(self, **kwargs) -> VitalSign:
        
        vital = VitalSign(**kwargs)
        self.session.add(vital)
        await self.session.flush()
        await self.session.refresh(vital)
        return vital

    async def get_by_patient(self, patient_id: int, limit: int = 50) -> list[VitalSign]:
        
        stmt = (
            select(VitalSign)
            .where(VitalSign.patient_id == patient_id)
            .order_by(VitalSign.recorded_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_latest_by_patient(self, patient_id: int) -> VitalSign | None:
        stmt = (
            select(VitalSign)
            .where(VitalSign.patient_id == patient_id)
            .order_by(VitalSign.recorded_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()