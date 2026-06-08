from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime, date
from typing import Optional, List, Any


class TreatmentDetailBase(BaseModel):
    medication_id: Optional[int] = None
    free_text_medication: Optional[str] = None
    dosage: str
    frequency: str
    duration_days: int
    start_date: date
    additional_notes: Optional[str] = None


class TreatmentDetailCreate(TreatmentDetailBase):
    pass


class TreatmentDetailResponse(TreatmentDetailBase):
    id: int
    prescription_id: int
    calculated_end_date: Optional[date] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class PrescriptionBase(BaseModel):
    general_instructions: Optional[str] = None


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionResponse(PrescriptionBase):
    id: int
    consultation_id: int
    patient_id: int
    doctor_id: int

    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None

    issued_at: datetime
    signed_at: Optional[datetime] = None
    signature_hash: Optional[str] = None

    treatments: List[TreatmentDetailResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def extract_names(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            if hasattr(data, "doctor") and data.doctor:
                doc = data.doctor
                data.doctor_name = f"Dr. {doc.first_name} {doc.last_name}"

            if hasattr(data, "patient") and data.patient:
                p = data.patient
                data.patient_name = f"{p.first_name} {p.last_name}"

        return data


class PrescriptionSign(BaseModel):
    signature_hash: str
