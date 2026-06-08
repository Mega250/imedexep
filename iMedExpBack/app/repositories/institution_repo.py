from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.models.institution import Institution
from app.schemas.institution import InstitutionCreate, InstitutionUpdate
from app.repositories.base import BaseRepository

class InstitutionRepository(BaseRepository[Institution]):
    model = Institution

    async def create(self, *, obj_in: InstitutionCreate) -> Institution:

        db_obj = Institution(**obj_in.model_dump())
        self.session.add(db_obj)
        
        await self.session.flush()
        
        generated_id = db_obj.id
        
        stmt = select(Institution).where(Institution.id == generated_id)
        result = await self.session.execute(stmt)
        fresh_obj = result.scalar_one()
        
        return fresh_obj

    async def get_by_id(self, id: int) -> Institution | None:
        stmt = select(self.model).where(
            self.model.id == id,
            self.model.deleted_at.is_(None)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi(self, *, skip: int = 0, limit: int = 100):
        stmt = select(self.model).where(
            self.model.deleted_at.is_(None)
        ).offset(skip).limit(limit).order_by(self.model.id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update(self, *, db_obj: Institution, obj_in: InstitutionUpdate) -> Institution:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        
        self.session.add(db_obj)
        await self.session.flush()
        await self.session.refresh(db_obj)
        return db_obj

    async def remove(self, *, id: int) -> Institution | None:
        db_obj = await self.get_by_id(id=id)
        if db_obj:
            db_obj.is_active = False
            db_obj.deleted_at = datetime.now(timezone.utc)
            self.session.add(db_obj)
            await self.session.flush()
            await self.session.refresh(db_obj)
        return db_obj