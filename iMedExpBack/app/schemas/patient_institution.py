from datetime import datetime
from pydantic import BaseModel


class PatientInstitutionCreate(BaseModel):
    patient_id: int
    institution_id: int
    record_number: str | None = None


class PatientInstitutionResponse(BaseModel):
    id: int
    patient_id: int
    institution_id: int
    record_number: str | None
    institution_name: str | None = None
    linked_at: datetime
    unlinked_at: datetime | None

    model_config = {"from_attributes": True}
