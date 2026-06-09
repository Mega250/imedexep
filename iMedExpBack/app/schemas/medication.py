from pydantic import BaseModel, ConfigDict
from typing import Optional

class MedicationCreate(BaseModel):
    generic_name: str
    commercial_name: Optional[str] = None
    presentation: Optional[str] = None
    administration_route: Optional[str] = None

class MedicationResponse(BaseModel):
    id: int
    generic_name: str
    commercial_name: Optional[str] = None
    presentation: Optional[str] = None
    administration_route: Optional[str] = None
    display_name: str

    model_config = ConfigDict(from_attributes=True)
