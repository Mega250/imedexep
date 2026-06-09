import re
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from app.models.institution import InstitutionType

PHONE_REGEX = re.compile(r"^\d{10}$")


def _validate_phone(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    normalized = v.strip()
    if normalized == "":
        return normalized
    if not PHONE_REGEX.match(normalized):
        raise ValueError("El teléfono debe tener 10 dígitos.")
    return normalized

class InstitutionBase(BaseModel):
    type: InstitutionType
    name: str = Field(..., min_length=2, max_length=255)
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    policies: dict = {}
    rfc: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return _validate_phone(v)

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    policies: Optional[dict] = None
    rfc: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return _validate_phone(v)

class InstitutionResponse(InstitutionBase):
    id: int
    created_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_institution(cls, institution: object) -> "InstitutionResponse":
        from app.models.institution import Institution as InstitutionModel
        i: InstitutionModel = institution
        return cls(
            id=i.id,
            type=i.type,
            name=i.name,
            address=i.address,
            phone=i.phone,
            is_active=i.is_active,
            policies=getattr(i, "policies", None) or {},
            rfc=getattr(i, "rfc", None),
            city=getattr(i, "city", None),
            state=getattr(i, "state", None),
            postal_code=getattr(i, "postal_code", None),
            email=getattr(i, "email", None),
            website=getattr(i, "website", None),
            created_at=i.created_at,
            deleted_at=i.deleted_at
        )

class InstitutionAdminCreate(BaseModel):
    email: EmailStr
    admin_name: str = Field(..., min_length=2, description="Nombre completo del director/admin")
    password: str = Field(..., min_length=8, description="Contraseña asignada manualmente")

class InstitutionAdminUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, description="Nueva contraseña (opcional)")
    admin_name: Optional[str] = Field(None, min_length=2, description="Nuevo nombre del director")
    is_active: Optional[bool] = Field(None, description="Permite suspender temporalmente al admin")

class InstitutionAdminResponse(BaseModel):
    id: int
    institution_id: int
    email: str
    admin_name: str
    is_active: bool

    @classmethod
    def from_orm_user(cls, user):
        access_attributes = user.access_attributes or {}
        return cls(
            id=user.id,
            institution_id=user.institution_id,
            email=user.email,
            admin_name=access_attributes.get("admin_name", "Sin nombre"),
            is_active=user.is_active
        )
