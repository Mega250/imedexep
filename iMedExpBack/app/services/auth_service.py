import json
from datetime import UTC, datetime

from sqlalchemy import select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import UnauthorizedError, UnprocessableError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.patient import Patient
from app.models.user import User, UserRole
from app.core.exceptions import ConflictError
from app.schemas.auth import DoctorRegisterRequest, PatientRegisterRequest
from app.schemas.auth import TokenResponse
from sqlalchemy import text as sa_text

from app.utils.encryption import get_encryptor

_UNSET = object()


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def login(self, email: str, password: str) -> TokenResponse:

        user = await self._get_active_user_by_email(email)

        if not verify_password(password, user.password_hash):
            await self.session.execute(
                sa_text("SELECT fn_post_login_update(:uid, false)"),
                {"uid": user.id}
            )
            raise UnauthorizedError("Credenciales inválidas")

        if not getattr(user, "email_verified", False):
            raise UnauthorizedError(
                "email_not_verified: Debes verificar tu correo antes de iniciar sesión."
            )

        role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
        if role_value in ("institution_admin", "secretary", "doctor") and user.institution_id:
            inst_check = await self.session.execute(
                sa_text("SELECT fn_institution_is_active(:iid)"),
                {"iid": user.institution_id},
            )
            if inst_check.scalar_one() is not True:
                raise UnauthorizedError(
                    "Tu institución está pausada. Contacta al administrador de la plataforma."
                )

        await self.session.execute(
            sa_text("SELECT fn_post_login_update(:uid, true)"),
            {"uid": user.id}
        )

        return TokenResponse(
            access_token=create_access_token(
                user_id=user.id,
                role=user.role.value,
                institution_id=user.institution_id,
            ),
            refresh_token=create_refresh_token(user_id=user.id),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except Exception as exc:
            raise UnauthorizedError("Refresh token inválido o expirado") from exc

        if payload.get("type") != "refresh":
            raise UnauthorizedError("Token no es de tipo refresh")

        user_id = int(payload["sub"])
        result = await self.session.execute(
            sa_text("SELECT * FROM fn_get_user_for_refresh(:uid)"),
            {"uid": user_id},
        )
        row = result.mappings().one_or_none()
        if not row:
            raise UnauthorizedError("Usuario no encontrado, inactivo o no verificado")

        role_value = row["role"]
        if hasattr(role_value, "value"):
            role_value = role_value.value

        return TokenResponse(
            access_token=create_access_token(
                user_id=row["id"],
                role=role_value,
                institution_id=row["institution_id"],
            ),
            refresh_token=create_refresh_token(user_id=row["id"]),
        )

    async def get_user_by_id(self, user_id: int) -> User:
        result = await self.session.execute(
            select(User).where(User.id == user_id, User.deleted_at.is_(None))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise UnauthorizedError("Usuario no encontrado")
        return user

    async def update_user_profile(
        self,
        user_id: int,
        display_name: str | None | object = _UNSET,
        phone: str | None | object = _UNSET,
    ) -> User:
        user = await self.get_user_by_id(user_id)
        attrs = dict(user.access_attributes or {})

        if display_name is not _UNSET:
            if display_name:
                attrs["display_name"] = display_name.strip()
            else:
                attrs.pop("display_name", None)
            if user.role == UserRole.institution_admin:
                if display_name:
                    attrs["admin_name"] = display_name.strip()
                else:
                    attrs.pop("admin_name", None)
        if phone is not _UNSET:
            if phone:
                attrs["phone"] = phone
            else:
                attrs.pop("phone", None)

        user.access_attributes = attrs
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def _get_active_user_by_email(self, email: str) -> User:
        result = await self.session.execute(
            sa_text("SELECT * FROM fn_get_user_for_login(:email)"),
            {"email": email.lower()}
        )
        row = result.mappings().one_or_none()

        if not row:
            raise UnauthorizedError("Credenciales inválidas")

        data = dict(row)
        data["role"] = UserRole(data["role"])
        user = User(**data)

        if user.locked_until and user.locked_until > datetime.now(UTC):
            raise UnauthorizedError(
                f"Cuenta bloqueada hasta {user.locked_until.isoformat()}"
            )
        return user

    async def _increment_failed_logins(self, user_id: int) -> None:
        await self.session.execute(
            text(
                """
                UPDATE "user"
                SET failed_login_count = failed_login_count + 1,
                    locked_until = CASE
                        WHEN failed_login_count + 1 >= 5
                        THEN now() + INTERVAL '30 minutes'
                        ELSE locked_until
                    END
                WHERE id = :uid
                """
            ),
            {"uid": user_id},
        )

    async def register_patient(self, data: PatientRegisterRequest) -> dict:

        enc = get_encryptor()
        curp_encrypted = enc.encrypt(data.curp)
        curp_hash = enc.hash_curp(data.curp)
        phone_encrypted = enc.encrypt(data.phone) if data.phone else None
        password_hash = hash_password(data.password)

        try:
            health_questionnaire_json = (
                json.dumps(data.health_questionnaire)
                if data.health_questionnaire is not None
                else None
            )
            result = await self.session.execute(
                text("""
                    SELECT user_id, patient_id
                    FROM fn_register_patient_user(
                        :email, :password_hash, :curp_encrypted, :curp_hash,
                        :first_name, :last_name, :date_of_birth,
                        :gender, :blood_type, :phone_encrypted,
                        :street_address, :neighborhood, :city, :state,
                        :postal_code, CAST(:health_questionnaire AS jsonb)
                    )
                """),
                {
                    "email": data.email.lower(),
                    "password_hash": password_hash,
                    "curp_encrypted": curp_encrypted,
                    "curp_hash": curp_hash,
                    "first_name": data.first_name,
                    "last_name": data.last_name,
                    "date_of_birth": data.date_of_birth,
                    "gender": data.gender.value if data.gender else None,
                    "blood_type": data.blood_type.value if data.blood_type else None,
                    "phone_encrypted": phone_encrypted,
                    "street_address": data.street_address,
                    "neighborhood": data.neighborhood,
                    "city": data.city,
                    "state": data.state,
                    "postal_code": data.postal_code,
                    "health_questionnaire": health_questionnaire_json,
                }
            )
            row = result.mappings().one()
            user_id = row["user_id"]

        except Exception as e:
            err = str(e)
            if "DUPLICATE_EMAIL" in err:
                raise ConflictError("Ya existe una cuenta con ese correo")
            if "DUPLICATE_CURP" in err:
                raise ConflictError("Ya existe un paciente registrado con esa CURP")
            raise

        sent = await self.send_verification_code(user_id, data.email.lower())
        return {
            "message": "Código de verificación enviado a tu correo",
            "expires_at": sent["expires_at"],
            "next_resend_at": sent["next_resend_at"],
            "attempts_in_window": sent["attempts_in_window"],
        }

    async def send_verification_code(self, user_id: int, email: str) -> dict:
        from app.repositories.email_verification_repo import EmailVerificationRepository
        from app.utils.email import send_verification_code

        repo = EmailVerificationRepository(self.session)
        code, expires_at = await repo.create_code(user_id)
        await send_verification_code(email, code)
        status = await repo.resend_status(user_id)
        return {
            "expires_at": expires_at,
            "next_resend_at": status.next_resend_at,
            "attempts_in_window": status.attempts_in_window,
        }

    async def resend_code(self, email: str) -> dict:
        from app.repositories.email_verification_repo import (
            CODE_TTL_MINUTES,
            EmailVerificationRepository,
        )
        from datetime import UTC, datetime, timedelta

        now = datetime.now(UTC)
        default_response = {
            "expires_at": now + timedelta(minutes=CODE_TTL_MINUTES),
            "next_resend_at": now + timedelta(seconds=60),
            "attempts_in_window": 0,
        }

        try:
            user = await self._get_active_user_by_email(email)
        except UnauthorizedError:
            return default_response

        repo = EmailVerificationRepository(self.session)
        status = await repo.resend_status(user.id)
        if not status.can_resend:
            return {
                "expires_at": status.code_expires_at or default_response["expires_at"],
                "next_resend_at": status.next_resend_at,
                "attempts_in_window": status.attempts_in_window,
            }

        try:
            sent = await self.send_verification_code(user.id, email)
        except Exception:
            return default_response
        return sent

    async def verify_email(self, email: str, code: str) -> TokenResponse:
        from app.repositories.email_verification_repo import EmailVerificationRepository

        user = await self._get_active_user_by_email(email)
        repo = EmailVerificationRepository(self.session)

        verified = await repo.verify_code(user.id, code)
        if not verified:
            raise UnauthorizedError("Código inválido o expirado")

        await self.session.execute(
            sa_text(
                "SELECT set_session_context(:uid, :role, :inst, :ip)"
            ),
            {
                "uid": user.id,
                "role": user.role.value if hasattr(user.role, "value") else str(user.role),
                "inst": user.institution_id,
                "ip": "verify-email",
            },
        )
        result = await self.session.execute(
            sa_text(
                'UPDATE "user" SET email_verified = true '
                'WHERE id = :uid AND email_verified = false'
            ),
            {"uid": user.id},
        )
        await self.session.flush()
        if result.rowcount == 0:
            raise UnauthorizedError(
                "No pudimos marcar tu correo como verificado. Intenta de nuevo."
            )

        return TokenResponse(
            access_token=create_access_token(
                user_id=user.id,
                role=user.role.value,
                institution_id=user.institution_id,
            ),
            refresh_token=create_refresh_token(user_id=user.id),
        )
    

    async def request_password_reset(self, email: str) -> dict:
        from app.repositories.password_reset_repo import (
            CODE_TTL_MINUTES,
            PasswordResetRepository,
        )
        from app.utils.email import send_password_reset
        from datetime import UTC, datetime, timedelta

        now = datetime.now(UTC)
        default_response = {
            "expires_at": now + timedelta(minutes=CODE_TTL_MINUTES),
            "next_resend_at": now + timedelta(seconds=60),
            "attempts_in_window": 0,
        }

        try:
            user = await self._get_active_user_by_email(email)
        except UnauthorizedError:
            return default_response

        repo = PasswordResetRepository(self.session)
        status = await repo.resend_status(user.id)
        if not status.can_resend:
            return {
                "expires_at": status.code_expires_at or default_response["expires_at"],
                "next_resend_at": status.next_resend_at,
                "attempts_in_window": status.attempts_in_window,
            }

        try:
            code, expires_at = await repo.create_code(user.id)
            await send_password_reset(email.lower(), code)
            fresh_status = await repo.resend_status(user.id)
            return {
                "expires_at": expires_at,
                "next_resend_at": fresh_status.next_resend_at,
                "attempts_in_window": fresh_status.attempts_in_window,
            }
        except Exception:
            return default_response

    async def reset_password(self, email: str, code: str, new_password: str) -> dict:
        from app.repositories.password_reset_repo import PasswordResetRepository

        try:
            user = await self._get_active_user_by_email(email)
        except UnauthorizedError:
            raise UnauthorizedError("Código inválido o expirado")

        repo = PasswordResetRepository(self.session)
        ok = await repo.consume_code(user.id, code)
        if not ok:
            raise UnauthorizedError("Código inválido o expirado")

        await self.session.execute(
            sa_text(
                "SELECT set_session_context(:uid, :role, :inst, :ip)"
            ),
            {
                "uid": user.id,
                "role": user.role.value if hasattr(user.role, "value") else str(user.role),
                "inst": user.institution_id,
                "ip": "reset-password",
            },
        )
        new_hash = hash_password(new_password)
        result = await self.session.execute(
            sa_text(
                'UPDATE "user" SET password_hash = :pwd, '
                'failed_login_count = 0, locked_until = NULL '
                'WHERE id = :uid'
            ),
            {"pwd": new_hash, "uid": user.id},
        )
        await self.session.flush()
        if result.rowcount == 0:
            raise UnauthorizedError("No pudimos actualizar tu contraseña.")
        return {"message": "Contraseña actualizada"}

    async def change_password(self, user_id: int, current_password: str, new_password: str) -> dict:
        user = await self.get_user_by_id(user_id)
        if not verify_password(current_password, user.password_hash):
            raise UnprocessableError("Contraseña actual incorrecta")
        if verify_password(new_password, user.password_hash):
            raise UnprocessableError("La nueva contraseña debe ser distinta a la actual")

        await self.session.execute(
            sa_text("SELECT set_session_context(:uid, :role, :inst, :ip)"),
            {
                "uid": user.id,
                "role": user.role.value if hasattr(user.role, "value") else str(user.role),
                "inst": user.institution_id,
                "ip": "change-password",
            },
        )
        result = await self.session.execute(
            sa_text(
                'UPDATE "user" SET password_hash = :pwd, '
                'failed_login_count = 0, locked_until = NULL '
                'WHERE id = :uid AND deleted_at IS NULL'
            ),
            {"pwd": hash_password(new_password), "uid": user.id},
        )
        await self.session.flush()
        if result.rowcount == 0:
            raise UnauthorizedError("No pudimos actualizar tu contraseña.")
        return {"message": "Contraseña actualizada"}

    async def check_curp_available(self, curp: str) -> bool:
        enc = get_encryptor()
        curp_hash = enc.hash_curp(curp)
        result = await self.session.execute(
            sa_text("SELECT * FROM fn_get_patient_by_curp_hash(:p_hash)"),
            {"p_hash": curp_hash},
        )
        row = result.mappings().first()
        return row is None

    async def _verify_cedula_or_raise(self, cedula: str) -> None:
        if not settings.cedula_verification_enabled:
            return
        from app.utils.cedula import verify_cedula

        result = await verify_cedula(cedula)
        if result.status == "not_found":
            raise UnprocessableError(
                "No encontramos esa cédula profesional en el registro de la SEP. "
                "Verifica el número e inténtalo de nuevo."
            )
        if result.status == "found" and result.area == "non_health":
            titulo = result.titulo or "esa profesión"
            raise UnprocessableError(
                f"La cédula corresponde a «{titulo}», que no es del área de la salud. "
                "Regístrate con una cédula del área médica o de salud."
            )
        # found+health, found+unknown o no verificable -> continuar.

    async def register_doctor(self, data: DoctorRegisterRequest) -> dict:
        await self._verify_cedula_or_raise(data.general_license)
        password_hash = hash_password(data.password)

        try:
            safe_institution_id = data.institution_id if data.institution_id != 0 else None
            safe_sub_specialty = data.sub_specialty_id if data.sub_specialty_id != 0 else None
            result = await self.session.execute(
                text(
                    """
                    SELECT user_id, doctor_id
                    FROM fn_register_doctor_user(
                        :email, :password_hash, :first_name, :last_name,
                        :general_license, :specialty_license, :specialty_id,
                        :sub_specialty_id, :graduation_university, :contact_phone,
                        :office_location, :institution_id, :clearance_level
                    )
                    """
                ),
                {
                    "email": data.email.lower(),
                    "password_hash": password_hash,
                    "first_name": data.first_name,
                    "last_name": data.last_name,
                    "general_license": data.general_license,
                    "specialty_license": data.specialty_license,
                    "specialty_id": data.specialty_id,
                    "sub_specialty_id": safe_sub_specialty,
                    "graduation_university": data.graduation_university,
                    "contact_phone": data.contact_phone,
                    "office_location": data.office_location,
                    "institution_id": safe_institution_id,
                    "clearance_level": data.clearance_level,
                },
            )
            row = result.mappings().one()
            user_id = row["user_id"]
            sent = await self.send_verification_code(user_id, data.email.lower())

        except Exception as e:
            err = str(e)
            if "DUPLICATE_EMAIL" in err:
                raise ConflictError("Ya existe una cuenta con ese correo")
            if "DUPLICATE_LICENSE" in err:
                raise ConflictError("Ya existe un doctor registrado con esa cédula profesional")
            raise Exception(f"Error interno al registrar doctor: {str(e)}")

        return {
            "message": "Código de verificación enviado a tu correo",
            "expires_at": sent["expires_at"],
            "next_resend_at": sent["next_resend_at"],
            "attempts_in_window": sent["attempts_in_window"],
        }
