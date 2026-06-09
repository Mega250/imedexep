from datetime import date, datetime

from pydantic import BaseModel, Field


class VaccineCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    dose: str | None = Field(default=None, max_length=255)
    applied_on: date | None = None
    notes: str | None = Field(default=None, max_length=1000)


class VaccineResponse(BaseModel):
    id: int
    name: str
    dose: str | None
    applied_on: date | None
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class SurgeryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    performed_on: date | None = None
    hospital: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=1000)


class SurgeryResponse(BaseModel):
    id: int
    name: str
    performed_on: date | None
    hospital: str | None
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class AllergyCreate(BaseModel):
    substance: str = Field(..., min_length=1, max_length=255)
    reaction: str | None = Field(default=None, max_length=255)
    severity: str | None = Field(default=None, max_length=60)
    notes: str | None = Field(default=None, max_length=1000)


class AllergyResponse(BaseModel):
    id: int
    substance: str
    reaction: str | None
    severity: str | None
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class AntecedentCreate(BaseModel):
    kind: str = Field(..., min_length=1, max_length=120)
    description: str = Field(..., min_length=1, max_length=500)
    notes: str | None = Field(default=None, max_length=1000)


class AntecedentResponse(BaseModel):
    id: int
    kind: str
    description: str
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}
