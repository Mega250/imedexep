from pydantic import BaseModel, Field


class ScreenBlockItem(BaseModel):
    role: str
    screen_id: str


class ScreenBlockSet(BaseModel):
    role: str = Field(..., min_length=1)
    screen_id: str = Field(..., min_length=1)
    blocked: bool


class MyBlockedResponse(BaseModel):
    blocked: list[str]
