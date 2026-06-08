from datetime import datetime
from sqlalchemy import BigInteger, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Prescription(Base):
    __tablename__ = "prescription"
    __table_args__ = {"schema": "clinical"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    consultation_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("clinical.consultation.id", deferrable=True, initially="DEFERRED"),
        nullable=False,
        unique=True,
    )
    patient_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("patient.id", deferrable=True, initially="DEFERRED"),
        nullable=False,
    )
    doctor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("doctor.id", deferrable=True, initially="DEFERRED"),
        nullable=False,
    )

    general_instructions: Mapped[str | None] = mapped_column(Text)
    signature_hash: Mapped[str | None] = mapped_column(Text)
    signed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    issued_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    treatments: Mapped[list["TreatmentDetail"]] = relationship(
        "TreatmentDetail", back_populates="prescription", cascade="all, delete-orphan"
    )
    doctor: Mapped["Doctor"] = relationship("Doctor")
    patient: Mapped["Patient"] = relationship("Patient")
