from pydantic import BaseModel, ConfigDict, Field


class DiseaseResponse(BaseModel):
    id: int
    name: str
    cie10_code: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DiseaseEnsureRequest(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    cie10_code: str | None = Field(default=None, max_length=10)
