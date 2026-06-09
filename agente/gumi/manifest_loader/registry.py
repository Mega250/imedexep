from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

import yaml

from gumi.contracts.enums import ManifestState
from gumi.contracts.manifests import ApiManifest
from gumi.contracts.tool_spec import ToolPack
from gumi.manifest_loader.errors import EmbeddingDimensionError, ManifestNotFoundError
from gumi.manifest_loader.loader import ManifestLoader
from gumi.manifest_loader.schemas import (
    BehaviorProfilesFile,
    BrowserPolicyFile,
    CapabilityMapFile,
    CatalogEntry,
    ChangePolicyFile,
    CompilerPolicyFile,
    ContentSafetyFile,
    DomainTaxonomyFile,
    ForgeLibrariesFile,
    EmbeddingEntry,
    EmbeddingsFile,
    FamilySamplingFile,
    MedicalModesFile,
    MetaAgentPolicyFile,
    ModelsFile,
    PolicyManifestFile,
    ProgrammingPolicyFile,
    ProvidersFile,
    RagPolicyFile,
    RoleMatrixFile,
    RolesFile,
    RuntimeFlowsFile,
    SandboxPolicyFile,
    SmallModelGuardsFile,
    TierPolicyFile,
    ToolDomainsFile,
    ToolpackCatalogFile,
    TtsVoiceEntry,
    TtsVoicesFile,
)

_FORGED_OVERLAY = "toolpacks/forged_catalog.yaml"

_TOOLPACK_FILES = [
    "db_core",
    "document_core",
    "template_core",
    "identity_core",
    "audit_core",
    "scheduler_core",
    "outbox_core",
    "sandbox_core",
    "contabilidad_mx",
    "research_core",
    "datetime_core",
    "text_core",
    "file_core",
    "web_core",
    "math_core",
    "browser_core",
    "medical_core",
    "rag_core",
]


