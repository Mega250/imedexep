from datetime import datetime
from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class VerificationStatusResponse(BaseModel):
    message: str
    expires_at: datetime
    next_resend_at: datetime
    attempts_in_window: int
    debug_code: str | None = None
