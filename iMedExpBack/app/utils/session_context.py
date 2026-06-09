from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def apply_rls_context(
    session: AsyncSession,
    *,
    user_id: int,
    role: str,
    institution_id: int | None,
    ip_address: str,
) -> None:
    await session.execute(
        text(
            "SELECT set_session_context("
            "  :uid,"
            "  :role,"
            "  :inst_id,"
            "  :ip"
            ")"
        ),
        {
            "uid": user_id,
            "role": role,
            "inst_id": institution_id,
            "ip": ip_address,
        },
    )