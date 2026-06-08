from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
    PrescriptionSign,
    TreatmentDetailCreate,
    TreatmentDetailResponse,
)
from app.services.prescription_service import PrescriptionService

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

@router.post("/consultation/{consultation_id}", response_model=PrescriptionResponse, status_code=201)
async def create_prescription(
    consultation_id: int,
    body: PrescriptionCreate,
    token: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
) -> PrescriptionResponse:
    return await PrescriptionService(session).create_prescription(
        consultation_id=consultation_id, 
        data=body, 
        doctor_user_id=token.user_id
    )

@router.get("/consultation/{consultation_id}", response_model=PrescriptionResponse)
async def get_prescription_by_consultation(
    consultation_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
) -> PrescriptionResponse:
    return await PrescriptionService(session).get_by_consultation(consultation_id, caller=token)

@router.get("/{prescription_id:int}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
) -> PrescriptionResponse:
    return await PrescriptionService(session).get_prescription(prescription_id, caller=token)

@router.post("/{prescription_id:int}/treatments", response_model=TreatmentDetailResponse, status_code=201)
async def add_treatment_to_prescription(
    prescription_id: int,
    body: TreatmentDetailCreate,
    token: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
) -> TreatmentDetailResponse:
    return await PrescriptionService(session).add_treatment(prescription_id, body)

@router.get("/{prescription_id:int}/treatments", response_model=list[TreatmentDetailResponse])
async def list_prescription_treatments(
    prescription_id: int,
    token: TokenPayload = Depends(
        require_roles("doctor", "patient", "institution_admin", "superadmin")
    ),
    session: AsyncSession = Depends(get_rls_session),
) -> list[TreatmentDetailResponse]:
    await PrescriptionService(session).get_prescription(prescription_id, caller=token)
    return await PrescriptionService(session).list_treatments(prescription_id)

@router.patch("/{prescription_id:int}/sign", response_model=PrescriptionResponse)
async def sign_prescription(
    prescription_id: int,
    body: PrescriptionSign,
    token: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
) -> PrescriptionResponse:
    return await PrescriptionService(session).sign_prescription(prescription_id, body.signature_hash)


@router.post("/{prescription_id:int}/send", summary="Enviar receta por correo al paciente")
async def send_prescription(
    prescription_id: int,
    token: TokenPayload = Depends(require_roles("doctor", "institution_admin", "superadmin")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await PrescriptionService(session).send_to_patient(prescription_id, caller=token)
