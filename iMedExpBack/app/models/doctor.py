from datetime import datetime, time
from sqlalchemy import BigInteger, ForeignKey, String, Text, func, SmallInteger, Time, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Doctor(Base):
    __tablename__ = "doctor"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("user.id"), nullable=False, unique=True
    )

    general_license: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    specialty_license: Mapped[str | None] = mapped_column(Text, nullable=True)

    first_name: Mapped[str] = mapped_column(Text, nullable=False)
    last_name: Mapped[str] = mapped_column(Text, nullable=False)

    specialty_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    sub_specialty_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    graduation_university: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(10), nullable=True)
    office_location: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, nullable=False, server_default=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)

    @property
    def clearance_level(self):
        if self.user and self.user.access_attributes:
            return self.user.access_attributes.get("clearance_level")
        return None

    user: Mapped["User"] = relationship("User", back_populates="doctor")

    shifts: Mapped[list["DoctorShift"]] = relationship(
        "DoctorShift",
        back_populates="doctor",
        cascade="all, delete-orphan",
        foreign_keys="[DoctorShift.doctor_id]",
    )


class DoctorShift(Base):
    __tablename__ = "doctor_shift"
    __table_args__ = (
        UniqueConstraint("doctor_id", "institution_id", "weekday", "start_time", name="uq_doctor_shift"),
        CheckConstraint("weekday BETWEEN 0 AND 6", name="chk_doctor_shift_weekday_range"),
        CheckConstraint("end_time > start_time", name="chk_doctor_shift_time_order"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    doctor_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("doctor.id"), nullable=False)
    institution_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("institution.id"), nullable=True)
    weekday: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    assigned_office: Mapped[str | None] = mapped_column(Text, nullable=True)
    shift_type: Mapped[str | None] = mapped_column(Text, nullable=True)

    doctor: Mapped["Doctor"] = relationship(
        "Doctor",
        back_populates="shifts",
        uselist=False,
        foreign_keys="[DoctorShift.doctor_id]",
    )
    institution: Mapped["Institution"] = relationship("Institution")
