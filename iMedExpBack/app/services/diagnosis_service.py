from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ForbiddenError
from app.repositories.diagnosis_repo import DiagnosisRepository
from app.repositories.consultation_repo import ConsultationRepository
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisResponse


class DiagnosisService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = DiagnosisRepository(session)
        self.consultation_repo = ConsultationRepository(session)

    async def add_diagnosis(
        self,
        consultation_id: int,
        data: DiagnosisCreate,
        doctor_user_id: int,
    ) -> DiagnosisResponse:
        consultation = await self.consultation_repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundError("Consulta no encontrada")

        diagnosis = await self.repo.create(
            consultation_id=consultation_id,
            disease_id=data.disease_id,
            diagnosis_type=data.diagnosis_type,
            additional_notes=data.additional_notes,
        )

        return DiagnosisResponse.model_validate(diagnosis)

    async def list_diagnoses(self, consultation_id: int) -> list[DiagnosisResponse]:
        diagnoses = await self.repo.list_by_consultation(consultation_id)
        return [DiagnosisResponse.model_validate(d) for d in diagnoses]
