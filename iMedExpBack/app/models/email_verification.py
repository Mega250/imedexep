from datetime import datetime

from sqlalchemy import BigInteger, Enum, ForeignKey, LargeBinary, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.user import UserRole


_role_enum = Enum(
    UserRole,
    name="user_role",
    create_type=False,
    schema=None,
)


class PendingRegistration(Base):
    __tablename__ = "pending_registration"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[UserRole] = mapped_column(_role_enum, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    curp_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    curp_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    general_license: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    codes: Mapped[list["PendingRegistrationCode"]] = relationship(
        "PendingRegistrationCode",
        cascade="all, delete-orphan",
    )


class PendingRegistrationCode(Base):
    __tablename__ = "pending_registration_code"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    pending_registration_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("pending_registration.id"),
        nullable=False,
    )
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
