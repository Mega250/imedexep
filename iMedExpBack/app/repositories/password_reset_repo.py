import secrets
from dataclasses import dataclass
from datetime import datetime, UTC, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.password_reset import PasswordResetCode


COOLDOWN_BY_ATTEMPT_SECONDS = [60, 60, 120, 600, 1800, 3600]
WINDOW_HOURS = 1
CODE_TTL_MINUTES = 15
CODE_LENGTH = 8


@dataclass
class ResendStatus:
    can_resend: bool
    next_resend_at: datetime
    attempts_in_window: int
    code_expires_at: datetime | None


def _cooldown_for(attempts_in_window: int) -> int:
    if attempts_in_window < 0:
        attempts_in_window = 0
    if attempts_in_window >= len(COOLDOWN_BY_ATTEMPT_SECONDS):
        return COOLDOWN_BY_ATTEMPT_SECONDS[-1]
    return COOLDOWN_BY_ATTEMPT_SECONDS[attempts_in_window]


class PasswordResetRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _generate_code(self) -> str:
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return "".join(secrets.choice(alphabet) for _ in range(CODE_LENGTH))

    async def create_code(self, user_id: int) -> tuple[str, datetime]:
        code = self._generate_code()
        expires_at = datetime.now(UTC) + timedelta(minutes=CODE_TTL_MINUTES)
        reset = PasswordResetCode(
            user_id=user_id,
            code=code,
            expires_at=expires_at,
        )
        self.session.add(reset)
        await self.session.flush()
        return code, expires_at

    async def resend_status(self, user_id: int) -> ResendStatus:
        now = datetime.now(UTC)
        window_start = now - timedelta(hours=WINDOW_HOURS)

        count_q = await self.session.execute(
            select(func.count())
            .select_from(PasswordResetCode)
            .where(
                PasswordResetCode.user_id == user_id,
                PasswordResetCode.created_at >= window_start,
            )
        )
        attempts_in_window = int(count_q.scalar_one() or 0)

        last_q = await self.session.execute(
            select(PasswordResetCode)
            .where(PasswordResetCode.user_id == user_id)
            .order_by(PasswordResetCode.created_at.desc())
            .limit(1)
        )
        last = last_q.scalar_one_or_none()

        if not last:
            return ResendStatus(
                can_resend=True,
                next_resend_at=now,
                attempts_in_window=0,
                code_expires_at=None,
            )

        last_created = last.created_at.replace(tzinfo=UTC)
        cooldown = _cooldown_for(attempts_in_window)
        next_resend_at = last_created + timedelta(seconds=cooldown)
        code_expires = last.expires_at.replace(tzinfo=UTC)

        return ResendStatus(
            can_resend=now >= next_resend_at,
            next_resend_at=next_resend_at,
            attempts_in_window=attempts_in_window,
            code_expires_at=code_expires,
        )

    async def consume_code(self, user_id: int, code: str) -> bool:
        result = await self.session.execute(
            select(PasswordResetCode)
            .where(
                PasswordResetCode.user_id == user_id,
                PasswordResetCode.code == code.upper(),
                PasswordResetCode.used_at.is_(None),
                PasswordResetCode.expires_at > datetime.now(UTC),
            )
            .order_by(PasswordResetCode.created_at.desc())
            .limit(1)
        )
        reset = result.scalar_one_or_none()
        if not reset:
            return False

        reset.used_at = datetime.now(UTC)
        await self.session.flush()
        return True
