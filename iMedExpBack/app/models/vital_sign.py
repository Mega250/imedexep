from datetime import datetime
from sqlalchemy import BigInteger, Numeric, Text, ForeignKey, CheckConstraint, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class VitalSign(Base):
    __tablename__ = "vital_sign"
    __table_args__ = (
        CheckConstraint("weight IS NULL OR (weight > 0 AND weight < 600)", name="chk_vs_weight_realistic"),
        CheckConstraint("height IS NULL OR (height > 0 AND height < 3.00)", name="chk_vs_height_realistic"),
        CheckConstraint("heart_rate IS NULL OR (heart_rate > 0 AND heart_rate < 300)", name="chk_vs_hr_realistic"),
        CheckConstraint(
            "(systolic_bp IS NULL AND diastolic_bp IS NULL) OR (systolic_bp IS NOT NULL AND diastolic_bp IS NOT NULL AND systolic_bp > diastolic_bp)", 
            name="chk_vs_blood_pressure"
        ),
        {"schema": "clinical"}
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(
        BigInteger, 
        ForeignKey("patient.id", deferrable=True, initially="DEFERRED"), 
        nullable=False
    )
    recorded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    source: Mapped[str] = mapped_column(Text, server_default="manual")

    weight: Mapped[float | None] = mapped_column(Numeric(5, 2))
    height: Mapped[float | None] = mapped_column(Numeric(3, 2))
    heart_rate: Mapped[int | None] = mapped_column(BigInteger)
    systolic_bp: Mapped[int | None] = mapped_column(BigInteger)
    diastolic_bp: Mapped[int | None] = mapped_column(BigInteger)
    oxygen_saturation: Mapped[float | None] = mapped_column(Numeric(5, 2))
    body_temperature: Mapped[float | None] = mapped_column(Numeric(4, 2))