from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, Text, func, SmallInteger, Enum
from sqlalchemy.dialects.postgresql import TIMESTAMP, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Consultation(Base):
    __tablename__ = "consultation"
    __table_args__ = {"schema": "clinical"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    parent_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("clinical.consultation.id"), nullable=True
    )
    version: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default="1")
    is_current: Mapped[bool] = mapped_column(nullable=False, server_default="true")
    amendment_reason: Mapped[str | None] = mapped_column(
        Enum('correction', 'addendum', 'clarification', name='record_amendment_reason'), 
        nullable=True
    )
    appointment_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("appointment.id"), nullable=True
    )
    institution_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("institution.id"), nullable=False)
    patient_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("patient.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("doctor.id"), nullable=False)
    consulted_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    chief_complaint: Mapped[str | None] = mapped_column(Text, nullable=True)
    symptoms: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sensitivity_level: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default="1")
    specialty_data: Mapped[dict | None] = mapped_column(JSONB(none_as_null=True), nullable=True)
    signature_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    signed_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
