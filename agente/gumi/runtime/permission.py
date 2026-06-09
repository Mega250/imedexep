from __future__ import annotations

from typing import Optional

from gumi.contracts.agent_spec import AgentSpec
from gumi.contracts.runtime_state import ToolPermissionDecision
from gumi.manifest_loader.registry import ManifestRegistry

_HIGH_RISK = "high"


class ToolPermissionEngine:
    def __init__(self, registry: Optional[ManifestRegistry] = None) -> None:
        reg = registry or ManifestRegistry()
        self._functions = reg.toolpack_catalog().functions
        self._exposed = reg.deployment_tool_ids()

    def decide(self, tool: str, spec: Optional[AgentSpec] = None) -> ToolPermissionDecision:
        entry = self._functions.get(tool)
        if entry is None:
            return ToolPermissionDecision(tool=tool, allowed=False, reason="tool not in catalog")
        owner_exposed = tool in self._exposed
        if spec is not None:
            granted = {t.tool_id for t in spec.tools} | {t.name for t in spec.tools} | self._exposed
            if granted and tool not in granted:
                return ToolPermissionDecision(tool=tool, allowed=False, reason="tool not granted to agent")
        requires_approval = entry.card.risk == _HIGH_RISK and not owner_exposed
        return ToolPermissionDecision(tool=tool, allowed=True, requires_human_approval=requires_approval, reason="ok")
