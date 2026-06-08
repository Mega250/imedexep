from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_rls_session, require_roles
from app.schemas.auth import TokenPayload
from app.schemas.invitation import (
    InvitationActionRequest,
    InvitationActionResponse,
    InvitationCreateRequest,
    InvitationListItem,
    InvitationResponse,
    InvitationSentListItem,
)
from app.services.invitation_service import InvitationService

router = APIRouter(prefix="/invitations", tags=["Invitations"])


@router.get("/", response_model=list[InvitationListItem])
async def list_my_invitations(
    current_user: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session),
):
    service = InvitationService(session)
    return await service.list_for_doctor(current_user)


@router.get("/sent", response_model=list[InvitationSentListItem])
async def list_sent_invitations(
    current_user: TokenPayload = Depends(require_roles("institution_admin")),
    session: AsyncSession = Depends(get_rls_session),
):
    service = InvitationService(session)
    return await service.list_for_institution(current_user)


@router.post("/", response_model=InvitationResponse)
async def create_invitation(
    data: InvitationCreateRequest,
    current_user: TokenPayload = Depends(require_roles("institution_admin")),
    session: AsyncSession = Depends(get_rls_session)
):
    service = InvitationService(session)
    try:
        invitation = await service.invite_doctor(
            admin_user=current_user, 
            doctor_email=data.doctor_email
        )
        return invitation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{invitation_id}", response_model=InvitationActionResponse)
async def respond_to_invitation(
    invitation_id: int,
    action: InvitationActionRequest,
    current_user: TokenPayload = Depends(require_roles("doctor")),
    session: AsyncSession = Depends(get_rls_session)
):
    service = InvitationService(session)
    try:
        result = await service.respond_to_invitation(
            doctor_user=current_user,
            invitation_id=invitation_id,
            accept=action.accept
        )
        return InvitationActionResponse(message="Respuesta registrada con éxito", status=result["status"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
