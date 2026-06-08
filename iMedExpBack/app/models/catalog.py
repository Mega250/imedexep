from sqlalchemy import BigInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Disease(Base):
    __tablename__ = "disease"
    __table_args__ = {"schema": "catalog"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    cie10_code: Mapped[str | None] = mapped_column(String(10), nullable=True)

