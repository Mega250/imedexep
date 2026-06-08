from pydantic import BaseModel, computed_field, ConfigDict, Field
from datetime import datetime
from typing import Optional


class VitalSignCreate(BaseModel):
    patient_id: int
    weight: Optional[float] = Field(None, ge=0.5, le=400)
    height: Optional[float] = Field(None, ge=0.3, le=2.5)
    heart_rate: Optional[int] = Field(None, ge=20, le=300)
    systolic_bp: Optional[int] = Field(None, ge=50, le=300)
    diastolic_bp: Optional[int] = Field(None, ge=30, le=200)
    oxygen_saturation: Optional[float] = Field(None, ge=50, le=100)
    body_temperature: Optional[float] = Field(None, ge=30, le=45)
    source: Optional[str] = "manual"


class VitalSignResponse(BaseModel):
    id: int
    patient_id: int
    recorded_at: datetime
    weight: Optional[float] = None
    height: Optional[float] = None
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    body_temperature: Optional[float] = None

    @computed_field
    @property
    def imc(self) -> Optional[float]:
        if self.weight and self.height and self.height > 0:
            return round(self.weight / (self.height ** 2), 2)
        return None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_vital(cls, obj: object) -> "VitalSignResponse":
        from app.models.vital_sign import VitalSign as VModel
        v: VModel = obj
        return cls(
            id=v.id,
            patient_id=v.patient_id,
            recorded_at=v.recorded_at,
            weight=float(v.weight) if v.weight is not None else None,
            height=float(v.height) if v.height is not None else None,
            heart_rate=v.heart_rate,
            systolic_bp=v.systolic_bp,
            diastolic_bp=v.diastolic_bp,
            oxygen_saturation=float(v.oxygen_saturation) if v.oxygen_saturation is not None else None,
            body_temperature=float(v.body_temperature) if v.body_temperature is not None else None,
        )