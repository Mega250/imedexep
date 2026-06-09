from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationListResponse,
    ConsultationResponse,
)
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisResponse
from app.services.consultation_service import ConsultationService
from app.services.diagnosis_service import DiagnosisService

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.post("/", response_model=ConsultationResponse, status_code=201)
async def start_consultation(
    body: ConsultationCreate,
    token: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
) -> ConsultationResponse:
    service = ConsultationService(session)
    return await service.start_consultation(body, doctor_user_id=token.user_id)


@router.get("/", response_model=ConsultationListResponse)
async def list_consultations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    patient_id: int | None = Query(None),
    doctor_id: int | None = Query(None),
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_rls_session),
) -> ConsultationListResponse:
    service = ConsultationService(session)
    return await service.list_consultations(
        page=page, limit=limit, patient_id=patient_id, doctor_id=doctor_id, caller=token
    )


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_rls_session),
) -> ConsultationResponse:
    return await ConsultationService(session).get_consultation(consultation_id, caller=token)


@router.post("/{consultation_id}/diagnosis", response_model=DiagnosisResponse, status_code=201)
async def add_diagnosis(
    consultation_id: int,
    body: DiagnosisCreate,
    token: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
) -> DiagnosisResponse:
    service = DiagnosisService(session)
    return await service.add_diagnosis(
        consultation_id=consultation_id,
        data=body,
        doctor_user_id=token.user_id,
    )


@router.get("/{consultation_id}/diagnosis", response_model=list[DiagnosisResponse])
async def list_diagnoses(
    consultation_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin", "secretary")
    ),
    session: AsyncSession = Depends(get_rls_session),
) -> list[DiagnosisResponse]:
    await ConsultationService(session).get_consultation(consultation_id, caller=token)
    service = DiagnosisService(session)
    return await service.list_diagnoses(consultation_id)
