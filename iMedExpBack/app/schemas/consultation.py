from datetime import datetime
from pydantic import BaseModel, Field


class ConsultationCreate(BaseModel):
    patient_id: int
    chief_complaint: str | None = Field(default=None, max_length=1000)
    symptoms: str | None = Field(default=None, max_length=2000)
    medical_notes: str | None = Field(default=None, max_length=5000)
    sensitivity_level: int = Field(default=1, ge=1, le=5)
    specialty_data: dict | None = None


class ConsultationResponse(BaseModel):
    id: int
    parent_id: int | None
    version: int
    is_current: bool
    appointment_id: int | None
    institution_id: int
    patient_id: int
    doctor_id: int
    consulted_at: datetime
    chief_complaint: str | None
    symptoms: str | None
    medical_notes: str | None
    sensitivity_level: int
    specialty_data: dict | None
    signature_hash: str | None
    signed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConsultationListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: list[ConsultationResponse]