class ManifestRegistry:
    def __init__(self, loader: ManifestLoader | None = None, deployment_dir: str | None = None) -> None:
        self._loader = loader or ManifestLoader()
        self._deployment_dir = deployment_dir or os.environ.get("GUMI_DEPLOYMENT_DIR")

    @property
    def manifests_dir(self):
        return self._loader.base_dir

    def invalidate(self, relative: str) -> None:
        self._loader.invalidate(relative)

    def providers(self) -> ProvidersFile:
        return self._loader.load("gumi.providers.yaml", ProvidersFile)

    def models(self) -> ModelsFile:
        return self._loader.load("gumi.models.yaml", ModelsFile)

    def roles(self) -> RolesFile:
        return self._loader.load("gumi.roles.yaml", RolesFile)

    def behavior_profiles(self) -> BehaviorProfilesFile:
        return self._loader.load("behavior_profiles.yaml", BehaviorProfilesFile)

    def family_sampling(self) -> FamilySamplingFile:
        return self._loader.load("family_sampling.yaml", FamilySamplingFile)

    def tier_policy(self) -> TierPolicyFile:
        return self._loader.load("tier_policy.yaml", TierPolicyFile)

    def embeddings(self) -> EmbeddingsFile:
        return self._loader.load("gumi.embeddings.yaml", EmbeddingsFile)

    def sandbox_policy(self) -> SandboxPolicyFile:
        return self._loader.load("sandbox_policy.yaml", SandboxPolicyFile)

    def role_matrix(self) -> RoleMatrixFile:
        return self._loader.load("role_matrix.yaml", RoleMatrixFile)

    def base_catalog(self) -> ToolpackCatalogFile:
        return self._loader.load("toolpacks/catalog.yaml", ToolpackCatalogFile)

    def forged_catalog(self) -> ToolpackCatalogFile:
        try:
            return self._loader.load(_FORGED_OVERLAY, ToolpackCatalogFile)
        except ManifestNotFoundError:
            return ToolpackCatalogFile(version=1, functions={})

    def deployment_connectors(self) -> dict[str, ApiManifest]:
        out: dict[str, ApiManifest] = {}
        if not self._deployment_dir:
            return out
        conn_dir = Path(self._deployment_dir) / "connectors"
        if not conn_dir.is_dir():
            return out
        for path in sorted(conn_dir.glob("*.yaml")):
            manifest = ApiManifest.model_validate(yaml.safe_load(path.read_text(encoding="utf-8")))
            out[manifest.manifest_id] = manifest
        return out

    def connector_catalog_entries(self) -> dict[str, CatalogEntry]:
        from gumi.connectors.typed_tool_factory import TypedToolFactory

        factory = TypedToolFactory()
        entries: dict[str, CatalogEntry] = {}
        for manifest in list(self.api_connectors().values()) + list(self.deployment_connectors().values()):
            if manifest.state != ManifestState.ACTIVE:
                continue
            for tool_id, raw in factory.catalog_entries(manifest).items():
                entries[tool_id] = CatalogEntry.model_validate(raw)
        return entries

    def deployment_connector_tool_ids(self) -> set[str]:
        from gumi.connectors.typed_tool_factory import TypedToolFactory

        factory = TypedToolFactory()
        ids: set[str] = set()
        for manifest in self.deployment_connectors().values():
            if manifest.state != ManifestState.ACTIVE:
                continue
            ids.update(factory.catalog_entries(manifest).keys())
        return ids

    def deployment_toolpacks(self) -> dict[str, CatalogEntry]:
        out: dict[str, CatalogEntry] = {}
        if not self._deployment_dir:
            return out
        tools_dir = Path(self._deployment_dir) / "tools"
        if not tools_dir.is_dir():
            return out
        if str(tools_dir) not in sys.path:
            sys.path.insert(0, str(tools_dir))
        for path in sorted(tools_dir.glob("*.yaml")):
            data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
            for tool_id, raw in (data.get("functions") or {}).items():
                out[tool_id] = CatalogEntry.model_validate(raw)
        return out

    def deployment_tool_ids(self) -> set[str]:
        return self.deployment_connector_tool_ids() | set(self.deployment_toolpacks().keys())

    def toolpack_catalog(self) -> ToolpackCatalogFile:
        base = self.base_catalog()
        functions: dict[str, CatalogEntry] = dict(base.functions)
        functions.update(self.connector_catalog_entries())
        functions.update(self.deployment_toolpacks())
        functions.update(self.forged_catalog().functions)
        return ToolpackCatalogFile(version=base.version, functions=functions)

    def refresh_catalog(self) -> None:
        self._loader.invalidate(_FORGED_OVERLAY)
        for name in self.api_connectors():
            self._loader.invalidate(f"toolpacks/api_connectors/{name}.yaml")

    def forge_libraries(self) -> ForgeLibrariesFile:
        return self._loader.load("forge_libraries.yaml", ForgeLibrariesFile)

    def toolpacks(self) -> dict[str, ToolPack]:
        out: dict[str, ToolPack] = {}
        for name in _TOOLPACK_FILES:
            out[name] = self._loader.load(f"toolpacks/{name}.yaml", ToolPack)
        return out

    def api_connectors(self) -> dict[str, ApiManifest]:
        return self._loader.load_dir("toolpacks/api_connectors", ApiManifest)

    def domain_taxonomy(self) -> DomainTaxonomyFile:
        return self._loader.load("policy/domain_taxonomy.yaml", DomainTaxonomyFile)

    def capability_map(self) -> CapabilityMapFile:
        return self._loader.load("policy/capability_map.yaml", CapabilityMapFile)

    def meta_agent_policy(self) -> MetaAgentPolicyFile:
        return self._loader.load("policy/meta_agent_policy.yaml", MetaAgentPolicyFile)

    def medical_modes(self) -> MedicalModesFile:
        return self._loader.load("policy/medical_modes.yaml", MedicalModesFile)

    def programming_policy(self) -> ProgrammingPolicyFile:
        return self._loader.load("policy/programming_policy.yaml", ProgrammingPolicyFile)

    def content_safety(self) -> ContentSafetyFile:
        return self._loader.load("policy/content_safety.yaml", ContentSafetyFile)

    def policy_manifest(self) -> PolicyManifestFile:
        return self._loader.load("policy/policy_manifest.yaml", PolicyManifestFile)

    def rag_policy(self) -> RagPolicyFile:
        return self._loader.load("rag_policy.yaml", RagPolicyFile)

    def compiler_policy(self) -> CompilerPolicyFile:
        return self._loader.load("compiler_policy.yaml", CompilerPolicyFile)

    def change_policy(self) -> ChangePolicyFile:
        return self._loader.load("change_policy.yaml", ChangePolicyFile)

    def small_model_guards(self) -> SmallModelGuardsFile:
        return self._loader.load("small_model_guards.yaml", SmallModelGuardsFile)

    def runtime_flows(self) -> RuntimeFlowsFile:
        return self._loader.load("runtime_flows.yaml", RuntimeFlowsFile)

    def tool_domains(self) -> ToolDomainsFile:
        return self._loader.load("tool_domains.yaml", ToolDomainsFile)

    def categories_for_domain(self, domain: str | None) -> set[str] | None:
        if not domain:
            return None
        td = self.tool_domains()
        cats: set[str] = set()
        matched = False
        for key, entry in td.domains.items():
            if entry.risk_domain == domain or key == domain:
                cats.update(entry.categories)
                matched = True
        if not matched:
            return None
        cats.update(td.universal_categories)
        return cats

    def browser_policy(self) -> BrowserPolicyFile:
        return self._loader.load("browser_policy.yaml", BrowserPolicyFile)

    def active_embedding(self) -> EmbeddingEntry:
        cfg = self.embeddings()
        entry = cfg.embeddings.get(cfg.active)
        if entry is None:
            raise EmbeddingDimensionError(f"active embedding '{cfg.active}' not found")
        validate_embedding_dimension(entry, cfg.pgvector_limits.vector_max_dim, cfg.pgvector_limits.halfvec_max_dim)
        return entry

    def tts_voices(self) -> TtsVoicesFile:
        return self._loader.load("tts_voices.yaml", TtsVoicesFile)

    def active_tts_voice(self) -> TtsVoiceEntry:
        cfg = self.tts_voices()
        entry = cfg.voices.get(cfg.active)
        if entry is None:
            raise ValueError(f"active tts voice '{cfg.active}' not found")
        if entry.engine not in cfg.engines:
            raise ValueError(f"tts voice '{cfg.active}' references unknown engine '{entry.engine}'")
        return entry

    def load_all(self) -> dict[str, Any]:
        loaded: dict[str, Any] = {
            "providers": self.providers(),
            "models": self.models(),
            "roles": self.roles(),
            "behavior_profiles": self.behavior_profiles(),
            "family_sampling": self.family_sampling(),
            "tier_policy": self.tier_policy(),
            "embeddings": self.embeddings(),
            "sandbox_policy": self.sandbox_policy(),
            "role_matrix": self.role_matrix(),
            "toolpack_catalog": self.toolpack_catalog(),
            "toolpacks": self.toolpacks(),
            "api_connectors": self.api_connectors(),
            "domain_taxonomy": self.domain_taxonomy(),
            "capability_map": self.capability_map(),
            "meta_agent_policy": self.meta_agent_policy(),
            "medical_modes": self.medical_modes(),
            "programming_policy": self.programming_policy(),
            "content_safety": self.content_safety(),
            "policy_manifest": self.policy_manifest(),
            "rag_policy": self.rag_policy(),
            "tts_voices": self.tts_voices(),
            "compiler_policy": self.compiler_policy(),
            "change_policy": self.change_policy(),
            "small_model_guards": self.small_model_guards(),
            "runtime_flows": self.runtime_flows(),
            "tool_domains": self.tool_domains(),
            "browser_policy": self.browser_policy(),
            "forge_libraries": self.forge_libraries(),
        }
        self.active_embedding()
        self.active_tts_voice()
        return loaded


def validate_embedding_dimension(entry: EmbeddingEntry, vector_max: int, halfvec_max: int) -> None:
    if entry.target_dim <= 0:
        raise EmbeddingDimensionError("target_dim must be positive")
    if entry.target_dim > entry.native_dim:
        raise EmbeddingDimensionError(
            f"target_dim {entry.target_dim} exceeds native_dim {entry.native_dim}"
        )
    if entry.index == "flat":
        return
    limit = halfvec_max if entry.vector_type.value == "halfvec" else vector_max
    if entry.target_dim > limit:
        raise EmbeddingDimensionError(
            f"target_dim {entry.target_dim} exceeds {entry.vector_type.value} index limit {limit}"
        )
