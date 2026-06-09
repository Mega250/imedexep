from __future__ import annotations

from typing import Optional

from gumi.config.settings import settings
from gumi.contracts.enums import ModelTier, TierSource
from gumi.contracts.model import ModelCapabilities, ModelProfile
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.model.prober import ModelProber


def infer_tier(param_count_b: float, small_max: float, mid_max: float) -> ModelTier:
    if param_count_b < small_max:
        return ModelTier.SMALL
    if param_count_b <= mid_max:
        return ModelTier.MID
    return ModelTier.FRONTIER


class TierResolver:
    def __init__(self, registry: Optional[ManifestRegistry] = None, prober: Optional[ModelProber] = None) -> None:
        self._registry = registry or ManifestRegistry()
        self._prober = prober
        self._models = self._registry.models()

    async def resolve(self, model_id: str) -> ModelProfile:
        entry = self._models.models.get(model_id)
        if entry is not None:
            return ModelProfile(
                model_id=model_id,
                provider=entry.provider,
                family=entry.family,
                tier=entry.tier,
                tier_source=TierSource.REGISTRY,
                param_count_b=entry.param_count_b,
                requests_per_5h=entry.requests_per_5h,
                supports=ModelCapabilities(**entry.supports),
                recommended_roles=entry.recommended_roles,
                parameter_overrides=entry.parameter_overrides,
            )
        if self._models.probe.enabled and self._prober is not None:
            param_count = await self._prober.probe(model_id)
            if param_count is not None:
                thresholds = self._models.probe.thresholds
                tier = infer_tier(
                    param_count,
                    thresholds.get("small_max_b", 12),
                    thresholds.get("mid_max_b", 31),
                )
                return ModelProfile(
                    model_id=model_id,
                    provider=settings.PROVIDER,
                    family="unknown",
                    tier=tier,
                    tier_source=TierSource.PROBE,
                    param_count_b=param_count,
                )
        return ModelProfile(
            model_id=model_id,
            provider=settings.PROVIDER,
            family="unknown",
            tier=self._models.fallback_tier,
            tier_source=TierSource.FALLBACK,
        )
