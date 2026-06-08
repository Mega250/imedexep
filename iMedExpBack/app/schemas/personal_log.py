from datetime import datetime
import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator


PersonalLogRole = Literal["estudiante", "docente", "admin"]

ALLOWED_FIELD_KEYS = {
    "control",
    "nombre",
    "edad",
    "spo2",
    "pulso",
    "ta",
    "temp",
    "med",
    "dosis",
    "notas",
}

FIELD_PATTERNS: dict[str, tuple[re.Pattern[str], str]] = {
    "control": (
        re.compile(r"^[A-Za-z0-9-]{3,24}$"),
        "No. de control debe usar 3 a 24 letras, números o guiones",
    ),
    "nombre": (
        re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'. -]{3,120}$"),
        "Nombre sólo admite letras, espacios, punto, apóstrofo y guiones",
    ),
    "edad": (re.compile(r"^(?:[1-9]\d?|1[01]\d|120)$"), "Edad debe estar entre 1 y 120"),
    "spo2": (re.compile(r"^(?:[5-9]\d|100)$"), "SpO2 debe estar entre 50 y 100"),
    "pulso": (re.compile(r"^(?:[3-9]\d|1\d{2}|2[0-2]\d|230)$"), "Pulso debe estar entre 30 y 230"),
    "ta": (re.compile(r"^\d{2,3}/\d{2,3}$"), "T/A debe usar formato 120/80"),
    "temp": (re.compile(r"^(?:3[0-9]|4[0-5])(?:\.\d)?$"), "Temperatura debe estar entre 30.0 y 45.9"),
}


class PersonalLogCreate(BaseModel):
    role: PersonalLogRole
    fields: dict[str, str] = Field(default_factory=dict)

    @field_validator("fields")
    @classmethod
    def _check_fields(cls, value: dict[str, str]) -> dict[str, str]:
        cleaned: dict[str, str] = {}
        for k, v in value.items():
            if k not in ALLOWED_FIELD_KEYS:
                raise ValueError(f"Campo no permitido: {k}")
            if not isinstance(v, str):
                raise ValueError(f"El valor de {k} debe ser texto")
            stripped = v.strip()
            if len(stripped) > 500:
                raise ValueError(f"El valor de {k} es demasiado largo")
            rule = FIELD_PATTERNS.get(k)
            if stripped and rule and not rule[0].match(stripped):
                raise ValueError(rule[1])
            if k == "ta" and stripped:
                systolic_str, diastolic_str = stripped.split("/")
                systolic = int(systolic_str)
                diastolic = int(diastolic_str)
                if not 50 <= systolic <= 260:
                    raise ValueError("La presión sistólica debe estar entre 50 y 260")
                if not 30 <= diastolic <= 160:
                    raise ValueError("La presión diastólica debe estar entre 30 y 160")
                if systolic <= diastolic:
                    raise ValueError("La presión sistólica debe ser mayor que la diastólica")
            if stripped:
                cleaned[k] = stripped
        return cleaned


class PersonalLogResponse(BaseModel):
    id: int
    role: PersonalLogRole
    fields: dict[str, str]
    created_at: datetime

    model_config = {"from_attributes": True}
