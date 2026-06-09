from sqlalchemy import func, or_, select

from app.models.catalog import Disease
from app.repositories.base import BaseRepository


class DiseaseRepository(BaseRepository[Disease]):
    model = Disease

    async def search_by_name(self, query_text: str, limit: int = 20) -> list[Disease]:
        pattern = f"%{query_text}%"
        stmt = (
            select(Disease)
            .where(
                or_(
                    Disease.name.ilike(pattern),
                    Disease.cie10_code.ilike(pattern),
                )
            )
            .order_by(Disease.name)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_exact(self, name: str) -> Disease | None:
        stmt = select(Disease).where(
            func.lower(func.trim(Disease.name)) == name.strip().lower()
        )
        result = await self.session.execute(stmt.limit(1))
        return result.scalar_one_or_none()

    async def create_catalog_item(
        self,
        name: str,
        cie10_code: str | None = None,
    ) -> Disease:
        disease = Disease(
            name=name.strip(),
            cie10_code=cie10_code.strip().upper() if cie10_code else None,
        )
        self.session.add(disease)
        await self.session.flush()
        await self.session.refresh(disease)
        return disease
