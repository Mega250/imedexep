from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, UnprocessableError
from app.repositories.patient_repo import PatientRepository
from app.schemas.auth import TokenPayload
from app.schemas.patient import (
    PatientCreate,
    PatientFullResponse,
    PatientListResponse,
    PatientResponse,
    PatientUpdate,
)
from app.utils.ownership import ensure_patient_ownership


class PatientService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = PatientRepository(session)

    async def create_patient(self, data: PatientCreate) -> PatientResponse:
        existing = await self.repo.get_by_curp_hash(data.curp)
        if existing:
            raise ConflictError("Ya existe un paciente con esa CURP")

        patient = await self.repo.create(
            curp=data.curp,
            first_name=data.first_name,
            last_name=data.last_name,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            blood_type=data.blood_type,
            phone=data.phone,
            street_address=data.street_address,
            neighborhood=data.neighborhood,
            postal_code=data.postal_code,
            city=data.city,
            state=data.state,
            sensitivity_level=data.sensitivity_level,
        )
        return PatientResponse.from_orm_patient(patient)

    async def get_patient(
        self,
        patient_id: int,
        caller: TokenPayload | None = None,
    ) -> PatientResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        patient = await self.repo.get_by_id(patient_id)
        if not patient or patient.deleted_at is not None:
            raise NotFoundError("Paciente no encontrado")
        return PatientResponse.from_orm_patient(patient)

    async def get_patient_by_curp(
        self,
        curp: str,
    ) -> PatientResponse:
        from app.schemas.patient import CURP_REGEX

        normalized = curp.strip().upper()
        if not CURP_REGEX.match(normalized):
            raise UnprocessableError("CURP invalida")

        patient = await self.repo.get_by_curp_hash(normalized)
        if not patient or patient.deleted_at is not None:
            raise NotFoundError("Paciente no encontrado")
        return PatientResponse.from_orm_patient(patient)

    async def get_full_profile(
        self,
        patient_id: int,
        caller: TokenPayload | None = None,
    ) -> PatientFullResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        row = await self.repo.get_full_profile(patient_id)
        if not row:
            raise NotFoundError("Paciente no encontrado o sin acceso")
        patient = await self.repo.get_by_id(patient_id)
        if patient and patient.phone_encrypted:
            from app.utils.encryption import get_encryptor
            row["phone"] = get_encryptor().decrypt(patient.phone_encrypted)
        return PatientFullResponse(**row)

    async def list_patients(
        self, page: int = 1, limit: int = 20
    ) -> PatientListResponse:
        limit = min(limit, 100)
        patients, total = await self.repo.list_active(page=page, limit=limit)
        return PatientListResponse(
            total=total,
            page=page,
            limit=limit,
            items=[PatientResponse.from_orm_patient(p) for p in patients],
        )

    async def update_patient(
        self,
        patient_id: int,
        data: PatientUpdate,
        caller: TokenPayload | None = None,
    ) -> PatientResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        fields = data.model_dump(exclude_none=True)
        phone_provided = "phone" in data.model_fields_set
        fields.pop("phone", None)

        if phone_provided:
            from app.utils.encryption import get_encryptor
            enc = get_encryptor()
            phone_plain = data.phone
            fields["phone_encrypted"] = enc.encrypt(phone_plain) if phone_plain else None

        if not fields:
            return await self.get_patient(patient_id, caller=caller)

        patient = await self.repo.update_fields(patient_id, fields)
        if not patient:
            raise NotFoundError("Paciente no encontrado")
        return PatientResponse.from_orm_patient(patient)

    async def delete_patient(self, patient_id: int) -> None:
        deleted = await self.repo.soft_delete(patient_id)
        if not deleted:
            raise NotFoundError("Paciente no encontrado")
