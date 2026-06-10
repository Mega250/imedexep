from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnprocessableError,
)
from app.models.appointment import AppointmentStatus
from app.models.institution import Institution
from app.models.patient_institution import PatientInstitution
from app.models.user import UserRole
from app.repositories.appointment_repo import AppointmentRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentListResponse,
    AppointmentResponse,
    AppointmentUpdate,
)
from app.schemas.auth import TokenPayload
from app.utils.ownership import (
    resolve_doctor_id_for_token,
    resolve_patient_id_for_token,
)


class AppointmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = AppointmentRepository(session)
        self.doctor_repo = DoctorRepository(session)
        self.patient_repo = PatientRepository(session)

    async def _doctor_institution_id(self, doctor_id: int) -> int:
        result = await self.session.execute(
            text("SELECT fn_doctor_institution_id(:doctor_id)"),
            {"doctor_id": doctor_id},
        )
        institution_id = result.scalar_one_or_none()
        if institution_id is None:
            raise UnprocessableError(
                "El médico no tiene una institución activa asignada"
            )
        return int(institution_id)

    async def _ensure_patient_link(
        self, patient_id: int, institution_id: int
    ) -> None:
        result = await self.session.execute(
            select(PatientInstitution.id).where(
                PatientInstitution.patient_id == patient_id,
                PatientInstitution.institution_id == institution_id,
                PatientInstitution.unlinked_at.is_(None),
            )
        )
        if result.scalar_one_or_none() is None:
            raise ForbiddenError(
                "El paciente no está vinculado a la institución del médico"
            )

    async def _ensure_or_create_patient_link(
        self, patient_id: int, institution_id: int
    ) -> None:
        result = await self.session.execute(
            select(PatientInstitution.id).where(
                PatientInstitution.patient_id == patient_id,
                PatientInstitution.institution_id == institution_id,
                PatientInstitution.unlinked_at.is_(None),
            )
        )
        if result.scalar_one_or_none() is None:
            self.session.add(
                PatientInstitution(
                    patient_id=patient_id,
                    institution_id=institution_id,
                )
            )
            await self.session.flush()

    async def create_appointment(
        self, data: AppointmentCreate, caller: TokenPayload
    ) -> AppointmentResponse:
        patient_id = data.patient_id
        if caller.role == UserRole.patient.value:
            own_patient_id = await resolve_patient_id_for_token(
                self.session, caller
            )
            if patient_id != own_patient_id:
                raise ForbiddenError(
                    "Solo puedes agendar citas para tu propio expediente"
                )
            patient_id = own_patient_id

        patient = await self.patient_repo.get_by_id_unrestricted(patient_id)
        if not patient or patient.deleted_at:
            raise NotFoundError("Paciente no encontrado")

        doctor = await self.doctor_repo.get_by_id(data.doctor_id)
        if not doctor or doctor.deleted_at:
            raise NotFoundError("Doctor no encontrado")

        institution_id = await self._doctor_institution_id(data.doctor_id)
        if (
            data.institution_id is not None
            and data.institution_id != institution_id
        ):
            raise ForbiddenError(
                "El médico no pertenece a la institución seleccionada"
            )

        if caller.role == UserRole.patient.value:
            await self._ensure_patient_link(patient_id, institution_id)
        elif caller.role != UserRole.superadmin.value:
            await self._ensure_or_create_patient_link(
                patient_id, institution_id
            )

        taken = await self.repo.is_slot_taken(
            data.doctor_id, data.scheduled_at
        )
        if taken:
            raise ConflictError(
                "El doctor ya tiene una cita en ese horario"
            )

        appointment = await self.repo.create(
            patient_id=patient_id,
            doctor_id=data.doctor_id,
            institution_id=institution_id,
            created_by_user_id=caller.user_id,
            scheduled_at=data.scheduled_at,
            reason=data.reason,
        )
        institution = await self.session.get(Institution, institution_id)
        appointment.doctor = doctor
        appointment.institution = institution
        return AppointmentResponse.from_orm_appointment(appointment)

    async def get_appointment(
        self,
        appointment_id: int,
        caller: TokenPayload | None = None,
    ) -> AppointmentResponse:
        appointment = await self.repo.get_by_id(appointment_id)
        if not appointment or appointment.deleted_at:
            raise NotFoundError("Cita no encontrada")

        if caller is not None:
            if caller.role == UserRole.patient.value:
                own_patient_id = await resolve_patient_id_for_token(
                    self.session, caller
                )
                if appointment.patient_id != own_patient_id:
                    raise ForbiddenError(
                        "Solo puedes ver tus propias citas"
                    )
            elif caller.role == UserRole.doctor.value:
                own_doctor_id = await resolve_doctor_id_for_token(
                    self.session, caller
                )
                if appointment.doctor_id != own_doctor_id:
                    raise ForbiddenError(
                        "Solo puedes ver tus propias citas"
                    )

        return AppointmentResponse.from_orm_appointment(appointment)

    async def list_appointments(
        self,
        page: int = 1,
        limit: int = 20,
        patient_id: int | None = None,
        doctor_id: int | None = None,
        caller: TokenPayload | None = None,
    ) -> AppointmentListResponse:
        limit = min(limit, 100)
        if caller is not None:
            if caller.role == UserRole.patient.value:
                own_patient_id = await resolve_patient_id_for_token(
                    self.session, caller
                )
                if patient_id is not None and patient_id != own_patient_id:
                    raise ForbiddenError(
                        "Solo puedes ver tus propias citas"
                    )
                patient_id = own_patient_id
            elif caller.role == UserRole.doctor.value:
                own_doctor_id = await resolve_doctor_id_for_token(
                    self.session, caller
                )
                if doctor_id is not None and doctor_id != own_doctor_id:
                    raise ForbiddenError(
                        "Solo puedes ver tus propias citas"
                    )
                doctor_id = own_doctor_id

        appointments, total = await self.repo.list_active(
            page=page,
            limit=limit,
            patient_id=patient_id,
            doctor_id=doctor_id,
        )
        return AppointmentListResponse(
            total=total,
            page=page,
            limit=limit,
            items=[
                AppointmentResponse.from_orm_appointment(appointment)
                for appointment in appointments
            ],
        )

    async def update_appointment(
        self,
        appointment_id: int,
        data: AppointmentUpdate,
        caller: TokenPayload | None = None,
    ) -> AppointmentResponse:
        fields = data.model_dump(exclude_none=True)
        if not fields:
            return await self.get_appointment(
                appointment_id, caller=caller
            )

        appointment = await self.repo.get_by_id(appointment_id)
        if not appointment or appointment.deleted_at:
            raise NotFoundError("Cita no encontrada")

        if caller is not None and caller.role == UserRole.patient.value:
            own_patient_id = await resolve_patient_id_for_token(
                self.session, caller
            )
            if appointment.patient_id != own_patient_id:
                raise ForbiddenError(
                    "Solo puedes modificar tus propias citas"
                )
            if appointment.status not in (
                AppointmentStatus.scheduled,
                AppointmentStatus.confirmed,
            ):
                raise ConflictError(
                    "Esta cita ya no puede cancelarse ni reagendarse"
                )
            if "reason" in fields:
                raise ForbiddenError(
                    "El motivo de la cita no puede modificarse aquí"
                )
            requested_status = fields.get("status")
            if (
                requested_status is not None
                and requested_status != AppointmentStatus.cancelled
            ):
                raise ForbiddenError(
                    "Como paciente solo puedes cancelar la cita"
                )
        elif caller is not None and caller.role == UserRole.doctor.value:
            own_doctor_id = await resolve_doctor_id_for_token(
                self.session, caller
            )
            if appointment.doctor_id != own_doctor_id:
                raise ForbiddenError(
                    "Solo puedes modificar tus propias citas"
                )

        if "scheduled_at" in fields:
            taken = await self.repo.is_slot_taken(
                appointment.doctor_id,
                fields["scheduled_at"],
                exclude_id=appointment_id,
            )
            if taken:
                raise ConflictError(
                    "El doctor ya tiene una cita en ese horario"
                )

        updated = await self.repo.update_fields(appointment_id, fields)
        if not updated:
            raise NotFoundError("Cita no encontrada")
        return AppointmentResponse.from_orm_appointment(updated)

    async def cancel_appointment(
        self,
        appointment_id: int,
        caller: TokenPayload | None = None,
    ) -> None:
        if caller is not None:
            await self.get_appointment(appointment_id, caller=caller)
        cancelled = await self.repo.update_fields(
            appointment_id,
            {"status": AppointmentStatus.cancelled},
        )
        if not cancelled:
            raise NotFoundError("Cita no encontrada")
