from __future__ import annotations

import inspect
from difflib import get_close_matches
from typing import Any, Optional

from gumi.contracts.agent_spec import AgentSpec
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.runtime.outcome import classify_outcome
from gumi.runtime.permission import ToolPermissionEngine
from gumi.runtime.tool_registry import ToolRegistry

_DROP_KEYS = frozenset(
    {"comment", "reason", "reasoning", "explanation", "thought", "note", "comentario", "nota", "razonamiento", "pensamiento"}
)


def _resolve_to_signature(function: Any, params: dict[str, Any]) -> dict[str, Any]:
    try:
        signature = inspect.signature(function)
    except (TypeError, ValueError):
        return params
    for parameter in signature.parameters.values():
        if parameter.kind == inspect.Parameter.VAR_KEYWORD:
            return params
    parameters = [p for p in signature.parameters.values() if p.kind in (inspect.Parameter.POSITIONAL_OR_KEYWORD, inspect.Parameter.KEYWORD_ONLY)]
    names = [p.name for p in parameters]
    accepted = {key: value for key, value in params.items() if key in names}
    leftovers = {key: value for key, value in params.items() if key not in names}
    if not leftovers:
        return accepted
    used: set[str] = set()
    for target in [name for name in names if name not in accepted]:
        match = get_close_matches(target, [key for key in leftovers if key not in used], n=1, cutoff=0.7)
        if match:
            accepted[target] = leftovers[match[0]]
            used.add(match[0])
    required_missing = [p.name for p in parameters if p.default is inspect.Parameter.empty and p.name not in accepted]
    free = [key for key in leftovers if key not in used]
    if len(required_missing) == 1 and len(free) == 1:
        accepted[required_missing[0]] = leftovers[free[0]]
    return accepted


class ToolDispatcherImpl:
    def __init__(
        self,
        registry: Optional[ManifestRegistry] = None,
        context: Optional[dict] = None,
        agent_spec: Optional[AgentSpec] = None,
    ) -> None:
        reg = registry or ManifestRegistry()
        guards = reg.small_model_guards().defaults
        self._tools = ToolRegistry(reg, int(guards.get("fuzzy_tool_name_min_ratio", 88)))
        self._permission = ToolPermissionEngine(reg)
        self._functions = reg.toolpack_catalog().functions
        self._exposed = reg.deployment_tool_ids()
        self._context = {**(context or {}), "registry": reg}
        self._spec = agent_spec

    @property
    def tool_definitions(self) -> list[dict[str, Any]]:
        return self._tools.tool_definitions()

    @property
    def exposed_tool_ids(self) -> set[str]:
        return self._exposed

    def backend_fn_for(self, tool_name: str) -> Optional[str]:
        return self._tools.import_path(tool_name)

    def _merge_args(self, entry: Any, llm_args: dict[str, Any]) -> dict[str, Any]:
        clean = {key: value for key, value in (llm_args or {}).items() if key not in _DROP_KEYS and value is not None}
        injected = {key: self._context[key] for key in entry.injected_keys if key in self._context}
        fixed = getattr(entry, "fixed_arguments", {}) or {}
        return {**clean, **injected, **fixed}

    async def execute(self, tool_name: str, llm_args: dict[str, Any]) -> dict[str, Any]:
        canonical = self._tools.resolve(tool_name)
        if canonical is None:
            return {"ok": False, "status": "not_found", "outcome": "terminal", "error": f"unknown tool '{tool_name}'"}
        decision = self._permission.decide(canonical, self._spec)
        if not decision.allowed:
            return {"ok": False, "status": "denied", "outcome": "terminal", "tool": canonical, "error": decision.reason}
        if decision.requires_human_approval:
            return {"ok": False, "status": "requires_human_approval", "outcome": "terminal", "tool": canonical, "error": "requires human approval"}
        function = self._tools.load_function(canonical)
        if function is None:
            return {"ok": False, "status": "error", "outcome": "terminal", "tool": canonical, "error": "backend function not implemented"}
        entry = self._functions[canonical]
        merged = _resolve_to_signature(function, self._merge_args(entry, llm_args))
        try:
            result = function(**merged)
            if inspect.isawaitable(result):
                result = await result
        except Exception as exc:
            return {"ok": False, "status": "error", "outcome": "transient", "tool": canonical, "error": str(exc)}
        if not isinstance(result, dict):
            result = {"ok": True, "status": "success", "data": result}
        result.setdefault("outcome", classify_outcome(result))
        result.setdefault("tool", canonical)
        if canonical != tool_name:
            result["repaired_from"] = tool_name
        return result
