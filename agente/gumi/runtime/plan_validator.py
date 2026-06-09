from __future__ import annotations

from typing import Optional

from gumi.contracts.runtime_state import Plan
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.runtime.tool_registry import ToolRegistry

_DROP_KEYS = frozenset(
    {"comment", "reason", "reasoning", "explanation", "thought", "note", "comentario", "nota", "razonamiento", "pensamiento"}
)


class PlanValidator:
    def __init__(self, registry: Optional[ManifestRegistry] = None, fuzzy_min_ratio: int = 88) -> None:
        self._tools = ToolRegistry(registry, fuzzy_min_ratio)

    def validate(self, plan: Plan) -> Plan:
        repaired = []
        for step in plan.steps:
            canonical = self._tools.resolve(step.tool)
            clean_input = {key: value for key, value in (step.input or {}).items() if key not in _DROP_KEYS and value is not None}
            repaired.append(step.model_copy(update={"tool": canonical or step.tool, "input": clean_input}))
        return plan.model_copy(update={"steps": repaired})
