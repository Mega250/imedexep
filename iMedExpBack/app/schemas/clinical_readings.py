from datetime import date, datetime

from pydantic import BaseModel, Field


class GlucoseCreate(BaseModel):
    value_mg_dl: float = Field(..., gt=0, le=2000)
    context: str | None = Field(default=None, max_length=120)
    measured_on: date | None = None
    notes: str | None = Field(default=None, max_length=1000)


class GlucoseResponse(BaseModel):
    id: int
    value_mg_dl: float
    context: str | None
    measured_on: date | None
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class WeightCreate(BaseModel):
    weight_kg: float = Field(..., gt=0, le=700)
    height_m: float | None = Field(default=None, gt=0, le=3)
    measured_on: date | None = None
    notes: str | None = Field(default=None, max_length=1000)


class WeightResponse(BaseModel):
    id: int
    weight_kg: float
    height_m: float | None
    measured_on: date | None
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}
