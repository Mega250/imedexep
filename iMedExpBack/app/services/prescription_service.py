from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ConflictError, ForbiddenError
from app.models.user import UserRole
from app.repositories.prescription_repo import PrescriptionRepository
from app.repositories.treatment_detail_repo import TreatmentDetailRepository
from app.repositories.consultation_repo import ConsultationRepository
from app.repositories.doctor_repo import DoctorRepository
from app.services.medication_service import MedicationService
from app.schemas.auth import TokenPayload
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
    TreatmentDetailCreate,
    TreatmentDetailResponse,
)
from app.utils.ownership import (
    ensure_patient_ownership,
    resolve_doctor_id_for_token,
)


class PrescriptionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = PrescriptionRepository(session)
        self.treatment_repo = TreatmentDetailRepository(session)
        self.consultation_repo = ConsultationRepository(session)
        self.doctor_repo = DoctorRepository(session)
        self.medication_service = MedicationService(session)

    async def create_prescription(
        self,
        consultation_id: int,
        data: PrescriptionCreate,
        doctor_user_id: int,
    ) -> PrescriptionResponse:
        consultation = await self.consultation_repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundError("Consulta no encontrada")

        doctor = await self.doctor_repo.get_by_id_from_user(doctor_user_id)
        if not doctor:
            raise NotFoundError("Doctor no encontrado")

        prescription = await self.repo.create(
            consultation_id=consultation_id,
            patient_id=consultation.patient_id,
            doctor_id=doctor.id,
            general_instructions=data.general_instructions,
        )

        full = await self.repo.get_by_id_full(prescription.id)
        return PrescriptionResponse.model_validate(full)

    async def add_treatment(
        self,
        prescription_id: int,
        data: TreatmentDetailCreate,
    ) -> TreatmentDetailResponse:
        prescription = await self.repo.get_by_id(prescription_id)
        if not prescription:
            raise NotFoundError("Prescripción no encontrada")

        if not data.medication_id and not data.free_text_medication:
            raise ConflictError(
                "Debe proporcionar medication_id o free_text_medication"
            )

        medication_id = data.medication_id
        if medication_id is None and data.free_text_medication:
            catalog_item = await self.medication_service.ensure_catalog_entry_from_free_text(
                data.free_text_medication
            )
            medication_id = catalog_item.id if catalog_item else None

        treatment = await self.treatment_repo.create(
            prescription_id=prescription_id,
            medication_id=medication_id,
            free_text_medication=data.free_text_medication,
            dosage=data.dosage,
            frequency=data.frequency,
            duration_days=data.duration_days,
            start_date=data.start_date,
            additional_notes=data.additional_notes,
        )

        return TreatmentDetailResponse.model_validate(treatment)

    async def list_treatments(self, prescription_id: int) -> list[TreatmentDetailResponse]:
        treatments = await self.treatment_repo.list_by_prescription(prescription_id)
        return [TreatmentDetailResponse.model_validate(t) for t in treatments]

    async def _enforce_caller(
        self,
        prescription,
        caller: TokenPayload | None,
    ) -> None:
        if caller is None:
            return
        await ensure_patient_ownership(self.session, caller, prescription.patient_id)
        if caller.role == UserRole.doctor.value:
            doctor_id = await resolve_doctor_id_for_token(self.session, caller)
            if prescription.doctor_id != doctor_id:
                raise ForbiddenError("Solo puedes ver tus propias prescripciones")

    async def get_prescription(
        self,
        prescription_id: int,
        caller: TokenPayload | None = None,
    ) -> PrescriptionResponse:
        prescription = await self.repo.get_by_id_full(prescription_id)
        if not prescription:
            raise NotFoundError("Prescripción no encontrada")
        await self._enforce_caller(prescription, caller)
        return PrescriptionResponse.model_validate(prescription)

    async def get_by_consultation(
        self,
        consultation_id: int,
        caller: TokenPayload | None = None,
    ) -> PrescriptionResponse:
        prescription = await self.repo.get_by_consultation(consultation_id)
        if not prescription:
            raise NotFoundError("Prescripción no encontrada para esta consulta")
        await self._enforce_caller(prescription, caller)
        return PrescriptionResponse.model_validate(prescription)

    async def send_to_patient(
        self,
        prescription_id: int,
        caller: TokenPayload | None = None,
    ) -> dict:
        from datetime import UTC, datetime
        from app.utils.email import send_prescription_to_patient

        prescription = await self.repo.get_by_id_full(prescription_id)
        if not prescription:
            raise NotFoundError("Prescripción no encontrada")
        await self._enforce_caller(prescription, caller)

        result = await self.session.execute(
            text("SELECT fn_patient_notification_email(:patient_id)"),
            {"patient_id": prescription.patient_id},
        )
        patient_email = result.scalar_one_or_none()
        if not patient_email:
            raise NotFoundError("El paciente no tiene correo registrado")

        await send_prescription_to_patient(
            patient_email=patient_email,
            prescription_id=prescription.id,
        )
        return {
            "message": "Receta enviada al paciente",
            "delivered_at": datetime.now(UTC),
            "channel": "email",
        }

    async def sign_prescription(
        self, prescription_id: int, signature_hash: str
    ) -> PrescriptionResponse:
        prescription = await self.repo.sign(prescription_id, signature_hash)
        if not prescription:
            raise NotFoundError("Prescripción no encontrada")
        full = await self.repo.get_by_id_full(prescription.id)
        return PrescriptionResponse.model_validate(full)
