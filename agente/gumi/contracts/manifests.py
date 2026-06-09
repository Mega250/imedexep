from __future__ import annotations

from typing import Any, Optional

from pydantic import Field

from gumi.contracts.base import GumiModel
from gumi.contracts.enums import (
    AuthType,
    HttpMethod,
    ManifestState,
    PiiLevel,
    RiskLevel,
)


class EntityField(GumiModel):
    column: str
    type: str = "string"
    required: bool = False


class EntityPermissions(GumiModel):
    create: bool = False
    read: bool = True
    update: bool = False
    delete: bool = False


class DataEntity(GumiModel):
    table: str
    primary_key: str
    display_name_field: Optional[str] = None
    fields: dict[str, EntityField] = Field(default_factory=dict)
    permissions: EntityPermissions = Field(default_factory=EntityPermissions)


class EntityRelationship(GumiModel):
    from_entity: str
    from_field: str
    to_entity: str
    to_field: str


class DataMetric(GumiModel):
    description: str = ""
    base_entity: str
    aggregation: str
    field: Optional[str] = None


class DataManifest(GumiModel):
    database_id: str
    engine: str
    business_domain: str = "general"
    entities: dict[str, DataEntity] = Field(default_factory=dict)
    relationships: list[EntityRelationship] = Field(default_factory=list)
    metrics: dict[str, DataMetric] = Field(default_factory=dict)
    state: ManifestState = ManifestState.DRAFT
    version: int = 1


class DocColumn(GumiModel):
    semantic_field: str
    type: str = "string"
    confidence: float = 0.0


class DocSheet(GumiModel):
    semantic_type: str = ""
    columns: dict[str, DocColumn] = Field(default_factory=dict)


class DocManifest(GumiModel):
    doc_id: str
    file_name: str
    file_type: str
    detected_domain: str = "general"
    sheets: dict[str, DocSheet] = Field(default_factory=dict)
    semantic_entities: dict[str, Any] = Field(default_factory=dict)
    confidence: float = 0.0
    state: ManifestState = ManifestState.DRAFT
    version: int = 1


class TemplateField(GumiModel):
    label: str = ""
    type: str = "string"
    required: bool = False
    description: str = ""
    source_candidates: list[str] = Field(default_factory=list)


class TemplateValidationRule(GumiModel):
    field: str
    rule: str


class TemplateManifest(GumiModel):
    template_id: str
    template_type: str = ""
    source_file: str = ""
    output_formats: list[str] = Field(default_factory=list)
    fields: dict[str, TemplateField] = Field(default_factory=dict)
    validation_rules: list[TemplateValidationRule] = Field(default_factory=list)
    state: ManifestState = ManifestState.DRAFT
    version: int = 1


class AuthSpec(GumiModel):
    type: AuthType = AuthType.NONE
    secret_ref: Optional[str] = None
    header_name: Optional[str] = None


class ApiEndpoint(GumiModel):
    name: str
    path: str
    method: HttpMethod = HttpMethod.GET
    pii_level: PiiLevel = PiiLevel.NONE
    required_scopes: list[str] = Field(default_factory=list)
    aggregate_only: bool = False
    response_fields: list[str] = Field(default_factory=list)
    request_fields: list[str] = Field(default_factory=list)
    rate_limit_per_min: int = 60
    requires_audit: bool = True


class ApiManifest(GumiModel):
    manifest_id: str
    owner: str = ""
    base_url: str
    auth: AuthSpec = Field(default_factory=AuthSpec)
    data_classification: str = ""
    allowed_endpoints: list[ApiEndpoint] = Field(default_factory=list)
    forbidden_endpoints: list[str] = Field(default_factory=list)
    risk_level: RiskLevel = RiskLevel.C
    requires_human_developer: bool = True
    requires_audit: bool = True
    allowed_roles: list[str] = Field(default_factory=list)
    state: ManifestState = ManifestState.DRAFT
    version: int = 1
