from fastapi import APIRouter, Depends, Request, Response

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_plain_session, get_rls_session
from app.core.exceptions import UnauthorizedError
from app.schemas.auth import (
    ChangePasswordRequest,
    DoctorRegisterRequest,
    ForgotPasswordRequest,
    LoginRequest,
    PatientRegisterRequest,
    RefreshRequest,
    ResendCodeRequest,
    ResetPasswordRequest,
    TokenPayload,
    TokenResponse,
    UserMeResponse,
    UserProfileUpdate,
    VerifyEmailRequest,
)
from app.schemas.common import MessageResponse, VerificationStatusResponse
from app.services.auth_service import AuthService
from app.utils.session_cookie import (
    clear_refresh_cookie,
    finalize_token_response,
    read_refresh_cookie,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse, summary="Iniciar sesión")
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_plain_session),
) -> TokenResponse:
    service = AuthService(session)
    tokens = await service.login(body.email, body.password)
    return finalize_token_response(request, response, tokens)


@router.post("/refresh", response_model=TokenResponse, summary="Renovar tokens")
async def refresh_tokens(
    body: RefreshRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_plain_session),
) -> TokenResponse:
    refresh_token = body.refresh_token or read_refresh_cookie(request)
    if not refresh_token:
        raise UnauthorizedError("Refresh token requerido")
    service = AuthService(session)
    tokens = await service.refresh(refresh_token)
    return finalize_token_response(request, response, tokens)


@router.post("/logout", response_model=MessageResponse, summary="Cerrar sesión")
async def logout(response: Response) -> MessageResponse:
    clear_refresh_cookie(response)
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserMeResponse, summary="Usuario actual")
async def get_me(
    token: TokenPayload = Depends(get_current_user),
    session: AsyncSession = Depends(get_rls_session),
) -> UserMeResponse:
    service = AuthService(session)
    user = await service.get_user_by_id(token.user_id)
    return UserMeResponse(
        id=user.id,
        email=user.email,
        role=user.role if isinstance(user.role, str) else user.role.value,
        institution_id=user.institution_id,
        is_active=user.is_active,
        display_name=(user.access_attributes or {}).get("display_name")
        or (user.access_attributes or {}).get("admin_name"),
        access_attributes=user.access_attributes or {},
    )


@router.patch("/me", response_model=UserMeResponse, summary="Actualizar usuario actual")
async def update_me(
    body: UserProfileUpdate,
    token: TokenPayload = Depends(get_current_user),
    session: AsyncSession = Depends(get_rls_session),
) -> UserMeResponse:
    service = AuthService(session)
    updates = {}
    if "display_name" in body.model_fields_set:
        updates["display_name"] = body.display_name
    if "phone" in body.model_fields_set:
        updates["phone"] = body.phone
    if "onboarding_completed" in body.model_fields_set:
        updates["onboarding_completed"] = body.onboarding_completed
    user = await service.update_user_profile(token.user_id, **updates)
    return UserMeResponse(
        id=user.id,
        email=user.email,
        role=user.role if isinstance(user.role, str) else user.role.value,
        institution_id=user.institution_id,
        is_active=user.is_active,
        display_name=(user.access_attributes or {}).get("display_name")
        or (user.access_attributes or {}).get("admin_name"),
        access_attributes=user.access_attributes or {},
    )

@router.get("/check-curp", summary="Verificar disponibilidad de CURP")
async def check_curp(
    curp: str,
    session: AsyncSession = Depends(get_plain_session),
) -> dict:
    service = AuthService(session)
    available = await service.check_curp_available(curp.strip().upper())
    return {"available": available}


@router.post("/register", response_model=VerificationStatusResponse, status_code=201, summary="Registro de paciente")
async def register_patient(
    body: PatientRegisterRequest,
    session: AsyncSession = Depends(get_plain_session),
) -> VerificationStatusResponse:
    service = AuthService(session)
    return VerificationStatusResponse(**(await service.register_patient(body)))




@router.post("/verify-email", response_model=TokenResponse, summary="Verificar correo")
async def verify_email(
    body: VerifyEmailRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_plain_session),
) -> TokenResponse:
    service = AuthService(session)
    tokens = await service.verify_email(body.email, body.code)
    return finalize_token_response(request, response, tokens)


@router.post("/resend-code", response_model=VerificationStatusResponse, status_code=200, summary="Reenviar código")
async def resend_code(
    body: ResendCodeRequest,
    session: AsyncSession = Depends(get_plain_session),
) -> VerificationStatusResponse:
    service = AuthService(session)
    result = await service.resend_code(body.email)
    return VerificationStatusResponse(message="Código reenviado exitosamente", **result)




@router.post(
    "/forgot-password",
    response_model=VerificationStatusResponse,
    status_code=200,
    summary="Solicitar código de recuperación",
)
async def forgot_password(
    body: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_plain_session),
) -> VerificationStatusResponse:
    service = AuthService(session)
    result = await service.request_password_reset(body.email)
    return VerificationStatusResponse(
        message="Si el correo existe, te enviamos un código de recuperación.",
        **result,
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=200,
    summary="Restablecer contraseña",
)
async def reset_password(
    body: ResetPasswordRequest,
    session: AsyncSession = Depends(get_plain_session),
) -> MessageResponse:
    service = AuthService(session)
    result = await service.reset_password(body.email, body.code, body.new_password)
    return MessageResponse(**result)


@router.post(
    "/change-password",
    response_model=MessageResponse,
    status_code=200,
    summary="Cambiar contraseña con sesión activa",
)
async def change_password(
    body: ChangePasswordRequest,
    token: TokenPayload = Depends(get_current_user),
    session: AsyncSession = Depends(get_rls_session),
) -> MessageResponse:
    service = AuthService(session)
    result = await service.change_password(
        token.user_id,
        body.current_password,
        body.new_password,
    )
    return MessageResponse(**result)


@router.post("/register-doctor", response_model=VerificationStatusResponse, status_code=201, summary="Registro de doctor")
async def register_doctor(
    body: DoctorRegisterRequest,
    session: AsyncSession = Depends(get_plain_session),
) -> VerificationStatusResponse:
    service = AuthService(session)
    return VerificationStatusResponse(**(await service.register_doctor(body)))
