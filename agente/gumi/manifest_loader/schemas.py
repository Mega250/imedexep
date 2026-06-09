from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from gumi.contracts.enums import (
    ModelTier,
    OutputMode,
    ReasoningBudget,
    RiskTolerance,
    VectorType,
)


class PermissiveModel(BaseModel):
    model_config = ConfigDict(protected_namespaces=(), extra="allow")


class StrictModel(BaseModel):
    model_config = ConfigDict(protected_namespaces=())


class ProvidersFile(StrictModel):
    version: int
    providers: dict[str, dict[str, Any]]


class ProbeConfig(StrictModel):
    enabled: bool = True
    ollama_show_path: str = "/api/show"
    thresholds: dict[str, float] = Field(default_factory=dict)


class ModelEntry(StrictModel):
    provider: str
    family: str
    tier: ModelTier
    param_count_b: Optional[float] = None
    requests_per_5h: Optional[int] = None
    rate_limit: Optional[dict[str, float]] = None
    supports: dict[str, bool] = Field(default_factory=dict)
    recommended_roles: list[str] = Field(default_factory=list)
    parameter_overrides: dict[str, Any] = Field(default_factory=dict)


class ModelsFile(StrictModel):
    version: int
    fallback_tier: ModelTier
    rate: dict[str, Any] = Field(default_factory=dict)
    probe: ProbeConfig = Field(default_factory=ProbeConfig)
    models: dict[str, ModelEntry]


class RoleEntry(StrictModel):
    purpose: str
    behavior_profile: str
    output_mode: OutputMode = OutputMode.JSON
    max_reasoning_budget: ReasoningBudget = ReasoningBudget.MEDIUM
    risk_tolerance: RiskTolerance = RiskTolerance.LOW
    passes: int = 1


class RolesFile(StrictModel):
    version: int
    debate_style: str
    freeform_debate: bool = False
    human_appeal_enabled: bool = True
    enable_planner_rebuttal: bool = False
    roles: dict[str, RoleEntry]


class BehaviorValues(StrictModel):
    creativity: float
    determinism: float
    verbosity: float
    exploration: float
    strictness: float


class BehaviorProfilesFile(StrictModel):
    version: int
    profiles: dict[str, BehaviorValues]


class FamilySamplingFile(StrictModel):
    version: int
    mapping: dict[str, str] = Field(default_factory=dict)
    reasoning_budgets: dict[str, int] = Field(default_factory=dict)
    families: dict[str, dict[str, Any]]


class TierPolicyFile(StrictModel):
    version: int
    tiers: dict[str, dict[str, Any]]
    local_mode_defaults: dict[str, Any] = Field(default_factory=dict)
    api_mode_defaults: dict[str, Any] = Field(default_factory=dict)


class PgvectorLimits(StrictModel):
    vector_max_dim: int = 2000
    halfvec_max_dim: int = 4000


class EmbeddingEntry(StrictModel):
    model_id: str
    provider: str
    native_dim: int
    target_dim: int
    vector_type: VectorType = VectorType.VECTOR
    index: str = "hnsw"
    normalize: bool = True
    batch_size: int = 32
    use_case: Optional[str] = None
    commercial_use: Optional[bool] = None
    license: Optional[str] = None


class EmbeddingsFile(StrictModel):
    version: int
    active: str
    pgvector_limits: PgvectorLimits = Field(default_factory=PgvectorLimits)
    embeddings: dict[str, EmbeddingEntry]


class RagPolicyFile(StrictModel):
    version: int
    retrieval: dict[str, Any] = Field(default_factory=dict)
    reranker: dict[str, Any] = Field(default_factory=dict)
    crag: dict[str, Any] = Field(default_factory=dict)
    chunking: dict[str, Any] = Field(default_factory=dict)
    pgvector: dict[str, Any] = Field(default_factory=dict)
    database: dict[str, Any] = Field(default_factory=dict)
    llm: dict[str, Any] = Field(default_factory=dict)


class TtsVoiceEntry(StrictModel):
    engine: str
    name: str
    language: str
    languages: list[str] = Field(default_factory=list)
    model_id: Optional[str] = None
    reference_audio: Optional[str] = None
    sample_rate: int = 22050
    requires_reference: bool = False
    commercial_use: Optional[bool] = None
    license: Optional[str] = None


class TtsVoicesFile(StrictModel):
    version: int
    active: str
    engines: dict[str, dict[str, Any]] = Field(default_factory=dict)
    voices: dict[str, TtsVoiceEntry]


class CompilerPolicyFile(StrictModel):
    version: int
    runtime_version: str = "0.1.0"
    default_export_mode: str = "frozen_runtime"
    signature: dict[str, Any] = Field(default_factory=dict)
    lock: dict[str, Any] = Field(default_factory=dict)
    package_layout: dict[str, Any] = Field(default_factory=dict)
    docker: dict[str, Any] = Field(default_factory=dict)
    frozen_runtime: dict[str, Any] = Field(default_factory=dict)
    editable_project: dict[str, Any] = Field(default_factory=dict)


