from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.reminder import ReminderPreferenceResponse, ReminderPreferenceUpdate, ReminderRunResult
from app.services.reminder_service import ReminderService

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/me", response_model=ReminderPreferenceResponse)
async def get_my_reminders(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ReminderService(session).get_preferences(token)


@router.put("/me", response_model=ReminderPreferenceResponse)
async def update_my_reminders(
    body: ReminderPreferenceUpdate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ReminderService(session).set_preferences(token, body)


@router.post("/run/me", response_model=ReminderRunResult)
async def run_my_reminders(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ReminderService(session).run_for_patient(token)
