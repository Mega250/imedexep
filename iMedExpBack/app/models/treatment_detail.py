import enum
from datetime import date
from sqlalchemy import BigInteger, Date, ForeignKey, Text, Enum, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class TreatmentStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    suspended = "suspended"


class TreatmentDetail(Base):
    __tablename__ = "treatment_detail"
    __table_args__ = (
        CheckConstraint(
            "medication_id IS NOT NULL OR (free_text_medication IS NOT NULL AND char_length(trim(free_text_medication)) > 0)",
            name="chk_td_medication_source_provided",
        ),
        CheckConstraint("duration_days > 0", name="chk_td_duration_positive"),
        CheckConstraint("start_date > '1900-01-01'", name="chk_td_start_date_realistic"),
        CheckConstraint(
            "calculated_end_date IS NULL OR calculated_end_date >= start_date",
            name="chk_td_end_date_after_start",
        ),
        CheckConstraint("char_length(trim(dosage)) > 0", name="chk_td_dosage_not_empty"),
        CheckConstraint(
            "char_length(trim(frequency)) > 0", name="chk_td_frequency_not_empty"
        ),
        {"schema": "clinical"},
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    prescription_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("clinical.prescription.id", deferrable=True, initially="DEFERRED"),
        nullable=False,
    )
    medication_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("catalog.medication.id", deferrable=True, initially="DEFERRED"),
        nullable=True,
    )

    free_text_medication: Mapped[str | None] = mapped_column(Text, nullable=True)
    dosage: Mapped[str] = mapped_column(Text, nullable=False)
    frequency: Mapped[str] = mapped_column(Text, nullable=False)
    duration_days: Mapped[int] = mapped_column(BigInteger, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    calculated_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[TreatmentStatus] = mapped_column(
        Enum(TreatmentStatus, name="treatment_status", schema="public", create_type=False),
        default=TreatmentStatus.active,
        nullable=False,
    )
    additional_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    prescription: Mapped["Prescription"] = relationship(
        "Prescription", back_populates="treatments", foreign_keys=[prescription_id]
    )
