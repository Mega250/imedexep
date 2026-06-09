from __future__ import annotations

from typing import Optional

from gumi.contracts.model import BehaviorProfile, ModelProfile, SamplingParams
from gumi.manifest_loader.registry import ManifestRegistry


def _lerp(low: float, high: float, t: float) -> float:
    return low + (high - low) * t


class ParameterMapper:
    def __init__(self, registry: Optional[ManifestRegistry] = None) -> None:
        self._registry = registry or ManifestRegistry()
        self._family_cfg = self._registry.family_sampling()
        self._roles = self._registry.roles().roles

    def map(self, profile: BehaviorProfile, family: str, role: str, model_profile: ModelProfile) -> SamplingParams:
        families = self._family_cfg.families
        fam = families.get(family) or families.get("default") or {}
        mapping = self._family_cfg.mapping
        temp_axis = mapping.get("temperature_from", "creativity")
        topp_axis = mapping.get("top_p_from", "exploration")
        temp_range = fam.get("temperature", [0.05, 0.8])
        topp_range = fam.get("top_p", [0.6, 0.95])
        temperature = _lerp(float(temp_range[0]), float(temp_range[1]), float(getattr(profile, temp_axis)))
        top_p = _lerp(float(topp_range[0]), float(topp_range[1]), float(getattr(profile, topp_axis)))
        top_k: Optional[int] = None
        if "top_k_strict" in fam or "top_k_default" in fam:
            top_k = fam.get("top_k_strict") if profile.strictness > 0.8 else fam.get("top_k_default")
        repetition_penalty = fam.get("repetition_penalty")
        temperature = self._apply_overrides(temperature, role, model_profile)
        return SamplingParams(
            temperature=round(temperature, 4),
            top_p=round(top_p, 4),
            top_k=top_k,
            repetition_penalty=repetition_penalty,
            max_tokens=self._max_tokens_for(role),
        )

    def _apply_overrides(self, temperature: float, role: str, model_profile: ModelProfile) -> float:
        overrides = model_profile.parameter_overrides.get(role, {}) if model_profile else {}
        low = overrides.get("temperature_min")
        high = overrides.get("temperature_max")
        if low is not None:
            temperature = max(temperature, float(low))
        if high is not None:
            temperature = min(temperature, float(high))
        return temperature

    def _max_tokens_for(self, role: str) -> Optional[int]:
        budgets = self._family_cfg.reasoning_budgets
        entry = self._roles.get(role)
        budget = entry.max_reasoning_budget.value if entry else "medium"
        return budgets.get(budget)
