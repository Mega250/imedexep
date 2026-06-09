from __future__ import annotations

from typing import Any, Optional

from pydantic import Field

from gumi.contracts.base import GumiModel
from gumi.contracts.enums import (
    CouncilRoleName,
    ModelTier,
    OutputMode,
    ReasoningBudget,
    RiskTolerance,
    SafetyLabel,
    TierSource,
    VectorType,
)


class BehaviorProfile(GumiModel):
    name: str
    creativity: float = 0.5
    determinism: float = 0.5
    verbosity: float = 0.5
    exploration: float = 0.5
    strictness: float = 0.5


class RoleProfile(GumiModel):
    role: CouncilRoleName
    purpose: str
    behavior_profile: str
    output_mode: OutputMode = OutputMode.JSON
    max_reasoning_budget: ReasoningBudget = ReasoningBudget.MEDIUM
    risk_tolerance: RiskTolerance = RiskTolerance.LOW
    passes: int = 1


class SamplingParams(GumiModel):
    temperature: float
    top_p: float
    top_k: Optional[int] = None
    min_p: Optional[float] = None
    repetition_penalty: Optional[float] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None
    max_tokens: Optional[int] = None
    stop_sequences: list[str] = Field(default_factory=list)
    native_json_format: bool = True


class ModelCapabilities(GumiModel):
    json_mode: bool = False
    tool_calling: bool = False
    long_context: bool = False
    vision: bool = False


class ModelProfile(GumiModel):
    model_id: str
    provider: str
    family: str
    tier: ModelTier
    tier_source: TierSource = TierSource.FALLBACK
    param_count_b: Optional[float] = None
    requests_per_5h: Optional[int] = None
    supports: ModelCapabilities = Field(default_factory=ModelCapabilities)
    recommended_roles: list[CouncilRoleName] = Field(default_factory=list)
    parameter_overrides: dict[str, Any] = Field(default_factory=dict)


class LLMRequest(GumiModel):
    model_id: str
    role: CouncilRoleName
    messages: list[dict[str, Any]]
    output_mode: OutputMode = OutputMode.JSON
    output_schema: Optional[dict[str, Any]] = None
    sampling: Optional[SamplingParams] = None


class LLMResponse(GumiModel):
    model_id: str
    role: CouncilRoleName
    content: str
    parsed: Optional[dict[str, Any]] = None
    repaired: bool = False
    valid: bool = True
    error: Optional[str] = None
    usage: dict[str, Any] = Field(default_factory=dict)


class EmbeddingProfile(GumiModel):
    model_id: str
    provider: str
    native_dim: int
    target_dim: int
    vector_type: VectorType = VectorType.VECTOR
    normalize: bool = True
    batch_size: int = 32


class ContentSafetyVerdict(GumiModel):
    user_safety: SafetyLabel
    response_safety: Optional[SafetyLabel] = None
    categories: list[str] = Field(default_factory=list)
    moderated_by: str = ""
