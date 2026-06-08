from pydantic import BaseModel
from datetime import datetime

class SecretaryDoctorAssignmentRequest(BaseModel):
    secretary_id: int

class SecretaryDoctorResponse(BaseModel):
    id: int
    secretary_id: int
    doctor_id: int
    assigned_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True