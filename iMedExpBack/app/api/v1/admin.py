import json

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.utils.ownership import ensure_institution_jurisdiction

router = APIRouter(prefix="/admin", tags=["admin"])


def _as_obj(value):
    return json.loads(value) if isinstance(value, str) else value


@router.get("/stats")
async def admin_stats(
    token: TokenPayload = Depends(require_roles("superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    row = await session.execute(text("SELECT fn_admin_stats()"))
    return _as_obj(row.scalar_one())


@router.get("/institutions/{institution_id}/stats")
async def institution_stats(
    institution_id: int,
    token: TokenPayload = Depends(require_roles("superadmin", "institution_admin")),
    session: AsyncSession = Depends(get_rls_session),
):
    ensure_institution_jurisdiction(token, institution_id)
    row = await session.execute(text("SELECT fn_institution_stats(:id)"), {"id": institution_id})
    return _as_obj(row.scalar_one())


@router.get("/audit")
async def audit_events(
    limit: int = Query(50, ge=1, le=200),
    token: TokenPayload = Depends(require_roles("superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    row = await session.execute(text("SELECT fn_audit_events(:lim)"), {"lim": limit})
    return _as_obj(row.scalar_one())
