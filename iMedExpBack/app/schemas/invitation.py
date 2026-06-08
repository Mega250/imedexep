from pydantic import BaseModel, EmailStr
from datetime import datetime

class InvitationCreateRequest(BaseModel):
    doctor_email: EmailStr


class InvitationActionRequest(BaseModel):
    accept: bool


class InvitationResponse(BaseModel):
    id: int
    institution_id: int
    doctor_id: int
    doctor_name: str | None = None
    doctor_email: str | None = None
    status: str
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class InvitationSentListItem(BaseModel):
    id: int
    institution_id: int
    doctor_id: int
    doctor_name: str | None = None
    doctor_email: str | None = None
    status: str
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class InvitationActionResponse(BaseModel):
    message: str
    status: str


class InvitationListItem(BaseModel):
    id: int
    institution_id: int
    institution_name: str
    status: str
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
