from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.invitation import InstitutionInvitation
from app.models.doctor import Doctor

class InvitationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def add(self, invitation: InstitutionInvitation) -> None:
        self.session.add(invitation)

    async def get_pending_invitation(self, invitation_id: int, doctor_user_id: int) -> InstitutionInvitation | None:
        query = select(InstitutionInvitation).join(Doctor).where(
            InstitutionInvitation.id == invitation_id,
            Doctor.user_id == doctor_user_id,
            InstitutionInvitation.status == 'pending'
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def list_for_doctor_user(self, doctor_user_id: int) -> list[InstitutionInvitation]:
        query = (
            select(InstitutionInvitation)
            .join(Doctor, InstitutionInvitation.doctor_id == Doctor.id)
            .options(selectinload(InstitutionInvitation.institution))
            .where(Doctor.user_id == doctor_user_id)
            .order_by(InstitutionInvitation.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_for_institution(self, institution_id: int) -> list[InstitutionInvitation]:
        query = (
            select(InstitutionInvitation)
            .options(selectinload(InstitutionInvitation.doctor).selectinload(Doctor.user))
            .where(InstitutionInvitation.institution_id == institution_id)
            .order_by(InstitutionInvitation.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
