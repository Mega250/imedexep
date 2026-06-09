from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.clinical_extras import (
    CertificateCreate,
    CertificateResponse,
    NotificationCreate,
    NotificationResponse,
)
from app.services.clinical_extras_service import ClinicalExtrasService
from app.utils.pdf import certificate_pdf

router = APIRouter(tags=["clinical-extras"])


@router.post("/notifications/me", response_model=NotificationResponse, status_code=201)
async def create_notification(
    body: NotificationCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalExtrasService(session).create_notification(token, body)


@router.get("/notifications/me", response_model=list[NotificationResponse])
async def list_my_notifications(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalExtrasService(session).list_my_notifications(token)


@router.get("/notifications/patient/{patient_id}", response_model=list[NotificationResponse])
async def list_patient_notifications(
    patient_id: int,
    token: TokenPayload = Depends(require_roles("doctor", "secretary", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalExtrasService(session).list_patient_notifications(patient_id)


@router.post("/certificates", response_model=CertificateResponse, status_code=201)
async def issue_certificate(
    body: CertificateCreate,
    token: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalExtrasService(session).create_certificate(token, body)


@router.get("/certificates/me", response_model=list[CertificateResponse])
async def list_my_certificates(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalExtrasService(session).list_my_certificates(token)


@router.get("/certificates/{cert_id}/pdf")
async def certificate_as_pdf(
    cert_id: int,
    token: TokenPayload = Depends(require_roles("patient", "doctor", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    cert = await ClinicalExtrasService(session).get_certificate(cert_id)
    pdf_bytes = certificate_pdf(
        title=cert.title,
        body=cert.body,
        folio=cert.id,
        issued_at=cert.issued_at.strftime("%Y-%m-%d %H:%M"),
        doctor_label=f"#{cert.doctor_id}",
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="certificado-{cert.id}.pdf"'},
    )
