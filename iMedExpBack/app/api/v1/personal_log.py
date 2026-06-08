from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_plain_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.personal_log import PersonalLogCreate, PersonalLogResponse
from app.services.personal_log_service import PersonalLogService

router = APIRouter(prefix="/personal-log", tags=["personal-log"])


@router.post("/", response_model=PersonalLogResponse, status_code=201)
async def create_personal_log(
    body: PersonalLogCreate,
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_plain_session),
) -> PersonalLogResponse:
    return await PersonalLogService(session).create(token.user_id, body)


@router.get("/", response_model=list[PersonalLogResponse])
async def list_my_personal_logs(
    limit: int = Query(200, ge=1, le=500),
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_plain_session),
) -> list[PersonalLogResponse]:
    return await PersonalLogService(session).list_for_user(token.user_id, limit=limit)


@router.delete("/{log_id:int}", status_code=204)
async def delete_personal_log(
    log_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_plain_session),
) -> None:
    await PersonalLogService(session).delete(token.user_id, log_id)
