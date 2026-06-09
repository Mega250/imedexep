from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.screen_block import MyBlockedResponse, ScreenBlockItem, ScreenBlockSet
from app.services.screen_block_service import ScreenBlockService

router = APIRouter(prefix="/screen-access", tags=["screen-access"])


@router.get("/me", response_model=MyBlockedResponse)
async def my_blocked_screens(
    token: TokenPayload = Depends(
        require_roles("patient", "doctor", "secretary", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return MyBlockedResponse(blocked=await ScreenBlockService(session).my_blocked(token))


@router.get("/manage", response_model=list[ScreenBlockItem])
async def list_managed_blocks(
    token: TokenPayload = Depends(require_roles("superadmin", "institution_admin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ScreenBlockService(session).list_manage(token)


@router.put("/manage", status_code=204)
async def set_block(
    body: ScreenBlockSet,
    token: TokenPayload = Depends(require_roles("superadmin", "institution_admin")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ScreenBlockService(session).set_block(token, body.role, body.screen_id, body.blocked)
