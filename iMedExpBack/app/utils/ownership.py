from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.user import UserRole
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.auth import TokenPayload


_PATIENT = UserRole.patient.value
_DOCTOR = UserRole.doctor.value
_SECRETARY = UserRole.secretary.value
_INSTITUTION_ADMIN = UserRole.institution_admin.value
_SUPERADMIN = UserRole.superadmin.value


async def ensure_patient_ownership(
    session: AsyncSession,
    token: TokenPayload,
    patient_id: int,
) -> None:
    if token.role == _SUPERADMIN:
        return
    if token.role == _PATIENT:
        repo = PatientRepository(session)
        own = await repo.get_by_user_id(token.user_id)
        if not own or own.id != patient_id:
            raise ForbiddenError("Solo puedes consultar tu propio expediente")
        return
    if token.role in (_DOCTOR, _SECRETARY, _INSTITUTION_ADMIN):
        return
    raise ForbiddenError("No tienes permiso para este expediente")


async def resolve_patient_id_for_token(
    session: AsyncSession,
    token: TokenPayload,
) -> int:
    if token.role != _PATIENT:
        raise ForbiddenError("Solo aplica para pacientes")
    own = await PatientRepository(session).get_by_user_id(token.user_id)
    if not own:
        raise NotFoundError("Paciente no encontrado")
    return own.id


async def resolve_doctor_id_for_token(
    session: AsyncSession,
    token: TokenPayload,
) -> int:
    if token.role != _DOCTOR:
        raise ForbiddenError("Solo aplica para doctores")
    doctor = await DoctorRepository(session).get_by_id_from_user(token.user_id)
    if not doctor:
        raise NotFoundError("Doctor no encontrado")
    return doctor.id


def ensure_institution_jurisdiction(
    token: TokenPayload,
    institution_id: int,
) -> None:
    if token.role == _SUPERADMIN:
        return
    if token.role in (_INSTITUTION_ADMIN, _SECRETARY):
        if token.institution_id is None or token.institution_id != institution_id:
            raise ForbiddenError("No tienes permisos sobre esa institución")
        return
    raise ForbiddenError("No tienes permiso para esta institución")


async def ensure_doctor_management_rights(
    session: AsyncSession,
    token: TokenPayload,
    doctor_id: int,
) -> None:
    if token.role == _SUPERADMIN:
        return

    doctor = await DoctorRepository(session).get_by_id(doctor_id)
    if not doctor or doctor.deleted_at:
        raise NotFoundError("Doctor no encontrado")

    if token.role == _DOCTOR:
        if doctor.user_id != token.user_id:
            raise ForbiddenError("Solo puedes modificar tu propio perfil de doctor")
        return

    if token.role == _INSTITUTION_ADMIN:
        from sqlalchemy import select
        from app.models.user import User

        result = await session.execute(
            select(User.institution_id).where(User.id == doctor.user_id)
        )
        doctor_inst = result.scalar_one_or_none()
        if (
            token.institution_id is None
            or doctor_inst is None
            or doctor_inst != token.institution_id
        ):
            raise ForbiddenError("Ese doctor no pertenece a tu institución")
        return

    raise ForbiddenError("No tienes permiso para modificar este doctor")
