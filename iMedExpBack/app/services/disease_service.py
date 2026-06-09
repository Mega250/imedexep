from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.disease_repo import DiseaseRepository
from app.schemas.disease import DiseaseResponse


class DiseaseService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = DiseaseRepository(session)

    async def search(self, query_text: str) -> list[DiseaseResponse]:
        diseases = await self.repo.search_by_name(query_text)
        return [DiseaseResponse.model_validate(d) for d in diseases]

    async def get(self, disease_id: int) -> DiseaseResponse:
        disease = await self.repo.get_by_id(disease_id)
        if not disease:
            raise NotFoundError("Enfermedad no encontrada")
        return DiseaseResponse.model_validate(disease)

    async def ensure_from_free_text(
        self,
        raw_name: str,
        cie10_code: str | None = None,
    ) -> DiseaseResponse:
        cleaned = " ".join(raw_name.strip().split())

        existing = await self.repo.find_exact(cleaned)
        if existing:
            return DiseaseResponse.model_validate(existing)

        created = await self.repo.create_catalog_item(cleaned, cie10_code)
        return DiseaseResponse.model_validate(created)
