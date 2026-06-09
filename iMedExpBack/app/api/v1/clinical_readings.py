from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.models.clinical_readings import PatientGlucose, PatientWeight
from app.schemas.auth import TokenPayload
from app.schemas.clinical_readings import (
    GlucoseCreate,
    GlucoseResponse,
    WeightCreate,
    WeightResponse,
)
from app.services.clinical_history_service import ClinicalHistoryService

router = APIRouter(prefix="/clinical-readings", tags=["clinical-readings"])


@router.get("/me/glucose", response_model=list[GlucoseResponse])
async def list_glucose(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).list_items(PatientGlucose, token)


@router.post("/me/glucose", response_model=GlucoseResponse, status_code=201)
async def add_glucose(
    body: GlucoseCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).add_item(PatientGlucose, token, body)


@router.delete("/me/glucose/{item_id}", status_code=204)
async def delete_glucose(
    item_id: int,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ClinicalHistoryService(session).remove_item(PatientGlucose, token, item_id)


@router.get("/me/weight", response_model=list[WeightResponse])
async def list_weight(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).list_items(PatientWeight, token)


@router.post("/me/weight", response_model=WeightResponse, status_code=201)
async def add_weight(
    body: WeightCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).add_item(PatientWeight, token, body)


@router.delete("/me/weight/{item_id}", status_code=204)
async def delete_weight(
    item_id: int,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ClinicalHistoryService(session).remove_item(PatientWeight, token, item_id)
