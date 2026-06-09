from datetime import datetime

from sqlalchemy import BigInteger, Boolean, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ScreenBlock(Base):
    __tablename__ = "screen_block"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    screen_id: Mapped[str] = mapped_column(Text, nullable=False)
    institution_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("institution.id"), nullable=True
    )
    blocked: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=func.now()
    )
