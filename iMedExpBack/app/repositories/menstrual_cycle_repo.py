from sqlalchemy import select

from app.models.menstrual_cycle import MenstrualCycle
from app.repositories.base import BaseRepository


class MenstrualCycleRepository(BaseRepository[MenstrualCycle]):
    model = MenstrualCycle

    async def create(self, **kwargs) -> MenstrualCycle:
        cycle = MenstrualCycle(**kwargs)
        self.session.add(cycle)
        await self.session.flush()
        await self.session.refresh(cycle)
        return cycle

    async def get_active_by_id(self, cycle_id: int) -> MenstrualCycle | None:
        result = await self.session.execute(
            select(MenstrualCycle).where(
                MenstrualCycle.id == cycle_id,
                MenstrualCycle.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def update(
        self,
        cycle_id: int,
        period_start_date,
        period_end_date,
        flow,
    ) -> MenstrualCycle | None:
        cycle = await self.get_active_by_id(cycle_id)
        if not cycle:
            return None
        cycle.period_start_date = period_start_date
        cycle.period_end_date = period_end_date
        cycle.flow = flow
        await self.session.flush()
        await self.session.refresh(cycle)
        return cycle

    async def get_duplicate(self, patient_id: int, period_start_date) -> MenstrualCycle | None:
        result = await self.session.execute(
            select(MenstrualCycle).where(
                MenstrualCycle.patient_id == patient_id,
                MenstrualCycle.period_start_date == period_start_date,
                MenstrualCycle.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_patient(self, patient_id: int, limit: int = 24) -> list[MenstrualCycle]:
        result = await self.session.execute(
            select(MenstrualCycle)
            .where(
                MenstrualCycle.patient_id == patient_id,
                MenstrualCycle.deleted_at.is_(None),
            )
            .order_by(MenstrualCycle.period_start_date.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
