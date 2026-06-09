from sqlalchemy import func, or_, select

from app.models.medication import Medication
from app.repositories.base import BaseRepository

class MedicationRepository(BaseRepository[Medication]):
    model = Medication

    async def search_by_name(self, query_text: str, limit: int = 20) -> list[Medication]:
        pattern = f"%{query_text}%"
        stmt = (
            select(Medication)
            .where(
                or_(
                    Medication.generic_name.ilike(pattern),
                    Medication.commercial_name.ilike(pattern),
                    Medication.presentation.ilike(pattern),
                    Medication.administration_route.ilike(pattern),
                )
            )
            .order_by(Medication.generic_name, Medication.commercial_name)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_exact(
        self,
        generic_name: str,
        commercial_name: str | None = None,
    ) -> Medication | None:
        stmt = select(Medication).where(
            func.lower(func.trim(Medication.generic_name)) == generic_name.strip().lower()
        )
        if commercial_name:
            stmt = stmt.where(
                func.lower(func.trim(Medication.commercial_name)) == commercial_name.strip().lower()
            )
        result = await self.session.execute(stmt.limit(1))
        return result.scalar_one_or_none()

    async def create_catalog_item(
        self,
        generic_name: str,
        commercial_name: str | None = None,
        presentation: str | None = None,
        administration_route: str | None = None,
    ) -> Medication:
        medication = Medication(
            generic_name=generic_name.strip(),
            commercial_name=commercial_name.strip() if commercial_name else None,
            presentation=presentation.strip() if presentation else None,
            administration_route=administration_route.strip() if administration_route else None,
        )
        self.session.add(medication)
        await self.session.flush()
        await self.session.refresh(medication)
        return medication
