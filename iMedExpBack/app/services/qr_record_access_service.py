from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, UnprocessableError
from app.models.user import UserRole
from app.repositories.institution_repo import InstitutionRepository
from app.repositories.patient_institution_repo import PatientInstitutionRepository
from app.repositories.qr_record_access_repo import QRRecordAccessRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.qr_record_access import QRAccessResponse, QRRedeemResponse, PatientSummary
from app.schemas.auth import TokenPayload
from app.models.patient import Patient


class QRRecordAccessService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = QRRecordAccessRepository(session)
        self.patient_repo = PatientRepository(session)
        self.patient_institution_repo = PatientInstitutionRepository(session)
        self.institution_repo = InstitutionRepository(session)

    def _resolve_redeem_institution_id(
        self,
        caller: TokenPayload,
        requested_institution_id: int | None,
    ) -> int:
        if caller.role == UserRole.superadmin.value:
            if requested_institution_id is None:
                raise UnprocessableError(
                    "institution_id es obligatorio para superadmin al canjear QR"
                )
            return requested_institution_id

        caller_institution_id = caller.institution_id
        if caller_institution_id is None:
            raise UnprocessableError(
                "Tu usuario no tiene una institución asignada para canjear QR"
            )
        if (
            requested_institution_id is not None
            and requested_institution_id != caller_institution_id
        ):
            raise UnprocessableError(
                "institution_id no coincide con la institución del usuario autenticado"
            )
        return caller_institution_id

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
        caller: TokenPayload,
        institution_id: int | None,
    ) -> QRRedeemResponse:
        resolved_institution_id = self._resolve_redeem_institution_id(
            caller, institution_id
        )
        institution = await self.institution_repo.get_by_id(resolved_institution_id)
        if not institution or institution.deleted_at or not institution.is_active:
            raise NotFoundError("Institución no encontrada")

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

        await self.patient_institution_repo.ensure_linked(
            patient_id=patient.id,
            institution_id=resolved_institution_id,
        )

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
