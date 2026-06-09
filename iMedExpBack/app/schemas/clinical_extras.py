from datetime import datetime

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    kind: str = Field(..., min_length=1, max_length=60)
    message: str = Field(..., min_length=1, max_length=1000)


class NotificationResponse(BaseModel):
    id: int
    patient_id: int
    kind: str
    message: str
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


class CertificateCreate(BaseModel):
    patient_id: int
    title: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1, max_length=4000)


class CertificateResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    title: str
    body: str
    issued_at: datetime
    model_config = {"from_attributes": True}
