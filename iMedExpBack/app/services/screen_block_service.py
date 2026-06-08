from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.screen_block import ScreenBlock
from app.schemas.auth import TokenPayload

ROLE_DEFAULT_BLOCKED: dict[str, set[str]] = {
    "doctor": {"bitacora-pc", "bitacora-mob"},
}

MANAGEABLE_ROLES_SUPER = ["patient", "doctor", "secretary", "institution_admin"]
MANAGEABLE_ROLES_DIR = ["doctor", "secretary"]


def _role(token: TokenPayload) -> str:
    role = getattr(token, "role", "")
    return getattr(role, "value", role)


def _effective_blocked(
    role: str,
    global_state: dict[str, bool],
    inst_state: dict[str, bool],
) -> list[str]:
    defaults = ROLE_DEFAULT_BLOCKED.get(role, set())
    screens = set(defaults) | set(global_state) | set(inst_state)
    blocked: list[str] = []
    for screen_id in screens:
        if screen_id in inst_state:
            effective = inst_state[screen_id]
        elif screen_id in global_state:
            effective = global_state[screen_id]
        else:
            effective = screen_id in defaults
        if effective:
            blocked.append(screen_id)
    return blocked


class ScreenBlockService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def my_blocked(self, token: TokenPayload) -> list[str]:
        role = _role(token)
        if role == "superadmin":
            return []
        inst = getattr(token, "institution_id", None)
        result = await self.session.execute(
            select(ScreenBlock).where(
                ScreenBlock.role == role,
                or_(ScreenBlock.institution_id.is_(None), ScreenBlock.institution_id == inst),
            )
        )
        rows = result.scalars().all()
        global_state = {r.screen_id: r.blocked for r in rows if r.institution_id is None}
        inst_state = {r.screen_id: r.blocked for r in rows if r.institution_id is not None}
        return sorted(_effective_blocked(role, global_state, inst_state))

    async def list_manage(self, token: TokenPayload) -> list[dict]:
        if _role(token) == "superadmin":
            result = await self.session.execute(
                select(ScreenBlock).where(ScreenBlock.institution_id.is_(None))
            )
            rows = result.scalars().all()
            items: list[dict] = []
            for role in MANAGEABLE_ROLES_SUPER:
                global_state = {r.screen_id: r.blocked for r in rows if r.role == role}
                for screen_id in _effective_blocked(role, global_state, {}):
                    items.append({"role": role, "screen_id": screen_id})
            return items

        inst = getattr(token, "institution_id", None)
        result = await self.session.execute(
            select(ScreenBlock).where(
                or_(ScreenBlock.institution_id.is_(None), ScreenBlock.institution_id == inst)
            )
        )
        rows = result.scalars().all()
        items = []
        for role in MANAGEABLE_ROLES_DIR:
            global_state = {
                r.screen_id: r.blocked for r in rows if r.role == role and r.institution_id is None
            }
            inst_state = {
                r.screen_id: r.blocked
                for r in rows
                if r.role == role and r.institution_id is not None
            }
            for screen_id in _effective_blocked(role, global_state, inst_state):
                items.append({"role": role, "screen_id": screen_id})
        return items

    async def set_block(self, token: TokenPayload, role: str, screen_id: str, blocked: bool) -> None:
        inst = None if _role(token) == "superadmin" else getattr(token, "institution_id", None)
        conds = [ScreenBlock.role == role, ScreenBlock.screen_id == screen_id]
        conds.append(
            ScreenBlock.institution_id.is_(None) if inst is None else ScreenBlock.institution_id == inst
        )
        existing = (await self.session.execute(select(ScreenBlock).where(*conds))).scalar_one_or_none()
        if existing is None:
            self.session.add(
                ScreenBlock(role=role, screen_id=screen_id, institution_id=inst, blocked=blocked)
            )
        else:
            existing.blocked = blocked
        await self.session.flush()
