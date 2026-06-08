from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.qr_record_access_repo import QRRecordAccessRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.qr_record_access import QRAccessResponse, QRRedeemResponse, PatientSummary
from app.models.patient import Patient


class QRRecordAccessService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = QRRecordAccessRepository(session)
        self.patient_repo = PatientRepository(session)

    async def generate(self, user_id: int) -> QRAccessResponse:
        result = await self.session.execute(
            select(Patient).where(
                Patient.user_id == user_id,
                Patient.deleted_at.is_(None),
            )
        )
        patient = result.scalar_one_or_none()
        if not patient:
            raise NotFoundError("No tienes un perfil de paciente")

        await self.session.execute(
            text("SELECT fn_qr_revoke_active_for_patient(:pid)"),
            {"pid": patient.id},
        )

        qr = await self.repo.create(
            patient_id=patient.id,
            created_by_user_id=user_id,
        )
        return QRAccessResponse.model_validate(qr)

    async def redeem(
        self,
        code: str,
        redeemer_user_id: int,
        redeemer_role: str,
        institution_id: int | None,
    ) -> QRRedeemResponse:
        redeem_result = await self.session.execute(
            text("SELECT fn_qr_redeem(:code)"), {"code": code}
        )
        patient_id = redeem_result.scalar_one_or_none()
        if patient_id is None:
            raise NotFoundError("Código inválido o expirado")

        result = await self.session.execute(
            select(Patient).from_statement(
                text("SELECT * FROM fn_get_patient_by_id(:pid)")
            ),
            {"pid": patient_id},
        )
        patient = result.scalar_one_or_none()
        if patient is None:
            raise NotFoundError("Paciente no encontrado")

        return QRRedeemResponse(
            message="Código canjeado exitosamente",
            patient=PatientSummary(
                id=patient.id,
                first_name=patient.first_name,
                last_name=patient.last_name,
                date_of_birth=patient.date_of_birth,
                gender=patient.gender.value if patient.gender else None,
                blood_type=patient.blood_type.value if patient.blood_type else None,
                city=patient.city,
                state=patient.state,
            ),
        )
