from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional

from gumi.contracts.runtime_state import Observation, Plan, StepEvaluation


@dataclass
class RunState:
    goal: str
    user_input: str = ""
    resolved_input: str = ""
    tier: str = "frontier"
    model_id: str = ""
    plan: Optional[Plan] = None
    observations: list[Observation] = field(default_factory=list)
    evaluations: list[StepEvaluation] = field(default_factory=list)
    retries: int = 0
    max_retries: int = 2
    answer: str = ""
    short_circuit: bool = False
    done: bool = False
    error: Optional[str] = None
    last_error: str = ""
    context: dict[str, Any] = field(default_factory=dict)
    history: list[dict] = field(default_factory=list)
    trace: list[str] = field(default_factory=list)
