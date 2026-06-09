import logging
from datetime import datetime, timedelta, UTC
from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.models.invitation import InstitutionInvitation
from app.models.user import User
from app.models.doctor import Doctor
from app.models.institution import Institution
from app.repositories.invitation_repo import InvitationRepository
from app.utils.email import send_doctor_invitation

from app.core.exceptions import UnauthorizedError, ConflictError

logger = logging.getLogger(__name__)

class InvitationService:
    def __init__(self, session):
        self.session = session
        self.invitation_repo = InvitationRepository(session)

    def _verify_institution_admin(self, user: User):
        from app.models.user import UserRole
        role_str = getattr(user.role, 'value', user.role)

        if role_str != UserRole.institution_admin.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado. Solo los directores de clínica pueden generar invitaciones."
            )

    def _verify_doctor(self, user: User):
        from app.models.user import UserRole
        role_str = getattr(user.role, 'value', user.role)

        if role_str != UserRole.doctor.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado. Solo los doctores pueden aceptar invitaciones."
            )

    async def invite_doctor(self, admin_user, doctor_email: str):
        self._verify_institution_admin(admin_user)
        admin_user_id = getattr(admin_user, "user_id", None) or getattr(admin_user, "id", None)
        if admin_user_id is None:
            raise ConflictError("No se pudo identificar al director desde la sesion.")

        admin_result = await self.session.execute(
            select(User).where(User.id == int(admin_user_id))
        )
        admin_record = admin_result.scalar_one_or_none()
        if not admin_record:
            raise ConflictError("No se encontro la cuenta del director.")

        query = (
            select(Doctor)
            .options(selectinload(Doctor.user))
            .join(User)
            .where(User.email == doctor_email.lower())
        )
        result = await self.session.execute(query)
        doctor = result.scalar_one_or_none()

        if not doctor:
            raise ConflictError("El doctor con ese correo no está registrado en el sistema.")

        if doctor.user.institution_id == admin_record.institution_id:
            raise ConflictError("Este doctor ya pertenece a tu institución.")

        existing_result = await self.session.execute(
            select(InstitutionInvitation).where(
                InstitutionInvitation.institution_id == admin_record.institution_id,
                InstitutionInvitation.doctor_id == doctor.id,
                InstitutionInvitation.status == "pending",
            )
        )
        existing_invitation = existing_result.scalar_one_or_none()

        if existing_invitation and existing_invitation.expires_at and existing_invitation.expires_at > datetime.now(UTC):
            raise ConflictError(
                "Ya existe una invitación pendiente para este médico. Pídele que la acepte desde su consola (menú Invitaciones)."
            )

        if existing_invitation:
            existing_invitation.expires_at = datetime.now(UTC) + timedelta(days=7)
            new_invitation = existing_invitation
        else:
            new_invitation = InstitutionInvitation(
                institution_id=admin_record.institution_id,
                doctor_id=doctor.id
            )
            self.invitation_repo.add(new_invitation)

        await self.session.flush()
        await self.session.refresh(new_invitation)

        inst_q = await self.session.execute(
            select(Institution).where(Institution.id == admin_record.institution_id)
        )
        inst = inst_q.scalar_one_or_none()
        clinic_name = inst.name if inst else "tu clínica"

        admin_attrs = getattr(admin_record, "access_attributes", None) or {}
        inviter_name = admin_attrs.get("admin_name") if isinstance(admin_attrs, dict) else None
        if not inviter_name:
            inviter_name = admin_record.email

        try:
            await send_doctor_invitation(
                doctor_email=doctor.user.email,
                clinic_name=clinic_name,
                inviter_name=inviter_name,
            )
        except Exception as exc:
            logger.warning("Failed to send doctor invitation email to %s: %s", doctor.user.email, exc)

        doctor_name = f"{doctor.first_name or ''} {doctor.last_name or ''}".strip() or None
        doctor_email = doctor.user.email if doctor.user else None

        return {
            "id": new_invitation.id,
            "institution_id": new_invitation.institution_id,
            "doctor_id": new_invitation.doctor_id,
            "doctor_name": doctor_name,
            "doctor_email": doctor_email,
            "status": new_invitation.status,
            "expires_at": new_invitation.expires_at,
            "created_at": new_invitation.created_at,
        }

    async def list_for_institution(self, admin_user) -> list[dict]:
        self._verify_institution_admin(admin_user)
        admin_user_id = getattr(admin_user, "user_id", None) or getattr(admin_user, "id", None) or getattr(admin_user, "sub", None)
        if admin_user_id is None:
            raise ConflictError("No se pudo identificar al director desde la sesion.")

        admin_result = await self.session.execute(
            select(User).where(User.id == int(admin_user_id))
        )
        admin_record = admin_result.scalar_one_or_none()
        if not admin_record or not admin_record.institution_id:
            raise ConflictError("El director no existe o no tiene clínica asignada.")

        invitations = await self.invitation_repo.list_for_institution(admin_record.institution_id)
        items = []
        for inv in invitations:
            doc = inv.doctor
            doctor_name = None
            doctor_email = None
            if doc is not None:
                doctor_name = f"{doc.first_name or ''} {doc.last_name or ''}".strip() or None
                doctor_email = doc.user.email if doc.user else None
            items.append({
                "id": inv.id,
                "institution_id": inv.institution_id,
                "doctor_id": inv.doctor_id,
                "doctor_name": doctor_name,
                "doctor_email": doctor_email,
                "status": inv.status,
                "expires_at": inv.expires_at,
                "created_at": inv.created_at,
            })
        return items

    async def list_for_doctor(self, doctor_user) -> list[dict]:
        self._verify_doctor(doctor_user)
        user_id = getattr(doctor_user, "user_id", None) or getattr(doctor_user, "sub", None)
        if user_id is None:
            raise ConflictError("No se pudo extraer el ID del usuario desde el token.")
        invitations = await self.invitation_repo.list_for_doctor_user(int(user_id))
        return [
            {
                "id": inv.id,
                "institution_id": inv.institution_id,
                "institution_name": inv.institution.name if inv.institution else "",
                "status": inv.status,
                "expires_at": inv.expires_at,
                "created_at": inv.created_at,
            }
            for inv in invitations
        ]

    async def respond_to_invitation(self, doctor_user, invitation_id: int, accept: bool):
        self._verify_doctor(doctor_user)

        user_id = getattr(doctor_user, 'id', None) or getattr(doctor_user, 'sub', None) or getattr(doctor_user, 'user_id', None)

        if not user_id:
            raise ConflictError("No se pudo extraer el ID del usuario desde el token.")

        user_id = int(user_id)

        invitation = await self.invitation_repo.get_pending_invitation(
            invitation_id=invitation_id, 
            doctor_user_id=user_id
        )

        if not invitation or invitation.expires_at < datetime.now(UTC):
            raise ConflictError("Invitación no válida, no te pertenece o ya ha expirado.")

        if accept:
            await self.session.execute(
                update(User)
                .where(User.id == user_id)
                .values(institution_id=invitation.institution_id)
            )
            invitation.status = "accepted"
        else:
            invitation.status = "rejected"

        await self.session.flush()
        return {"status": invitation.status}
