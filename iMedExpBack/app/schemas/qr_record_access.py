from datetime import date, datetime
from pydantic import BaseModel


class QRAccessGenerate(BaseModel):
    institution_id: int


class QRAccessRedeem(BaseModel):
    verification_code: str
    institution_id: int | None = None


class QRAccessResponse(BaseModel):
    id: int
    patient_id: int
    verification_code: str
    expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class PatientSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str | None
    blood_type: str | None
    city: str | None
    state: str | None

    model_config = {"from_attributes": True}


class QRRedeemResponse(BaseModel):
    message: str
    patient: PatientSummary
