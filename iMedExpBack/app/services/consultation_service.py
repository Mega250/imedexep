from sqlalchemy import select, text

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.patient_institution import PatientInstitution
from app.models.patient import Patient
from app.models.user import UserRole
from app.repositories.consultation_repo import ConsultationRepository
from app.repositories.doctor_repo import DoctorRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.auth import TokenPayload
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationListResponse,
    ConsultationResponse,
)
from app.utils.ownership import (
    ensure_patient_ownership,
    resolve_doctor_id_for_token,
    resolve_patient_id_for_token,
)


class ConsultationService:
    def __init__(self, session) -> None:
        self.session = session
        self.repo = ConsultationRepository(session)
        self.doctor_repo = DoctorRepository(session)
        self.patient_repo = PatientRepository(session)

    async def start_consultation(
        self,
        data: ConsultationCreate,
        doctor_user_id: int,
    ) -> ConsultationResponse:
        doctor = await self.doctor_repo.get_by_id_from_user(doctor_user_id)
        if not doctor or doctor.deleted_at:
            raise NotFoundError("Doctor no encontrado")

        result = await self.session.execute(
            text("SELECT fn_doctor_institution_id(:doctor_id)"),
            {"doctor_id": doctor.id},
        )
        institution_id = result.scalar_one_or_none()

        if institution_id is None:
            raise ForbiddenError("El doctor no tiene instituciones asignadas")

        stmt_patient = select(Patient).where(Patient.id == data.patient_id, Patient.deleted_at.is_(None))
        result_patient = await self.session.execute(stmt_patient)
        patient = result_patient.scalar_one_or_none()

        if not patient:
            raise NotFoundError("Paciente no encontrado")

        link_result = await self.session.execute(
            select(PatientInstitution.id).where(
                PatientInstitution.patient_id == patient.id,
                PatientInstitution.institution_id == institution_id,
                PatientInstitution.unlinked_at.is_(None),
            )
        )
        if link_result.scalar_one_or_none() is None:
            raise ForbiddenError(
                "El paciente no está vinculado a la institución del doctor"
            )

        consultation = await self.repo.create(
            institution_id=institution_id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            chief_complaint=data.chief_complaint,
            symptoms=data.symptoms,
            medical_notes=data.medical_notes,
            sensitivity_level=data.sensitivity_level,
            specialty_data=data.specialty_data,
        )

        return ConsultationResponse.model_validate(consultation)

    async def get_consultation(
        self,
        consultation_id: int,
        caller: TokenPayload | None = None,
    ) -> ConsultationResponse:
        consultation = await self.repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundError("Consulta no encontrada")
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, consultation.patient_id)
            if caller.role == UserRole.doctor.value:
                doctor_id = await resolve_doctor_id_for_token(self.session, caller)
                if consultation.doctor_id != doctor_id:
                    raise ForbiddenError("Solo puedes consultar tus propias consultas")
        return ConsultationResponse.model_validate(consultation)

    async def list_consultations(
        self,
        page: int = 1,
        limit: int = 20,
        patient_id: int | None = None,
        doctor_id: int | None = None,
        caller: TokenPayload | None = None,
    ) -> ConsultationListResponse:
        limit = min(limit, 100)
        if caller is not None:
            if caller.role == UserRole.patient.value:
                own_id = await resolve_patient_id_for_token(self.session, caller)
                if patient_id is not None and patient_id != own_id:
                    raise ForbiddenError("Solo puedes ver tus propias consultas")
                patient_id = own_id
            elif caller.role == UserRole.doctor.value:
                own_doc = await resolve_doctor_id_for_token(self.session, caller)
                if doctor_id is not None and doctor_id != own_doc:
                    raise ForbiddenError("Solo puedes ver tus propias consultas")
                doctor_id = own_doc
        consultations, total = await self.repo.list_active(
            page=page, limit=limit, patient_id=patient_id, doctor_id=doctor_id
        )
        return ConsultationListResponse(
            total=total,
            page=page,
            limit=limit,
            items=[ConsultationResponse.model_validate(c) for c in consultations],
        )
