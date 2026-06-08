from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.vital_sign_repo import VitalSignRepository
from app.schemas.auth import TokenPayload
from app.schemas.vital_sign import VitalSignCreate, VitalSignResponse
from app.utils.ownership import ensure_patient_ownership, resolve_patient_id_for_token

class VitalSignService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = VitalSignRepository(session)

    async def add_vitals(self, data: VitalSignCreate, caller: TokenPayload | None = None) -> VitalSignResponse:
        if caller is not None:
            role = getattr(caller, "role", None)
            role = getattr(role, "value", role)
            if role == "patient":
                data.patient_id = await resolve_patient_id_for_token(self.session, caller)
        vital = await self.repo.create(**data.model_dump())
        return VitalSignResponse.from_orm_vital(vital)

    async def get_patient_vitals(
        self,
        patient_id: int,
        limit: int = 50,
        caller: TokenPayload | None = None,
    ) -> list[VitalSignResponse]:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        vitals = await self.repo.get_by_patient(patient_id, limit)
        return [VitalSignResponse.from_orm_vital(v) for v in vitals]

    async def get_latest_vitals(
        self,
        patient_id: int,
        caller: TokenPayload | None = None,
    ) -> VitalSignResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        vital = await self.repo.get_latest_by_patient(patient_id)
        if not vital:
            raise NotFoundError("El paciente aún no tiene signos vitales registrados")
        return VitalSignResponse.from_orm_vital(vital)