class ChangePolicyFile(StrictModel):
    version: int
    change_type_levels: dict[str, str] = Field(default_factory=dict)
    permission_levels: dict[str, str] = Field(default_factory=dict)
    tool_risk_levels: dict[str, str] = Field(default_factory=dict)
    pii_levels: dict[str, str] = Field(default_factory=dict)
    version_bump: dict[str, str] = Field(default_factory=dict)
    approval_required_levels: list[str] = Field(default_factory=list)
    council_review_levels: list[str] = Field(default_factory=list)
    blocked_meta_changes: list[str] = Field(default_factory=list)
    dependencies: dict[str, dict[str, list[str]]] = Field(default_factory=dict)


class SmallModelGuardsFile(StrictModel):
    version: int
    defaults: dict[str, Any] = Field(default_factory=dict)
    tiers: dict[str, dict[str, Any]] = Field(default_factory=dict)


class RuntimeFlowsFile(StrictModel):
    version: int
    max_steps: int = 8
    flows: dict[str, dict[str, Any]]


class ToolDomainEntry(StrictModel):
    tier: str
    label: str = ""
    risk_domain: str = ""
    categories: list[str] = Field(default_factory=list)
    status: str = "planned"
    packs: list[str] = Field(default_factory=list)
    capabilities: list[str] = Field(default_factory=list)


class ToolDomainsFile(StrictModel):
    version: int
    tiers: list[str] = Field(default_factory=list)
    coverage_threshold: float = 0.2
    universal_categories: list[str] = Field(default_factory=list)
    default_tools: list[str] = Field(default_factory=list)
    domains: dict[str, ToolDomainEntry]


class SandboxPolicyFile(StrictModel):
    version: int
    defaults: dict[str, Any]
    forbidden_patterns: list[str] = Field(default_factory=list)
    secrets: dict[str, Any] = Field(default_factory=dict)


class BrowserPolicyFile(StrictModel):
    version: int
    headless: bool = True
    allowed_domains: list[str] = Field(default_factory=list)
    viewport: dict[str, Any] = Field(default_factory=dict)
    max_steps: int = 40


class ForgeLibrariesFile(StrictModel):
    version: int
    allowlist: list[str] = Field(default_factory=list)
    module_to_package: dict[str, str] = Field(default_factory=dict)
    install: dict[str, Any] = Field(default_factory=dict)
    pending: dict[str, Any] = Field(default_factory=dict)


class RoleMatrixFile(StrictModel):
    version: int
    roles: dict[str, dict[str, Any]]


class CatalogCard(PermissiveModel):
    category: str = "general"
    side_effects: bool = False
    risk: str = "low"
    use_when: str = ""
    do_not_use_when: str = ""
    inputs: list[str] = Field(default_factory=list)


class CatalogEntry(StrictModel):
    import_path: str
    wrap_dynamic_arg: Optional[str] = None
    routing_keys: list[str] = Field(default_factory=list)
    injected_keys: list[str] = Field(default_factory=list)
    fixed_arguments: dict[str, Any] = Field(default_factory=dict)
    card: CatalogCard = Field(default_factory=CatalogCard)
    pii_level: Optional[str] = None
    source: str = "toolpack"


class ToolpackCatalogFile(StrictModel):
    version: int
    functions: dict[str, CatalogEntry]


class DomainTaxonomyFile(PermissiveModel):
    version: int
    levels: dict[str, Any]
    domains: dict[str, Any]
    safe_alternatives: dict[str, Any] = Field(default_factory=dict)


class CapabilityMapFile(PermissiveModel):
    version: int
    defaults: dict[str, Any] = Field(default_factory=dict)
    capabilities: dict[str, Any]


class MetaAgentPolicyFile(PermissiveModel):
    version: int
    agent_creation_policy: dict[str, Any]
    meta_permissions: dict[str, Any]


class MedicalModesFile(PermissiveModel):
    version: int
    modes: dict[str, Any]
    health_data_policy: dict[str, Any] = Field(default_factory=dict)
    post_council_chain: list[str] = Field(default_factory=list)


class ProgrammingPolicyFile(PermissiveModel):
    version: int
    agent_types: dict[str, Any] = Field(default_factory=dict)
    programming_capabilities: dict[str, Any]


class ContentSafetyFile(PermissiveModel):
    version: int
    enabled: bool = True
    provider: str
    model_id: str


class PolicyRule(PermissiveModel):
    id: str
    when: dict[str, Any] = Field(default_factory=dict)
    then: dict[str, Any] = Field(default_factory=dict)


class PolicyManifestFile(StrictModel):
    version: int
    defaults: dict[str, Any] = Field(default_factory=dict)
    rules: list[PolicyRule]
