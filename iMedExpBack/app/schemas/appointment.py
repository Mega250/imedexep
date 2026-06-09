from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    institution_id: int | None = None
    scheduled_at: datetime
    reason: str | None = Field(default=None, max_length=500)

    @field_validator("scheduled_at")
    @classmethod
    def validate_scheduled_at(cls, v: datetime) -> datetime:
        if v <= datetime.now(tz=v.tzinfo):
            raise ValueError("La cita debe programarse en el futuro")
        return v


class AppointmentUpdate(BaseModel):
    scheduled_at: datetime | None = None
    reason: str | None = Field(default=None, max_length=500)
    status: AppointmentStatus | None = None

    @field_validator("scheduled_at")
    @classmethod
    def validate_scheduled_at(cls, v: datetime | None) -> datetime | None:
        if v is not None and v <= datetime.now(tz=v.tzinfo):
            raise ValueError("La cita debe programarse en el futuro")
        return v


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    institution_id: int
    created_by_user_id: int
    scheduled_at: datetime
    reason: str | None
    status: AppointmentStatus
    created_at: datetime
    doctor_name: str | None = None
    institution_name: str | None = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_appointment(cls, appointment: object) -> "AppointmentResponse":
        doctor = getattr(appointment, "doctor", None)
        institution = getattr(appointment, "institution", None)

        doctor_name = None
        if doctor is not None:
            first = getattr(doctor, "first_name", "") or ""
            last = getattr(doctor, "last_name", "") or ""
            doctor_name = f"{first} {last}".strip() or None

        institution_name = None
        if institution is not None:
            institution_name = getattr(institution, "name", None)

        return cls(
            id=appointment.id,
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            institution_id=appointment.institution_id,
            created_by_user_id=appointment.created_by_user_id,
            scheduled_at=appointment.scheduled_at,
            reason=appointment.reason,
            status=appointment.status,
            created_at=appointment.created_at,
            doctor_name=doctor_name,
            institution_name=institution_name,
        )


class AppointmentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: list[AppointmentResponse]
