from __future__ import annotations

from typing import Any, Optional

from pydantic import Field

from gumi.contracts.base import GumiModel
from gumi.contracts.enums import ResultQuality, StepStatus


class Step(GumiModel):
    step_id: str
    action: str
    tool: str
    input: dict[str, Any] = Field(default_factory=dict)
    requires_confirmation: bool = False


class Plan(GumiModel):
    goal: str
    steps: list[Step] = Field(default_factory=list)


class Observation(GumiModel):
    step_id: str
    status: StepStatus = StepStatus.PENDING
    data: dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None


class StepEvaluation(GumiModel):
    step_id: str
    result_quality: ResultQuality = ResultQuality.ACCEPTABLE
    should_continue: bool = True
    needs_replan: bool = False
    reason: str = ""
    suggested_fix: str = ""


class MissingToolRequest(GumiModel):
    needed_capability: str
    reason: str = ""
    alternatives_checked: list[str] = Field(default_factory=list)
    risk_level: str = "medium"
    can_continue_without_it: bool = False
    requires_human_approval: bool = True


class ToolPermissionDecision(GumiModel):
    tool: str
    allowed: bool
    requires_human_approval: bool = False
    reason: str = ""
