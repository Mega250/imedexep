from sqlalchemy import BigInteger, CheckConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

class Medication(Base):
    __tablename__ = "medication"
    __table_args__ = (
        CheckConstraint("char_length(trim(generic_name)) > 0", name="chk_medication_generic_name_length"),
        {"schema": "catalog"}
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    generic_name: Mapped[str] = mapped_column(Text, nullable=False)
    commercial_name: Mapped[str | None] = mapped_column(Text)
    presentation: Mapped[str | None] = mapped_column(Text)
    administration_route: Mapped[str | None] = mapped_column(Text)

    @property
    def display_name(self) -> str:
        parts = [self.generic_name]
        if self.commercial_name:
            parts.append(f"({self.commercial_name})")
        if self.presentation:
            parts.append(self.presentation)
        if self.administration_route:
            parts.append(self.administration_route)
        return " ".join(parts)
