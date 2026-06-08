from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

class Secretary(Base):
    __tablename__ = "secretary"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("user.id", deferrable=True, initially="DEFERRED"), nullable=False, unique=True
    )
    
    first_name: Mapped[str] = mapped_column(Text, nullable=False)
    last_name: Mapped[str] = mapped_column(Text, nullable=False)
    employee_number: Mapped[str | None] = mapped_column(Text, unique=True, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(10), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="secretary")
    
    doctors_assigned: Mapped[list["SecretaryDoctor"]] = relationship(
        "SecretaryDoctor", 
        back_populates="secretary",
        cascade="all, delete-orphan"
    )

class SecretaryDoctor(Base):
    __tablename__ = "secretary_doctor"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    secretary_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("secretary.id", deferrable=True, initially="DEFERRED"), nullable=False
    )
    doctor_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("doctor.id", deferrable=True, initially="DEFERRED"), nullable=False
    )
    assigned_by_user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("user.id", deferrable=True, initially="DEFERRED"), nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    secretary: Mapped["Secretary"] = relationship("Secretary", back_populates="doctors_assigned")
    doctor: Mapped["Doctor"] = relationship("Doctor")
