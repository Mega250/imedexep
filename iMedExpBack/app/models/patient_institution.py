from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class PatientInstitution(Base):
    __tablename__ = "patient_institution"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("patient.id"), nullable=False
    )
    institution_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("institution.id"), nullable=False
    )
    record_number: Mapped[str | None] = mapped_column(Text, nullable=True)
    linked_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    unlinked_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )

    patient: Mapped["Patient"] = relationship("Patient", foreign_keys=[patient_id])
    institution: Mapped["Institution"] = relationship("Institution", foreign_keys=[institution_id])

    @property
    def institution_name(self) -> str | None:
        return self.institution.name if self.institution else None
