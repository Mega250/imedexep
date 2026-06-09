from datetime import datetime
from pydantic import BaseModel, Field


class DiagnosisCreate(BaseModel):
    disease_id: int
    diagnosis_type: str = Field(default="primary")
    additional_notes: str | None = Field(default=None, max_length=2000)


class DiagnosisResponse(BaseModel):
    id: int
    consultation_id: int
    disease_id: int
    diagnosis_type: str
    additional_notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
