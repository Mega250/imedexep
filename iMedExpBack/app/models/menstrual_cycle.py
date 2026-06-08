from datetime import date, datetime

from sqlalchemy import BigInteger, CheckConstraint, Date, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class MenstrualCycle(Base):
    __tablename__ = "menstrual_cycle"
    __table_args__ = (
        CheckConstraint(
            "period_start_date > DATE '1900-01-01'",
            name="chk_mc_start_realistic",
        ),
        CheckConstraint(
            "period_start_date <= CURRENT_DATE",
            name="chk_mc_start_not_future",
        ),
        CheckConstraint(
            "period_end_date IS NULL OR period_end_date >= period_start_date",
            name="chk_mc_end_after_start",
        ),
        CheckConstraint(
            "period_end_date IS NULL OR period_end_date <= period_start_date + INTERVAL '14 days'",
            name="chk_mc_duration_realistic",
        ),
        CheckConstraint(
            "period_end_date IS NULL OR period_end_date <= CURRENT_DATE",
            name="chk_mc_end_not_future",
        ),
        CheckConstraint(
            "flow IS NULL OR flow IN ('spotting', 'light', 'medium', 'heavy')",
            name="chk_mc_flow_valid",
        ),
        CheckConstraint(
            "jsonb_typeof(symptoms) = 'object'",
            name="chk_mc_symptoms_is_object",
        ),
        CheckConstraint(
            "char_length(trim(source)) BETWEEN 1 AND 32",
            name="chk_mc_source_not_empty",
        ),
        {"schema": "clinical"},
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("patient.id", deferrable=True, initially="DEFERRED"),
        nullable=False,
    )
    period_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    period_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    flow: Mapped[str | None] = mapped_column(String(16), nullable=True)
    symptoms: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, server_default="manual")
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
