from datetime import UTC, datetime

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ConflictError, NotFoundError
from app.models.patient_institution import PatientInstitution
from app.repositories.patient_institution_repo import PatientInstitutionRepository
from app.repositories.patient_repo import PatientRepository
from app.repositories.institution_repo import InstitutionRepository
from app.schemas.auth import TokenPayload
from app.schemas.patient_institution import PatientInstitutionCreate, PatientInstitutionResponse
from app.utils.ownership import (
    ensure_institution_jurisdiction,
    ensure_patient_ownership,
    resolve_patient_id_for_token,
)


class PatientInstitutionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = PatientInstitutionRepository(session)
        self.patient_repo = PatientRepository(session)
        self.institution_repo = InstitutionRepository(session)

    async def link(
        self,
        data: PatientInstitutionCreate,
        caller: TokenPayload | None = None,
    ) -> PatientInstitutionResponse:
        if caller is not None:
            ensure_institution_jurisdiction(caller, data.institution_id)

        patient = await self.patient_repo.get_by_id(data.patient_id)
        if not patient or patient.deleted_at:
            raise NotFoundError("Paciente no encontrado")

        institution = await self.institution_repo.get_by_id(data.institution_id)
        if not institution or institution.deleted_at:
            raise NotFoundError("Institución no encontrada")

        existing = await self.repo.get_by_patient_and_institution(
            data.patient_id, data.institution_id
        )
        if existing:
            raise ConflictError("El paciente ya está vinculado a esta institución")

        pi = await self.repo.create(
            patient_id=data.patient_id,
            institution_id=data.institution_id,
            record_number=data.record_number,
        )
        return PatientInstitutionResponse.model_validate(pi)

    async def list_by_patient(
        self,
        patient_id: int,
        caller: TokenPayload | None = None,
    ) -> list[PatientInstitutionResponse]:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        items = await self.repo.list_by_patient(patient_id)
        return [PatientInstitutionResponse.model_validate(i) for i in items]

    async def unlink(
        self,
        patient_id: int,
        institution_id: int,
        caller: TokenPayload | None = None,
    ) -> None:
        if caller is not None:
            ensure_institution_jurisdiction(caller, institution_id)
        unlinked = await self.repo.unlink(patient_id, institution_id)
        if not unlinked:
            raise NotFoundError("Vínculo no encontrado")

    async def set_self_access(
        self,
        token: TokenPayload,
        institution_id: int,
        active: bool,
    ) -> None:
        patient_id = await resolve_patient_id_for_token(self.session, token)
        value = None if active else datetime.now(UTC)
        result = await self.session.execute(
            update(PatientInstitution)
            .where(
                PatientInstitution.patient_id == patient_id,
                PatientInstitution.institution_id == institution_id,
            )
            .values(unlinked_at=value)
        )
        if result.rowcount == 0:
            raise NotFoundError("Vínculo no encontrado")
        await self.session.flush()