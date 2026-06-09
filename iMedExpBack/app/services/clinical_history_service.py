from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.schemas.auth import TokenPayload
from app.utils.ownership import resolve_patient_id_for_token


class ClinicalHistoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _patient_id(self, token: TokenPayload) -> int:
        return await resolve_patient_id_for_token(self.session, token)

    async def list_items(self, model, token: TokenPayload):
        patient_id = await self._patient_id(token)
        result = await self.session.execute(
            select(model)
            .where(model.patient_id == patient_id, model.deleted_at.is_(None))
            .order_by(model.created_at.desc())
        )
        return list(result.scalars().all())

    async def add_item(self, model, token: TokenPayload, data):
        patient_id = await self._patient_id(token)
        obj = model(patient_id=patient_id, **data.model_dump())
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def remove_item(self, model, token: TokenPayload, item_id: int) -> None:
        patient_id = await self._patient_id(token)
        result = await self.session.execute(
            update(model)
            .where(model.id == item_id, model.patient_id == patient_id, model.deleted_at.is_(None))
            .values(deleted_at=func.now())
        )
        if result.rowcount == 0:
            raise NotFoundError("Registro no encontrado")
        await self.session.flush()
