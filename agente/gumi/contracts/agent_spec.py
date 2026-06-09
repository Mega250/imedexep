from __future__ import annotations

from typing import Optional

from pydantic import Field

from gumi.contracts.base import GumiModel
from gumi.contracts.enums import RiskLevel
from gumi.contracts.tool_spec import ToolSpec


class MetaPermissions(GumiModel):
    can_draft_agent_specs: bool = False
    can_request_agent_creation: bool = False
    can_register_or_compile_agents: bool = False
    can_create_child_agents: bool = False
    can_create_recursive_agents: bool = False
    can_modify_own_policy: bool = False
    can_disable_audit: bool = False


class MemoryPolicy(GumiModel):
    remember: list[str] = Field(default_factory=list)
    do_not_remember: list[str] = Field(default_factory=list)
    auto_write: bool = False


class WorkflowStep(GumiModel):
    step: str
    description: str = ""


class EvalRubricItem(GumiModel):
    criterion: str
    question: str = ""


class RuntimePolicy(GumiModel):
    network: str = "disabled_by_default"
    filesystem: str = "temporary_workspace_only"
    max_execution_time_seconds: int = 30
    requires_human_confirmation_for: list[str] = Field(default_factory=list)


class AgentSpec(GumiModel):
    agent_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    version: str = "0.1.0"
    primary_goal: str = ""
    non_goals: list[str] = Field(default_factory=list)
    system_prompt: str = ""
    language: str = "es"
    domain: str = "general"
    domain_risk_level: RiskLevel = RiskLevel.A
    capabilities: list[str] = Field(default_factory=list)
    forbidden_capabilities: list[str] = Field(default_factory=list)
    tools: list[ToolSpec] = Field(default_factory=list)
    required_toolpacks: list[str] = Field(default_factory=list)
    workflow: list[WorkflowStep] = Field(default_factory=list)
    memory_policy: MemoryPolicy = Field(default_factory=MemoryPolicy)
    eval_rubric: list[EvalRubricItem] = Field(default_factory=list)
    human_review_points: list[str] = Field(default_factory=list)
    failure_modes: list[str] = Field(default_factory=list)
    runtime_policy: RuntimePolicy = Field(default_factory=RuntimePolicy)
    max_tool_iterations: int = 5
    agent_generation_depth: int = 0
    can_create_agents: bool = False
    can_modify_agents: bool = False
    can_create_tools: bool = False
    max_child_depth: int = 0
    meta_permissions: MetaPermissions = Field(default_factory=MetaPermissions)
    policy_decision_ref: Optional[str] = None
    approval_ref: Optional[str] = None
    compiled: bool = False
