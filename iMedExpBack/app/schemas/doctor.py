import re
from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

PHONE_REGEX = re.compile(r"^[0-9]{10}$")
LICENSE_REGEX = re.compile(r"^\d{7,8}$")


def _validate_license(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    normalized = v.strip()
    if not LICENSE_REGEX.match(normalized):
        raise ValueError("La cédula profesional debe tener 7 u 8 dígitos")
    return normalized

class ShiftCreate(BaseModel):
    institution_id: Optional[int] = None
    weekday: Optional[int] = Field(None, ge=0, le=6)
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: time
    end_time: time
    assigned_office: Optional[str] = None
    location: Optional[str] = None
    shift_type: Optional[str] = None

    @model_validator(mode="after")
    def validate_weekday_present(self) -> "ShiftCreate":
        if self.weekday is None and self.day_of_week is None:
            raise ValueError("weekday es obligatorio")
        return self

    @field_validator("end_time")
    @classmethod
    def validate_time_order(cls, v: time, info) -> time:
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("La hora de fin debe ser posterior a la de inicio")
        return v

class ShiftResponse(BaseModel):
    id: int
    doctor_id: int
    institution_id: Optional[int] = None
    weekday: int
    start_time: time
    end_time: time
    assigned_office: Optional[str]
    shift_type: Optional[str] = None

    model_config = {"from_attributes": True}


class DoctorCreate(BaseModel):
    user_id: int
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    general_license: str = Field(..., min_length=1)
    specialty_license: Optional[str] = None
    specialty_id: int
    sub_specialty_id: Optional[int] = None
    graduation_university: Optional[str] = None
    contact_phone: Optional[str] = None
    office_location: Optional[str] = None

    @field_validator("general_license", "specialty_license")
    @classmethod
    def validate_license(cls, v: Optional[str]) -> Optional[str]:
        return _validate_license(v)

    @field_validator("contact_phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not PHONE_REGEX.match(v):
            raise ValueError("El teléfono debe tener exactamente 10 dígitos")
        return v


class DoctorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty_license: Optional[str] = None
    graduation_university: Optional[str] = None
    contact_phone: Optional[str] = None
    office_location: Optional[str] = None

    @field_validator("specialty_license")
    @classmethod
    def validate_license(cls, v: Optional[str]) -> Optional[str]:
        return _validate_license(v)

    @field_validator("contact_phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not PHONE_REGEX.match(v):
            raise ValueError("El teléfono debe tener exactamente 10 dígitos")
        return v


class DoctorActiveUpdate(BaseModel):
    is_active: bool


class DoctorStatusResponse(BaseModel):
    doctor_id: int
    user_id: int
    is_active: bool


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    general_license: str
    specialty_id: int
    sub_specialty_id: Optional[int] = None
    specialty_license: Optional[str]
    graduation_university: Optional[str] = None
    contact_phone: Optional[str]
    office_location: Optional[str]
    institution_id: Optional[int] = None
    clearance_level: int
    is_active: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_doctor(cls, doctor: object) -> "DoctorResponse":
        from app.models.doctor import Doctor as DoctorModel
        d: DoctorModel = doctor
        user_attrs={}
        v_is_active = True
        try:
            user_attrs = getattr(d.user, "access_attributes", {}) if d.user else {}
            v_is_active = bool(getattr(d.user, "is_active", True)) if d.user else True
        except Exception:
            user_attrs={}

        return cls(
            id=d.id,
            user_id=d.user_id,
            first_name=d.first_name,
            last_name=d.last_name,
            general_license=d.general_license,
            specialty_id=d.specialty_id,
            sub_specialty_id=getattr(d, "sub_specialty_id", None),
            specialty_license=d.specialty_license,
            graduation_university=getattr(d, "graduation_university", None),
            contact_phone=d.contact_phone,
            office_location=d.office_location,
            institution_id=getattr(getattr(d, "user", None), "institution_id", None),
            clearance_level=int(user_attrs.get("clearance_level", 1)),
            is_active=v_is_active,
            created_at=d.created_at
        )


class DoctorListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: list[DoctorResponse]


class DoctorFullResponse(DoctorResponse):
    shifts: list[ShiftResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_doctor(cls, doctor: object) -> "DoctorFullResponse":
        from app.models.doctor import Doctor as DoctorModel
        d: DoctorModel = doctor

        base_obj = DoctorResponse.from_orm_doctor(d)
        full_data = base_obj.model_dump()

        full_data.update({
            "graduation_university": getattr(d, "graduation_university", None),
            "sub_specialty_id": getattr(d, "sub_specialty_id", None),
            "shifts": [ShiftResponse.model_validate(s) for s in getattr(d, "shifts", [])]
        })

        return cls(**full_data)
