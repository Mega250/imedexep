import enum
from datetime import date, datetime

from sqlalchemy import BigInteger, Boolean, Date, Enum, ForeignKey, LargeBinary, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class GenderType(str, enum.Enum):
    M = "M"
    F = "F"
    O = "O"


class BloodType(str, enum.Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"
    unknown = "unknown"


_gender_enum = Enum(GenderType, name="gender_type", create_type=False, values_callable=lambda x: [e.value for e in x])
_blood_enum = Enum(BloodType, name="blood_type", create_type=False, values_callable=lambda x: [e.value for e in x])


class Patient(Base):
    __tablename__ = "patient"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
    BigInteger, ForeignKey("user.id"), nullable=True
)

    curp_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    curp_hash: Mapped[str] = mapped_column(Text, nullable=False, unique=True)

    first_name: Mapped[str] = mapped_column(Text, nullable=False)
    last_name: Mapped[str] = mapped_column(Text, nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[GenderType | None] = mapped_column(_gender_enum, nullable=True)
    blood_type: Mapped[BloodType | None] = mapped_column(_blood_enum, nullable=True)

    phone_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)

    street_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(Text, nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(5), nullable=True)
    city: Mapped[str | None] = mapped_column(Text, nullable=True)
    state: Mapped[str | None] = mapped_column(Text, nullable=True)

    privacy_attributes: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        server_default='{"sensitivity_level": 1}',
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)

    retention_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    legal_hold: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    legal_hold_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    archived_at: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)

    user: Mapped["User"] = relationship(
        "User", back_populates="patient", foreign_keys=[user_id]
    )