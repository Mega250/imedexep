from datetime import date, datetime

from sqlalchemy import BigInteger, Date, Float, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PatientGlucose(Base):
    __tablename__ = "patient_glucose"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    patient_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("patient.id"), nullable=False)
    value_mg_dl: Mapped[float] = mapped_column(Float, nullable=False)
    context: Mapped[str | None] = mapped_column(Text, nullable=True)
    measured_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class PatientWeight(Base):
    __tablename__ = "patient_weight"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    patient_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("patient.id"), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    height_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    measured_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
