from sqlalchemy import bindparam, delete, func, select, text, update
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clinical_history import PatientAntecedent
from app.models.patient import Patient
from app.repositories.base import BaseRepository
from app.utils.encryption import get_encryptor

_SOC_FIELDS = {
    "soc.drainage": "drainage",
    "soc.water": "water",
    "soc.electricity": "electricity",
    "soc.household": "household_members",
    "soc.cooking_material": "cooking_material",
    "soc.cooking_method": "cooking_method",
}


class PatientRepository(BaseRepository[Patient]):
    model = Patient

    async def create(
        self,
        *,
        curp: str,
        first_name: str,
        last_name: str,
        date_of_birth: object,
        gender: str | None = None,
        blood_type: str | None = None,
        phone: str | None = None,
        street_address: str | None = None,
        neighborhood: str | None = None,
        postal_code: str | None = None,
        city: str | None = None,
        state: str | None = None,
        sensitivity_level: int = 1,
        user_id: int | None = None,
    ) -> Patient:
        enc = get_encryptor()

        patient = Patient(
            user_id=user_id,
            curp_encrypted=enc.encrypt(curp),
            curp_hash=enc.hash_curp(curp),
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            gender=gender,
            blood_type=blood_type,
            phone_encrypted=enc.encrypt(phone) if phone else None,
            street_address=street_address,
            neighborhood=neighborhood,
            postal_code=postal_code,
            city=city,
            state=state,
            privacy_attributes={"sensitivity_level": sensitivity_level},
        )
        self.session.add(patient)
        await self.session.flush()
        await self.session.refresh(patient)
        return patient

    async def get_by_user_id(self, user_id: int) -> Patient | None:
        result = await self.session.execute(
            select(Patient).where(
                Patient.user_id == user_id,
                Patient.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_curp_hash(self, curp: str) -> Patient | None:
        enc = get_encryptor()
        curp_hash = enc.hash_curp(curp)
        result = await self.session.execute(
            select(Patient).from_statement(
                text("SELECT * FROM fn_get_patient_by_curp_hash(:p_hash)")
            ),
            {"p_hash": curp_hash},
        )
        return result.scalar_one_or_none()

    async def list_active(
        self,
        *,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Patient], int]:
        offset = (page - 1) * limit

        count_result = await self.session.execute(
            select(func.count()).select_from(Patient)
            .where(Patient.deleted_at.is_(None))
        )
        total: int = count_result.scalar_one()

        result = await self.session.execute(
            select(Patient)
            .where(Patient.deleted_at.is_(None))
            .order_by(Patient.last_name, Patient.first_name)
            .offset(offset)
            .limit(limit)
        )
        patients = list(result.scalars().all())
        return patients, total

    async def update_fields(
        self,
        patient_id: int,
        fields: dict,
    ) -> Patient | None:
        affected = 0
        if "sensitivity_level" in fields:
            sensitivity = fields.pop("sensitivity_level")
            result = await self.session.execute(
                text(
                    "UPDATE patient "
                    "SET privacy_attributes = COALESCE(privacy_attributes, '{}'::jsonb) || :patch "
                    "WHERE id = :id AND deleted_at IS NULL"
                ).bindparams(bindparam("patch", type_=JSONB)),
                {
                    "patch": {"sensitivity_level": sensitivity},
                    "id": patient_id,
                },
            )
            affected += result.rowcount or 0

        if fields:
            stmt = (
                update(Patient)
                .where(Patient.id == patient_id, Patient.deleted_at.is_(None))
                .values(**fields)
            )
            result = await self.session.execute(stmt)
            affected += result.rowcount or 0

        if affected == 0:
            return None

        await self.session.flush()
        return await self.get_by_id(patient_id)

    async def get_socioeconomic(self, patient_id: int) -> dict:
        result = await self.session.execute(
            select(PatientAntecedent.kind, PatientAntecedent.description)
            .where(
                PatientAntecedent.patient_id == patient_id,
                PatientAntecedent.kind.in_(_SOC_FIELDS.keys()),
                PatientAntecedent.deleted_at.is_(None),
            )
        )
        rows = result.all()
        data: dict = {field: None for field in _SOC_FIELDS.values()}
        for kind, description in rows:
            field = _SOC_FIELDS.get(kind)
            if field:
                data[field] = description
        return data

    async def upsert_socioeconomic(self, patient_id: int, values: dict) -> None:
        await self.session.execute(
            delete(PatientAntecedent).where(
                PatientAntecedent.patient_id == patient_id,
                PatientAntecedent.kind.in_(_SOC_FIELDS.keys()),
            )
        )
        kind_by_field = {v: k for k, v in _SOC_FIELDS.items()}
        for field, value in values.items():
            if value is None:
                continue
            trimmed = str(value).strip()
            if not trimmed:
                continue
            kind = kind_by_field.get(field)
            if kind is None:
                continue
            self.session.add(
                PatientAntecedent(
                    patient_id=patient_id,
                    kind=kind,
                    description=trimmed,
                )
            )
        await self.session.flush()

    async def get_full_profile(self, patient_id: int) -> dict | None:
        result = await self.session.execute(
            text(
                """
                SELECT *
                FROM public.v_doctor_patient
                WHERE id = :patient_id
                """
            ),
            {"patient_id": patient_id},
        )
        row = result.mappings().one_or_none()
        return dict(row) if row else None
