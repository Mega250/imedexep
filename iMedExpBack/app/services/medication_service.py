from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.repositories.medication_repo import MedicationRepository
from app.schemas.medication import MedicationResponse

RXNAV_BASE_URL = "https://rxnav.nlm.nih.gov/REST"

KNOWN_BRAND_INGREDIENTS: dict[str, tuple[str, ...]] = {
    "seretide": ("salmeterol", "propionato de fluticasona"),
}

class MedicationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = MedicationRepository(session)

    async def search_medications(self, query_text: str) -> list[MedicationResponse]:
        medications = await self.repo.search_by_name(query_text)
        return [MedicationResponse.model_validate(m) for m in medications]

    async def ensure_catalog_entry_from_free_text(self, raw_name: str):
        cleaned = " ".join(raw_name.strip().split())
        if not cleaned:
            return None

        existing = await self.repo.find_exact(cleaned)
        if existing:
            return existing

        candidate = await self._lookup_rxnav_candidate(cleaned)
        if candidate is None:
            candidate = self._known_brand_candidate(cleaned)

        if candidate:
            generic_name, commercial_name = candidate
            existing = await self.repo.find_exact(generic_name, commercial_name)
            if existing:
                return existing
            return await self.repo.create_catalog_item(
                generic_name=generic_name,
                commercial_name=commercial_name,
            )

        return await self.repo.create_catalog_item(generic_name=cleaned)

    def _known_brand_candidate(self, raw_name: str) -> tuple[str, str] | None:
        ingredients = KNOWN_BRAND_INGREDIENTS.get(raw_name.strip().lower())
        if not ingredients:
            return None
        return " + ".join(ingredients), raw_name.strip()

    async def _lookup_rxnav_candidate(self, raw_name: str) -> tuple[str, str] | None:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                rxcui_response = await client.get(
                    f"{RXNAV_BASE_URL}/rxcui.json",
                    params={"name": raw_name},
                )
                rxcui_response.raise_for_status()
                rxcuis = (
                    rxcui_response.json()
                    .get("idGroup", {})
                    .get("rxnormId", [])
                )
                if not rxcuis:
                    return None

                related_response = await client.get(
                    f"{RXNAV_BASE_URL}/rxcui/{rxcuis[0]}/related.json",
                    params={"tty": "IN+PIN"},
                )
                related_response.raise_for_status()
                groups = (
                    related_response.json()
                    .get("relatedGroup", {})
                    .get("conceptGroup", [])
                )
        except Exception:
            return None

        ingredients: list[str] = []
        for group in groups:
            for prop in group.get("conceptProperties") or []:
                name = str(prop.get("name") or "").strip()
                if name and name.lower() not in {i.lower() for i in ingredients}:
                    ingredients.append(name)

        if not ingredients:
            return None

        generic_name = " + ".join(ingredients)
        commercial_name = raw_name if generic_name.lower() != raw_name.lower() else None
        return generic_name, commercial_name
