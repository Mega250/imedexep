import hashlib
import secrets
import random
import string
from datetime import datetime, UTC, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.qr_record_access import QRRecordAccess


class QRRecordAccessRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _generate_verification_code(self) -> str:
        return "".join(random.choices(string.digits + string.ascii_uppercase, k=8))

    def _generate_token_hash(self) -> tuple[str, str]:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return token, token_hash

    async def create(self, patient_id: int, created_by_user_id: int) -> QRRecordAccess:
        _, token_hash = self._generate_token_hash()
        code = self._generate_verification_code()

        qr = QRRecordAccess(
            patient_id=patient_id,
            token_hash=token_hash,
            verification_code=code,
            expires_at=datetime.now(UTC) + timedelta(minutes=30),
            created_by_user_id=created_by_user_id,
        )
        self.session.add(qr)
        await self.session.flush()
        await self.session.refresh(qr)
        return qr

    async def get_by_code(self, code: str) -> QRRecordAccess | None:
        result = await self.session.execute(
            select(QRRecordAccess).where(
                QRRecordAccess.verification_code == code,
                QRRecordAccess.revoked_at.is_(None),
                QRRecordAccess.expires_at > datetime.now(UTC),
            )
        )
        return result.scalar_one_or_none()

    async def revoke(self, qr_id: int) -> None:
        from sqlalchemy import update, func
        await self.session.execute(
            update(QRRecordAccess)
            .where(QRRecordAccess.id == qr_id)
            .values(revoked_at=func.now())
        )
        await self.session.flush()