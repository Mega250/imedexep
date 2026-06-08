from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.models.clinical_history import (
    PatientAllergy,
    PatientAntecedent,
    PatientSurgery,
    PatientVaccine,
)
from app.schemas.auth import TokenPayload
from app.schemas.clinical_history import (
    AllergyCreate,
    AllergyResponse,
    AntecedentCreate,
    AntecedentResponse,
    SurgeryCreate,
    SurgeryResponse,
    VaccineCreate,
    VaccineResponse,
)
from app.services.clinical_history_service import ClinicalHistoryService

router = APIRouter(prefix="/clinical-history", tags=["clinical-history"])


@router.get("/me/vaccines", response_model=list[VaccineResponse])
async def list_vaccines(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).list_items(PatientVaccine, token)


@router.post("/me/vaccines", response_model=VaccineResponse, status_code=201)
async def add_vaccine(
    body: VaccineCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).add_item(PatientVaccine, token, body)


@router.delete("/me/vaccines/{item_id}", status_code=204)
async def delete_vaccine(
    item_id: int,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ClinicalHistoryService(session).remove_item(PatientVaccine, token, item_id)


@router.get("/me/surgeries", response_model=list[SurgeryResponse])
async def list_surgeries(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).list_items(PatientSurgery, token)


@router.post("/me/surgeries", response_model=SurgeryResponse, status_code=201)
async def add_surgery(
    body: SurgeryCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).add_item(PatientSurgery, token, body)


@router.delete("/me/surgeries/{item_id}", status_code=204)
async def delete_surgery(
    item_id: int,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ClinicalHistoryService(session).remove_item(PatientSurgery, token, item_id)


@router.get("/me/allergies", response_model=list[AllergyResponse])
async def list_allergies(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).list_items(PatientAllergy, token)


@router.post("/me/allergies", response_model=AllergyResponse, status_code=201)
async def add_allergy(
    body: AllergyCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).add_item(PatientAllergy, token, body)


@router.delete("/me/allergies/{item_id}", status_code=204)
async def delete_allergy(
    item_id: int,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ClinicalHistoryService(session).remove_item(PatientAllergy, token, item_id)


@router.get("/me/antecedents", response_model=list[AntecedentResponse])
async def list_antecedents(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).list_items(PatientAntecedent, token)


@router.post("/me/antecedents", response_model=AntecedentResponse, status_code=201)
async def add_antecedent(
    body: AntecedentCreate,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await ClinicalHistoryService(session).add_item(PatientAntecedent, token, body)


@router.delete("/me/antecedents/{item_id}", status_code=204)
async def delete_antecedent(
    item_id: int,
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    await ClinicalHistoryService(session).remove_item(PatientAntecedent, token, item_id)
