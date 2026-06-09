from __future__ import annotations

from typing import Optional

from gumi.contracts.enums import ModelTier
from gumi.contracts.model import BehaviorProfile, RoleProfile
from gumi.manifest_loader.registry import ManifestRegistry


class RoleResolver:
    def __init__(self, registry: Optional[ManifestRegistry] = None) -> None:
        self._registry = registry or ManifestRegistry()
        self._roles = self._registry.roles()
        self._profiles = self._registry.behavior_profiles()
        self._tier_policy = self._registry.tier_policy()

    def role_profile(self, role: str) -> RoleProfile:
        entry = self._roles.roles[role]
        return RoleProfile(
            role=role,
            purpose=entry.purpose,
            behavior_profile=entry.behavior_profile,
            output_mode=entry.output_mode,
            max_reasoning_budget=entry.max_reasoning_budget,
            risk_tolerance=entry.risk_tolerance,
            passes=entry.passes,
        )

    def behavior_profile(self, role: str) -> BehaviorProfile:
        entry = self._roles.roles[role]
        values = self._profiles.profiles[entry.behavior_profile]
        return BehaviorProfile(
            name=entry.behavior_profile,
            creativity=values.creativity,
            determinism=values.determinism,
            verbosity=values.verbosity,
            exploration=values.exploration,
            strictness=values.strictness,
        )

    def passes(self, role: str) -> int:
        return self._roles.roles[role].passes

    def allowed_for_tier(self, role: str, tier: ModelTier) -> bool:
        cfg = self._tier_policy.tiers.get(tier.value, {})
        forbidden = cfg.get("forbidden_roles", [])
        allowed = cfg.get("allowed_roles", [])
        if role in forbidden:
            return False
        if allowed and role not in allowed:
            return False
        return True
