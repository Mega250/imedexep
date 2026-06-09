import enum
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, Enum, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP,JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    institution_admin = "institution_admin"
    doctor = "doctor"
    secretary = "secretary"
    patient = "patient"

_role_enum = Enum(
    UserRole,
    name="user_role",
    create_type=False,
    schema=None,
)


class User(Base):

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[UserRole] = mapped_column(_role_enum, nullable=False)
    access_attributes: Mapped[dict] = mapped_column(
        JSONB, nullable=False, server_default="{}"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    last_login_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    failed_login_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    locked_until: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    patient: Mapped["Patient"] = relationship(
    "Patient",
    back_populates="user",
    uselist=False,
    foreign_keys="[Patient.user_id]", 
)

    doctor: Mapped["Doctor"] = relationship(
    "Doctor",
    back_populates="user",
    uselist=False,
    foreign_keys="[Doctor.user_id]",
)
    secretary: Mapped["Secretary"] = relationship(
        "Secretary",
        back_populates="user",
        uselist=False,
        foreign_keys="[Secretary.user_id]",
    )