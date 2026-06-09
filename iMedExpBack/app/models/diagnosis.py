from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, String, Text, func, Enum
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.models.catalog import Disease


class Diagnosis(Base):
    __tablename__ = "diagnosis"
    __table_args__ = {"schema": "clinical"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    consultation_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("clinical.consultation.id"), nullable=False
    )
    disease_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("catalog.disease.id"), nullable=False
    )
    diagnosis_type: Mapped[str] = mapped_column(
        Enum('primary', 'secondary', 'differential', name='diagnosis_type'),
        nullable=False, 
        default="primary"
    )
    additional_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    
    disease: Mapped["Disease"] = relationship("Disease", foreign_keys=[disease_id])
