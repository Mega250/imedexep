from datetime import datetime, UTC, timedelta
from sqlalchemy import BigInteger, ForeignKey, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class InstitutionInvitation(Base):
    __tablename__ = "institution_invitation"
    __table_args__ = {"schema": "catalog"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    institution_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("institution.id"))
    doctor_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("doctor.id"))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(UTC) + timedelta(days=7)
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    institution = relationship("Institution")
    doctor = relationship("Doctor")
