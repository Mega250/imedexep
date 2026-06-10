import json
import random
import string
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


COOLDOWN_BY_ATTEMPT_SECONDS = [60, 60, 60, 600, 1800, 3600]
WINDOW_HOURS = 1
CODE_TTL_MINUTES = 10


@dataclass
class PendingResendStatus:
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


class PendingRegistrationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _generate_code(self) -> str:
        return "".join(random.choices(string.digits, k=6))

    async def create_patient_pending(
        self,
        *,
        email: str,
        password_hash: str,
        curp_encrypted: bytes,
        curp_hash: str,
        phone_encrypted: bytes | None,
        payload: dict[str, Any],
    ) -> int:
        await self._soft_delete_conflicting_pending(
            role="patient",
            email=email,
            identifier_column="curp_hash",
            identifier_value=curp_hash,
        )
        result = await self.session.execute(
            text(
                """
                INSERT INTO pending_registration (
                    email, role, password_hash, payload,
                    curp_encrypted, curp_hash, phone_encrypted, expires_at
                )
                VALUES (
                    :email, 'patient', :password_hash, CAST(:payload AS jsonb),
                    :curp_encrypted, :curp_hash, :phone_encrypted,
                    now() + INTERVAL '24 hours'
                )
                RETURNING id
                """
            ),
            {
                "email": email,
                "password_hash": password_hash,
                "payload": json.dumps(payload),
                "curp_encrypted": curp_encrypted,
                "curp_hash": curp_hash,
                "phone_encrypted": phone_encrypted,
            },
        )
        pending_id = int(result.scalar_one())
        await self.session.flush()
        return pending_id

    async def create_doctor_pending(
        self,
        *,
        email: str,
        password_hash: str,
        general_license: str,
        payload: dict[str, Any],
    ) -> int:
        await self._soft_delete_conflicting_pending(
            role="doctor",
            email=email,
            identifier_column="general_license",
            identifier_value=general_license,
        )
        result = await self.session.execute(
            text(
                """
                INSERT INTO pending_registration (
                    email, role, password_hash, payload, general_license, expires_at
                )
                VALUES (
                    :email, 'doctor', :password_hash, CAST(:payload AS jsonb),
                    :general_license, now() + INTERVAL '24 hours'
                )
                RETURNING id
                """
            ),
            {
                "email": email,
                "password_hash": password_hash,
                "payload": json.dumps(payload),
                "general_license": general_license,
            },
        )
        pending_id = int(result.scalar_one())
        await self.session.flush()
        return pending_id

    async def _soft_delete_conflicting_pending(
        self,
        *,
        role: str,
        email: str,
        identifier_column: str,
        identifier_value: str,
    ) -> None:
        await self.session.execute(
            text(
                f"""
                UPDATE pending_registration
                SET deleted_at = now()
                WHERE role = :role
                  AND completed_at IS NULL
                  AND deleted_at IS NULL
                  AND (email = :email OR {identifier_column} = :identifier_value)
                """
            ),
            {
                "role": role,
                "email": email,
                "identifier_value": identifier_value,
            },
        )
        await self.session.flush()

    async def create_code(self, pending_id: int) -> tuple[str, datetime]:
        code = self._generate_code()
        expires_at = datetime.now(UTC) + timedelta(minutes=CODE_TTL_MINUTES)
        await self.invalidate_codes(pending_id)
        await self.session.execute(
            text(
                """
                INSERT INTO pending_registration_code (
                    pending_registration_id, code, expires_at
                )
                VALUES (:pending_id, :code, :expires_at)
                """
            ),
            {"pending_id": pending_id, "code": code, "expires_at": expires_at},
        )
        await self.session.flush()
        return code, expires_at

    async def invalidate_codes(self, pending_id: int) -> None:
        await self.session.execute(
            text(
                """
                UPDATE pending_registration_code
                SET used_at = now()
                WHERE pending_registration_id = :pending_id
                  AND used_at IS NULL
                """
            ),
            {"pending_id": pending_id},
        )
        await self.session.flush()

    async def get_active_by_email(self, email: str) -> dict[str, Any] | None:
        result = await self.session.execute(
            text(
                """
                SELECT *
                FROM pending_registration
                WHERE email = :email
                  AND completed_at IS NULL
                  AND deleted_at IS NULL
                  AND expires_at > now()
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"email": email},
        )
        row = result.mappings().one_or_none()
        return dict(row) if row else None

    async def resend_status(self, pending_id: int) -> PendingResendStatus:
        now = datetime.now(UTC)
        window_start = now - timedelta(hours=WINDOW_HOURS)

        count_q = await self.session.execute(
            text(
                """
                SELECT count(*)
                FROM pending_registration_code
                WHERE pending_registration_id = :pending_id
                  AND created_at >= :window_start
                """
            ),
            {"pending_id": pending_id, "window_start": window_start},
        )
        attempts_in_window = int(count_q.scalar_one() or 0)

        last_q = await self.session.execute(
            text(
                """
                SELECT *
                FROM pending_registration_code
                WHERE pending_registration_id = :pending_id
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"pending_id": pending_id},
        )
        last = last_q.mappings().one_or_none()
        if not last:
            return PendingResendStatus(True, now, 0, None)

        last_created = last["created_at"].replace(tzinfo=UTC)
        code_expires = last["expires_at"].replace(tzinfo=UTC)
        next_resend_at = last_created + timedelta(
            seconds=_cooldown_for(attempts_in_window)
        )
        return PendingResendStatus(
            can_resend=now >= next_resend_at,
            next_resend_at=next_resend_at,
            attempts_in_window=attempts_in_window,
            code_expires_at=code_expires,
        )

    async def consume_code(self, email: str, code: str) -> dict[str, Any] | None:
        pending = await self.get_active_by_email(email)
        if not pending:
            return None
        result = await self.session.execute(
            text(
                """
                SELECT id
                FROM pending_registration_code
                WHERE pending_registration_id = :pending_id
                  AND code = :code
                  AND used_at IS NULL
                  AND expires_at > now()
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"pending_id": pending["id"], "code": code},
        )
        code_id = result.scalar_one_or_none()
        if not code_id:
            return None
        await self.session.execute(
            text(
                """
                UPDATE pending_registration_code
                SET used_at = now()
                WHERE id = :code_id
                """
            ),
            {"code_id": code_id},
        )
        await self.session.flush()
        return pending

    async def complete(self, pending_id: int) -> None:
        await self.session.execute(
            text(
                """
                UPDATE pending_registration
                SET completed_at = now()
                WHERE id = :pending_id
                """
            ),
            {"pending_id": pending_id},
        )
        await self.session.flush()
