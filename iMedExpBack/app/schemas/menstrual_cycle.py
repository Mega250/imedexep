import enum
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator, model_validator


class MenstrualFlow(str, enum.Enum):
    spotting = "spotting"
    light = "light"
    medium = "medium"
    heavy = "heavy"


class MenstrualCycleCreate(BaseModel):
    patient_id: int = Field(..., ge=1)
    period_start_date: date
    period_end_date: date | None = None
    flow: MenstrualFlow | None = None
    symptoms: dict[str, Any] = Field(default_factory=dict)
    notes: str | None = Field(default=None, max_length=1000)
    source: str = Field(default="manual", min_length=1, max_length=32)

    @field_validator("period_start_date")
    @classmethod
    def validate_start_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("La fecha de inicio no puede estar en el futuro")
        if value.year < 1900:
            raise ValueError("La fecha de inicio no es realista")
        return value

    @field_validator("period_end_date")
    @classmethod
    def validate_end_date(cls, value: date | None) -> date | None:
        if value and value > date.today():
            raise ValueError("La fecha de fin no puede estar en el futuro")
        return value

    @field_validator("symptoms")
    @classmethod
    def validate_symptoms(cls, value: dict[str, Any]) -> dict[str, Any]:
        if len(value) > 25:
            raise ValueError("Demasiados síntomas para un solo registro")
        for key, item in value.items():
            if not isinstance(key, str) or len(key) > 64:
                raise ValueError("Las claves de síntomas deben ser texto corto")
            if isinstance(item, (dict, tuple, set)):
                raise ValueError("Los síntomas no deben contener estructuras anidadas")
            if isinstance(item, list) and len(item) > 20:
                raise ValueError("Las listas de síntomas son demasiado largas")
            if isinstance(item, str) and len(item) > 255:
                raise ValueError("Los valores de síntomas deben ser texto corto")
        return value

    @field_validator("source")
    @classmethod
    def normalize_source(cls, value: str) -> str:
        return value.strip().lower()

    @model_validator(mode="after")
    def validate_date_range(self) -> "MenstrualCycleCreate":
        if self.period_end_date is None:
            return self
        if self.period_end_date < self.period_start_date:
            raise ValueError("La fecha de fin debe ser posterior o igual al inicio")
        duration_days = (self.period_end_date - self.period_start_date).days + 1
        if duration_days > 14:
            raise ValueError("La duración del sangrado excede el límite permitido")
        return self


class MenstrualCycleUpdate(BaseModel):
    period_start_date: date | None = None
    period_end_date: date | None = None
    flow: MenstrualFlow | None = None

    @field_validator("period_start_date")
    @classmethod
    def validate_start_date(cls, value: date | None) -> date | None:
        if value is None:
            return value
        if value > date.today():
            raise ValueError("La fecha de inicio no puede estar en el futuro")
        if value.year < 1900:
            raise ValueError("La fecha de inicio no es realista")
        return value

    @field_validator("period_end_date")
    @classmethod
    def validate_end_date(cls, value: date | None) -> date | None:
        if value and value > date.today():
            raise ValueError("La fecha de fin no puede estar en el futuro")
        return value

    @model_validator(mode="after")
    def validate_date_range(self) -> "MenstrualCycleUpdate":
        if self.period_start_date is None or self.period_end_date is None:
            return self
        if self.period_end_date < self.period_start_date:
            raise ValueError("La fecha de fin debe ser posterior o igual al inicio")
        duration_days = (self.period_end_date - self.period_start_date).days + 1
        if duration_days > 14:
            raise ValueError("La duración del sangrado excede el límite permitido")
        return self


class MenstrualCycleResponse(BaseModel):
    id: int
    patient_id: int
    period_start_date: date
    period_end_date: date | None
    flow: MenstrualFlow | None
    symptoms: dict[str, Any]
    notes: str | None
    source: str
    created_at: datetime

    @computed_field
    @property
    def duration_days(self) -> int | None:
        if self.period_end_date is None:
            return None
        return (self.period_end_date - self.period_start_date).days + 1

    model_config = ConfigDict(from_attributes=True)


class MenstrualCycleListResponse(BaseModel):
    patient_id: int
    total: int
    items: list[MenstrualCycleResponse]


class MenstrualPredictionModelInfo(BaseModel):
    name: str
    version: str
    training_sample_size: int
    features: list[str]


class MenstrualCyclePredictionResponse(BaseModel):
    patient_id: int
    as_of: date
    regularity: str
    average_cycle_length_days: float | None
    cycle_length_stddev_days: float | None
    predicted_cycle_length_days: int
    predicted_period_duration_days: int
    predicted_next_period_start: date
    predicted_next_period_end: date
    prediction_window_start: date
    prediction_window_end: date
    confidence: float
    recent_cycle_lengths_days: list[int]
    warnings: list[str]
    model: MenstrualPredictionModelInfo
