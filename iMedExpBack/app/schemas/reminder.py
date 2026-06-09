from datetime import datetime

from pydantic import BaseModel, Field


class ReminderPreferenceResponse(BaseModel):
    patient_id: int
    medication_enabled: bool
    medication_every_hours: int
    appointment_enabled: bool
    appointment_hours_before: int
    email_enabled: bool
    last_medication_reminder_at: datetime | None = None

    model_config = {"from_attributes": True}


class ReminderPreferenceUpdate(BaseModel):
    medication_enabled: bool | None = None
    medication_every_hours: int | None = Field(default=None, ge=1, le=168)
    appointment_enabled: bool | None = None
    appointment_hours_before: int | None = Field(default=None, ge=1, le=168)
    email_enabled: bool | None = None


class ReminderRunResult(BaseModel):
    created: int
    medication: int
    appointments: int
