import enum
from datetime import datetime
from sqlalchemy import BigInteger, Text, Boolean, func, Enum
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class InstitutionType(str, enum.Enum):
    hospital = "hospital"
    private_clinic = "private_clinic"
    school_dispensary = "school_dispensary"

class Institution(Base):
    __tablename__ = "institution"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    type: Mapped[InstitutionType] = mapped_column(
        Enum(InstitutionType, name="institution_type", create_type=False), 
        nullable=False
    )
    
    name: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    policies: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    rfc: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(Text, nullable=True)
    state: Mapped[str | None] = mapped_column(Text, nullable=True)
    postal_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    email: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(Text, nullable=True)