from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import Field

from gumi.contracts.base import GumiModel
from gumi.contracts.enums import PiiLevel, ToolSource


class ToolParameter(GumiModel):
    type: str = "string"
    description: Optional[str] = None
    enum: Optional[list[str]] = None


class ToolParameters(GumiModel):
    type: Literal["object"] = "object"
    properties: dict[str, ToolParameter] = Field(default_factory=dict)
    required: list[str] = Field(default_factory=list)


class ToolPermissions(GumiModel):
    network: bool = False
    filesystem: bool = False
    secrets: bool = False
    side_effects: bool = False
    allowed_domains: list[str] = Field(default_factory=list)


class ToolSpec(GumiModel):
    tool_id: str
    name: str
    description: str
    parameters: ToolParameters = Field(default_factory=ToolParameters)
    backend_function: str
    fixed_arguments: dict[str, Any] = Field(default_factory=dict)
    source: ToolSource = ToolSource.TOOLPACK
    required_capabilities: list[str] = Field(default_factory=list)
    required_scopes: list[str] = Field(default_factory=list)
    permissions: ToolPermissions = Field(default_factory=ToolPermissions)
    pii_level: PiiLevel = PiiLevel.NONE
    requires_audit: bool = False
    requires_human_approval: bool = False
    api_manifest_ref: Optional[str] = None
    timeout_ms: int = 10000
    max_memory_mb: int = 256


class ToolCard(GumiModel):
    tool_id: str
    name: str
    category: str
    inputs: list[str] = Field(default_factory=list)
    side_effects: bool = False
    risk: str = "low"
    use_when: str = ""
    do_not_use_when: str = ""


class ToolDependency(GumiModel):
    tool_id: str
    requires: list[str] = Field(default_factory=list)
    recommends: list[str] = Field(default_factory=list)


class ToolPack(GumiModel):
    pack_id: str
    description: str = ""
    tools: list[str] = Field(default_factory=list)
