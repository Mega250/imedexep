from __future__ import annotations

from typing import Optional

from pydantic import Field

from gumi.contracts.agent_spec import AgentSpec
from gumi.contracts.base import GumiModel


class Signature(GumiModel):
    agent_spec_sha256: str
    tool_manifest_sha256: str
    policy_sha256: str
    signed_by: str = "gumi-builder"


class ToolLock(GumiModel):
    mandatory: list[str] = Field(default_factory=list)
    optional: list[str] = Field(default_factory=list)
    forbidden: list[str] = Field(default_factory=list)


class AgentLock(GumiModel):
    agent_id: str
    version: str
    frozen: bool = True
    runtime_version: str
    tools: ToolLock = Field(default_factory=ToolLock)
    capabilities: list[str] = Field(default_factory=list)


class AgentPackage(GumiModel):
    agent_id: str
    version: str
    spec: AgentSpec
    lock: AgentLock
    signature: Optional[Signature] = None
    prompt_files: list[str] = Field(default_factory=list)
    manifest_files: list[str] = Field(default_factory=list)
    policy_files: list[str] = Field(default_factory=list)
