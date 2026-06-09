from datetime import datetime, UTC

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_log import PersonalLog


class PersonalLogRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user_id: int, role: str, fields: dict[str, str]) -> PersonalLog:
        entry = PersonalLog(user_id=user_id, role=role, fields=fields)
        self.session.add(entry)
        await self.session.flush()
        await self.session.refresh(entry)
        return entry

    async def list_for_user(
        self,
        user_id: int,
        limit: int = 200,
    ) -> list[PersonalLog]:
        result = await self.session.execute(
            select(PersonalLog)
            .where(
                PersonalLog.user_id == user_id,
                PersonalLog.deleted_at.is_(None),
            )
            .order_by(PersonalLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_owned(self, user_id: int, log_id: int) -> PersonalLog | None:
        result = await self.session.execute(
            select(PersonalLog).where(
                PersonalLog.id == log_id,
                PersonalLog.user_id == user_id,
                PersonalLog.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def soft_delete(self, log_id: int, user_id: int) -> bool:
        entry = await self.get_owned(user_id, log_id)
        if not entry:
            return False
        entry.deleted_at = datetime.now(UTC)
        await self.session.flush()
        return True
