from datetime import datetime

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ReminderPreference(Base):
    __tablename__ = "reminder_preference"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    patient_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("patient.id"), nullable=False, unique=True)
    medication_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    medication_every_hours: Mapped[int] = mapped_column(Integer, nullable=False, server_default="8")
    appointment_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    appointment_hours_before: Mapped[int] = mapped_column(Integer, nullable=False, server_default="24")
    email_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    last_medication_reminder_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
