from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.personal_log_repo import PersonalLogRepository
from app.schemas.personal_log import PersonalLogCreate, PersonalLogResponse


class PersonalLogService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PersonalLogRepository(session)

    async def create(self, user_id: int, data: PersonalLogCreate) -> PersonalLogResponse:
        entry = await self.repo.create(
            user_id=user_id,
            role=data.role,
            fields=data.fields,
        )
        return PersonalLogResponse.model_validate(entry)

    async def list_for_user(self, user_id: int, limit: int = 200) -> list[PersonalLogResponse]:
        entries = await self.repo.list_for_user(user_id, limit=limit)
        return [PersonalLogResponse.model_validate(e) for e in entries]

    async def delete(self, user_id: int, log_id: int) -> None:
        deleted = await self.repo.soft_delete(log_id=log_id, user_id=user_id)
        if not deleted:
            raise NotFoundError("Registro no encontrado")
