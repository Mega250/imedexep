from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from datetime import date
from typing import Any
from app.models.patient import GenderType, BloodType


def _normalize_email(value: str) -> str:
    return value.strip().lower()


NAME_REGEX = re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.\-]+$")
LICENSE_REGEX = re.compile(r"^\d{7,8}$")
PASSWORD_UPPER = re.compile(r"[A-ZÁÉÍÓÚÜÑ]")
PASSWORD_DIGIT = re.compile(r"\d")
PASSWORD_SYMBOL = re.compile(r"[^A-Za-z0-9]")
NAME_REPEAT = re.compile(r"(.)\1{3,}")
NAME_SPAM = re.compile(r"^(j[aeo]|h[aeio]|qw|asdf|zxcv|test|prueba|aaaa|nnnn)+j?$", re.IGNORECASE)


def _validate_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if len(value) > 128:
        raise ValueError("La contraseña es demasiado larga")
    if not PASSWORD_UPPER.search(value):
        raise ValueError("La contraseña debe incluir al menos una mayúscula")
    if not PASSWORD_DIGIT.search(value):
        raise ValueError("La contraseña debe incluir al menos un número")
    if not PASSWORD_SYMBOL.search(value):
        raise ValueError("La contraseña debe incluir al menos un símbolo")
    return value


def _validate_human_name(value: str, label: str) -> str:
    cleaned = value.strip()
    if len(cleaned) < 2:
        raise ValueError(f"{label} debe tener al menos 2 caracteres")
    if not NAME_REGEX.match(cleaned):
        raise ValueError(f"{label} sólo admite letras, espacios y guiones")
    if NAME_REPEAT.search(cleaned):
        raise ValueError(f"{label} contiene caracteres repetidos no válidos")
    compact_letters = re.sub(r"[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]", "", cleaned)
    if len(compact_letters) >= 4:
        unique_chars = len(set(compact_letters.lower()))
        if unique_chars <= 2:
            raise ValueError(f"{label} no parece válido")
    if NAME_SPAM.match(compact_letters):
        raise ValueError(f"{label} no parece válido")
    if not re.search(r"[aeiouáéíóúAEIOUÁÉÍÓÚ]", cleaned):
        raise ValueError(f"{label} no parece válido")
    return cleaned


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class TokenPayload(BaseModel):
    user_id: int
    role: str
    institution_id: int | None = None


class UserMeResponse(BaseModel):
    id: int
    email: str
    role: str
    institution_id: int | None
    is_active: bool
    display_name: str | None = None
    access_attributes: dict[str, Any] | None = None

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    display_name: str | None = Field(None, min_length=2, max_length=120)
    phone: str | None = Field(None, max_length=20)

    @field_validator("display_name")
    @classmethod
    def _display_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return _validate_human_name(v, "Nombre")

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str | None) -> str | None:
        if not v:
            return None
        normalized = re.sub(r"\D", "", v)
        if normalized and not PHONE_REGEX.match(normalized):
            raise ValueError("El telefono debe tener exactamente 10 digitos")
        return normalized or None

CURP_REGEX = re.compile(r"^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$")
POSTAL_CODE_REGEX = re.compile(r"^\d{5}$")
_CURP_DICT = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"


def _curp_check_digit(curp: str) -> int:
    total = 0
    for index, char in enumerate(curp[:17]):
        value = _CURP_DICT.find(char)
        if value < 0:
            return -1
        total += value * (18 - index)
    return (10 - (total % 10)) % 10

class PatientRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    registrado: bool
    curp: str = Field(..., min_length=18, max_length=18)
    first_name: str = Field(..., min_length=2, max_length=80)
    last_name: str = Field(..., min_length=2, max_length=80)
    date_of_birth: date
    gender: GenderType | None = None
    blood_type: BloodType | None = None
    phone: str | None = None
    street_address: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    health_questionnaire: dict[str, Any] | None = None

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _validate_password(v)

    @field_validator("first_name")
    @classmethod
    def _first_name(cls, v: str) -> str:
        return _validate_human_name(v, "Nombre")

    @field_validator("last_name")
    @classmethod
    def _last_name(cls, v: str) -> str:
        return _validate_human_name(v, "Apellidos")

    @field_validator("curp")
    @classmethod
    def validate_curp(cls, v: str) -> str:
        normalized = v.strip().upper()
        if not CURP_REGEX.match(normalized):
            raise ValueError("CURP inválida")
        expected = _curp_check_digit(normalized)
        if expected < 0 or str(expected) != normalized[17]:
            raise ValueError("El dígito verificador de la CURP no coincide")
        return normalized

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: date) -> date:
        if v >= date.today():
            raise ValueError("La fecha de nacimiento debe ser en el pasado")
        if v.year < 1900:
            raise ValueError("Fecha de nacimiento no realista")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if not v:
            return None
        normalized = re.sub(r"\D", "", v)
        if not PHONE_REGEX.match(normalized):
            raise ValueError("El teléfono debe tener exactamente 10 dígitos")
        return normalized

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, v: str | None) -> str | None:
        if not v:
            return None
        normalized = re.sub(r"\D", "", v)
        if not POSTAL_CODE_REGEX.match(normalized):
            raise ValueError("El código postal debe tener 5 dígitos")
        return normalized
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=8, max_length=8)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v

    @field_validator("code")
    @classmethod
    def _normalize_code(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("new_password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _validate_password(v)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _validate_password(v)


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v


class ResendCodeRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v

PHONE_REGEX = re.compile(r"^[0-9]{10}$")

class DoctorRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=2, max_length=80)
    last_name: str = Field(..., min_length=2, max_length=80)
    general_license: str = Field(..., min_length=7, max_length=8)
    specialty_license: str | None = None
    specialty_id: int = Field(..., ge=1)
    sub_specialty_id: int | None = None
    graduation_university: str | None = None
    contact_phone: str | None = None
    office_location: str | None = None
    institution_id: int | None = None
    clearance_level: int = Field(default=1, ge=1, le=5)

    @field_validator("email", mode="before")
    @classmethod
    def _normalize(cls, v):
        return _normalize_email(v) if isinstance(v, str) else v

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _validate_password(v)

    @field_validator("first_name")
    @classmethod
    def _first_name(cls, v: str) -> str:
        return _validate_human_name(v, "Nombre")

    @field_validator("last_name")
    @classmethod
    def _last_name(cls, v: str) -> str:
        return _validate_human_name(v, "Apellidos")

    @field_validator("general_license")
    @classmethod
    def _license(cls, v: str) -> str:
        normalized = v.strip()
        if not LICENSE_REGEX.match(normalized):
            raise ValueError("La cédula profesional debe tener 7 u 8 dígitos")
        return normalized

    @field_validator("specialty_license")
    @classmethod
    def _specialty_license(cls, v: str | None) -> str | None:
        if v is None:
            return None
        normalized = v.strip()
        if not LICENSE_REGEX.match(normalized):
            raise ValueError(
                "La cédula de especialidad debe tener 7 u 8 dígitos"
            )
        return normalized

    @field_validator("contact_phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is not None and not PHONE_REGEX.match(v):
            raise ValueError("El teléfono debe tener exactamente 10 dígitos")
        return v
