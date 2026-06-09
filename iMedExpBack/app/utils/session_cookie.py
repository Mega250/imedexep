from fastapi import Request, Response

from app.core.config import settings
from app.schemas.auth import TokenResponse

REFRESH_COOKIE_NAME = "imedexp_refresh"
PLATFORM_HEADER = "x-client-platform"
WEB_PLATFORM_VALUE = "web"
_REFRESH_COOKIE_MAX_AGE = max(60, settings.jwt_refresh_expire_days * 24 * 60 * 60)


def is_web_client(request: Request) -> bool:
    value = request.headers.get(PLATFORM_HEADER, "").strip().lower()
    return value == WEB_PLATFORM_VALUE


def apply_refresh_cookie(response: Response, refresh_token: str) -> None:
    secure_cookie = settings.app_env not in {"development", "testing"}
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=_REFRESH_COOKIE_MAX_AGE,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        path="/api/v1/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/v1/auth")


def read_refresh_cookie(request: Request) -> str | None:
    return request.cookies.get(REFRESH_COOKIE_NAME)


def finalize_token_response(
    request: Request,
    response: Response,
    tokens: TokenResponse,
) -> TokenResponse:
    if not is_web_client(request):
        return tokens
    apply_refresh_cookie(response, tokens.refresh_token)
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token="",
        token_type=tokens.token_type,
    )
