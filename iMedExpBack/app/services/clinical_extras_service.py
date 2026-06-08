from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.clinical_extras import MedicalCertificate, PatientNotification
from app.models.doctor import Doctor
from app.schemas.auth import TokenPayload
from app.utils.ownership import resolve_patient_id_for_token


class ClinicalExtrasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _user_id(self, token: TokenPayload) -> int:
        raw = getattr(token, "user_id", None) or getattr(token, "sub", None)
        return int(raw)

    async def _doctor_id(self, token: TokenPayload) -> int:
        result = await self.session.execute(
            select(Doctor).where(Doctor.user_id == self._user_id(token), Doctor.deleted_at.is_(None))
        )
        doctor = result.scalar_one_or_none()
        if not doctor:
            raise NotFoundError("Perfil de medico no encontrado")
        return doctor.id

    async def create_notification(self, token: TokenPayload, data):
        patient_id = await resolve_patient_id_for_token(self.session, token)
        obj = PatientNotification(
            patient_id=patient_id,
            institution_id=getattr(token, "institution_id", None),
            kind=data.kind,
            message=data.message,
        )
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def list_my_notifications(self, token: TokenPayload):
        patient_id = await resolve_patient_id_for_token(self.session, token)
        result = await self.session.execute(
            select(PatientNotification)
            .where(PatientNotification.patient_id == patient_id, PatientNotification.deleted_at.is_(None))
            .order_by(PatientNotification.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_patient_notifications(self, patient_id: int):
        result = await self.session.execute(
            select(PatientNotification)
            .where(PatientNotification.patient_id == patient_id, PatientNotification.deleted_at.is_(None))
            .order_by(PatientNotification.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_certificate(self, token: TokenPayload, data):
        doctor_id = await self._doctor_id(token)
        obj = MedicalCertificate(
            patient_id=data.patient_id,
            doctor_id=doctor_id,
            institution_id=getattr(token, "institution_id", None),
            title=data.title,
            body=data.body,
        )
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def list_my_certificates(self, token: TokenPayload):
        patient_id = await resolve_patient_id_for_token(self.session, token)
        result = await self.session.execute(
            select(MedicalCertificate)
            .where(MedicalCertificate.patient_id == patient_id, MedicalCertificate.deleted_at.is_(None))
            .order_by(MedicalCertificate.issued_at.desc())
        )
        return list(result.scalars().all())

    async def get_certificate(self, cert_id: int) -> MedicalCertificate:
        result = await self.session.execute(
            select(MedicalCertificate).where(
                MedicalCertificate.id == cert_id, MedicalCertificate.deleted_at.is_(None)
            )
        )
        cert = result.scalar_one_or_none()
        if not cert:
            raise NotFoundError("Certificado no encontrado")
        return cert
