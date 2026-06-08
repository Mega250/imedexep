import re
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.patient import BloodType, GenderType

CURP_REGEX = re.compile(r"^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$")
POSTAL_CODE_REGEX = re.compile(r"^\d{5}$")
PHONE_REGEX = re.compile(r"^\d{10}$")


def _validate_phone(v: str | None) -> str | None:
    if v is None:
        return v
    normalized = v.strip()
    if normalized == "":
        return normalized
    if not PHONE_REGEX.match(normalized):
        raise ValueError("El teléfono debe tener 10 dígitos.")
    return normalized

class PatientCreate(BaseModel):
    curp: str = Field(..., min_length=18, max_length=18)
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: date
    gender: GenderType | None = None
    blood_type: BloodType | None = None
    phone: str | None = None        
    street_address: str | None = None
    neighborhood: str | None = None
    postal_code: str | None = None
    city: str | None = None
    state: str | None = None
    sensitivity_level: int = Field(default=1, ge=1, le=5)

    @field_validator("curp")
    @classmethod
    def validate_curp(cls, v: str) -> str:
        normalized = v.strip().upper()
        if not CURP_REGEX.match(normalized):
            raise ValueError("CURP inválida")
        return normalized

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, v: str | None) -> str | None:
        if v is not None and not POSTAL_CODE_REGEX.match(v):
            raise ValueError("Código postal debe tener 5 dígitos")
        return v

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("La fecha de nacimiento debe ser en el pasado")
        if v.year < 1900:
            raise ValueError("Fecha de nacimiento no realista")
        return v


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    gender: GenderType | None = None
    blood_type: BloodType | None = None
    phone: str | None = None
    street_address: str | None = None
    neighborhood: str | None = None
    postal_code: str | None = None
    city: str | None = None
    state: str | None = None
    sensitivity_level: int | None = Field(default=None, ge=1, le=5)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        return _validate_phone(v)

class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    date_of_birth: date
    gender: GenderType | None
    blood_type: BloodType | None
    phone: str | None = None
    postal_code: str | None
    city: str | None
    state: str | None
    sensitivity_level: int
    created_at: datetime
    archived_at: datetime | None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_patient(cls, patient: object) -> "PatientResponse":
        from app.models.patient import Patient as PatientModel
        from app.utils.encryption import get_encryptor
        p: PatientModel = patient
        phone = None
        if p.phone_encrypted:
            phone = get_encryptor().decrypt(p.phone_encrypted)
        return cls(
            id=p.id,
            first_name=p.first_name,
            last_name=p.last_name,
            date_of_birth=p.date_of_birth,
            gender=p.gender,
            blood_type=p.blood_type,
            phone=phone,
            postal_code=p.postal_code,
            city=p.city,
            state=p.state,
            sensitivity_level=int(
                (p.privacy_attributes or {}).get("sensitivity_level", 1)
            ),
            created_at=p.created_at,
            archived_at=p.archived_at,
        )


class PatientListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: list[PatientResponse]


class PatientFullResponse(PatientResponse):
    street_address: str | None = None
    neighborhood: str | None = None
    weight_kg: float | None = None
    height_cm: float | None = None
    bmi: float | None = None
    systolic_bp: int | None = None
    diastolic_bp: int | None = None
    heart_rate: int | None = None
    temperature_celsius: float | None = None
    oxygen_saturation: int | None = None
    glucose_mg_dl: float | None = None
    glucose_risk: str | None = None
    created_at: datetime | None = None      
    archived_at: datetime | None = None 

    model_config = {"from_attributes": True}
