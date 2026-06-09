from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.schemas.auth import TokenPayload
from app.utils.session_context import apply_rls_context

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenPayload:
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise UnauthorizedError("Se requiere access token")
        user_id = int(payload["sub"])
        role = str(payload["role"])
    except (JWTError, KeyError, TypeError, ValueError) as exc:
        raise UnauthorizedError("Token inválido o expirado") from exc

    return TokenPayload(
        user_id=user_id,
        role=role,
        institution_id=payload.get("institution_id"),
    )

def require_roles(*roles: str):
    async def dependency(
        token: TokenPayload = Depends(get_current_user),
    ) -> TokenPayload:
        if token.role not in roles:
            raise ForbiddenError("No tienes permiso para realizar esta acción")
        return token

    return dependency

async def get_rls_session(
    request: Request,
    token: TokenPayload = Depends(get_current_user),
) -> AsyncGenerator[AsyncSession, None]:
    ip = request.client.host if request.client else "0.0.0.0"

    async with AsyncSessionLocal() as session:
        async with session.begin():
            await apply_rls_context(
                session,
                user_id=token.user_id,
                role=token.role,
                institution_id=token.institution_id,
                ip_address=ip,
            )
            yield session

async def get_plain_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        async with session.begin():
            yield session
