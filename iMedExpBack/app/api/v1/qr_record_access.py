from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.qr_record_access import QRAccessRedeem, QRAccessResponse, QRRedeemResponse
from app.services.qr_record_access_service import QRRecordAccessService

router = APIRouter(prefix="/qr-access", tags=["qr-access"])


@router.post("/generate", response_model=QRAccessResponse, status_code=201)
async def generate_qr(
    token: TokenPayload = Depends(require_roles("patient")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await QRRecordAccessService(session).generate(user_id=token.user_id)


@router.post("/redeem", response_model=QRRedeemResponse, status_code=200)
async def redeem_qr(
    body: QRAccessRedeem,
    token: TokenPayload = Depends(require_roles("secretary", "institution_admin", "superadmin", "doctor")),
    session: AsyncSession = Depends(get_rls_session),
):
    return await QRRecordAccessService(session).redeem(
        code=body.verification_code,
        redeemer_user_id=token.user_id,
        redeemer_role=token.role,
        institution_id=body.institution_id,
    )
