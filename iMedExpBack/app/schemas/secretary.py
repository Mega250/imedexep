from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class SecretaryCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Contraseña temporal para la secretaria")
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    employee_number: Optional[str] = None
    contact_phone: Optional[str] = Field(None, pattern=r"^[0-9]{10}$", description="Debe tener exactamente 10 dígitos")

class SecretaryUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1)
    last_name: Optional[str] = Field(None, min_length=1)
    employee_number: Optional[str] = None
    contact_phone: Optional[str] = Field(None, pattern=r"^[0-9]{10}$")
    is_active: Optional[bool] = None 

class SecretaryResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    employee_number: Optional[str]
    contact_phone: Optional[str]
    
    email: str
    is_active: bool
    created_at: datetime
    deleted_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SecretaryDoctorListResponse(BaseModel):
    id: int
    secretary_id: int
    secretary_name: str
    doctor_id: int
    doctor_name: str
    assigned_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
class SecretaryDoctorAssign(BaseModel):
    doctor_id: int = Field(..., description="ID del doctor al que se le asignará la secretaria")
