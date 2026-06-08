from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.menstrual_cycle import (
    MenstrualCycleCreate,
    MenstrualCycleListResponse,
    MenstrualCyclePredictionResponse,
    MenstrualCycleResponse,
    MenstrualCycleUpdate,
)
from app.services.menstrual_cycle_service import MenstrualCycleService

router = APIRouter(prefix="/menstrual-cycles", tags=["menstrual cycles"])


@router.post("/", response_model=MenstrualCycleResponse, status_code=201)
async def create_menstrual_cycle(
    body: MenstrualCycleCreate,
    token: TokenPayload = Depends(require_roles("doctor", "institution_admin", "superadmin", "patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await MenstrualCycleService(session).create_cycle(body)


@router.get("/patient/{patient_id}", response_model=MenstrualCycleListResponse)
async def list_patient_menstrual_cycles(
    patient_id: int,
    limit: int = Query(24, ge=1, le=60),
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await MenstrualCycleService(session).list_patient_cycles(
        patient_id, limit=limit, caller=token
    )


@router.get("/patient/{patient_id}/prediction", response_model=MenstrualCyclePredictionResponse)
async def predict_patient_menstrual_cycle(
    patient_id: int,
    as_of: date | None = Query(default=None),
    token: TokenPayload = Depends(
        require_roles("doctor", "institution_admin", "superadmin", "patient")
    ),
    session: AsyncSession = Depends(get_rls_session),
):
    return await MenstrualCycleService(session).predict_next_cycle(
        patient_id, as_of=as_of, caller=token
    )


@router.patch("/{cycle_id}", response_model=MenstrualCycleResponse)
async def update_menstrual_cycle(
    cycle_id: int,
    body: MenstrualCycleUpdate,
    token: TokenPayload = Depends(require_roles("doctor", "institution_admin", "superadmin", "patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await MenstrualCycleService(session).update_cycle(cycle_id, body, caller=token)


@router.delete("/{cycle_id}", status_code=204)
async def delete_menstrual_cycle(
    cycle_id: int,
    token: TokenPayload = Depends(require_roles("doctor", "institution_admin", "superadmin", "patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await MenstrualCycleService(session).delete_cycle(cycle_id, caller=token)
