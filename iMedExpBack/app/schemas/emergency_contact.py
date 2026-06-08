import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

PHONE_REGEX = re.compile(r"^[0-9]{10}$")
NAME_REGEX = re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{1,254}$")
RELATIONSHIP_REGEX = re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{1,80}$")


class EmergencyContactCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str
    relationship: str = Field(..., min_length=1, max_length=255)
    is_primary: bool = False

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not PHONE_REGEX.match(v):
            raise ValueError("El teléfono debe tener exactamente 10 dígitos")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        normalized = " ".join(v.strip().split())
        if not NAME_REGEX.match(normalized):
            raise ValueError("El nombre debe contener solo letras, espacios y puntuacion basica")
        return normalized

    @field_validator("relationship")
    @classmethod
    def validate_relationship(cls, v: str) -> str:
        normalized = " ".join(v.strip().split())
        if not RELATIONSHIP_REGEX.match(normalized):
            raise ValueError("El parentesco debe contener solo letras, espacios y puntuacion basica")
        return normalized


class EmergencyContactUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    relationship: str | None = None
    is_primary: bool | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is not None and not PHONE_REGEX.match(v):
            raise ValueError("El teléfono debe tener exactamente 10 dígitos")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        normalized = " ".join(v.strip().split())
        if not NAME_REGEX.match(normalized):
            raise ValueError("El nombre debe contener solo letras, espacios y puntuacion basica")
        return normalized

    @field_validator("relationship")
    @classmethod
    def validate_relationship(cls, v: str | None) -> str | None:
        if v is None:
            return None
        normalized = " ".join(v.strip().split())
        if not RELATIONSHIP_REGEX.match(normalized):
            raise ValueError("El parentesco debe contener solo letras, espacios y puntuacion basica")
        return normalized


class EmergencyContactResponse(BaseModel):
    id: int
    patient_id: int
    full_name: str
    phone: str
    relationship: str
    is_primary: bool
    created_at: datetime

    model_config = {"from_attributes": True}
