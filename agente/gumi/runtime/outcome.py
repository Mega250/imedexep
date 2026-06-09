from __future__ import annotations

from typing import Any

_TERMINAL_STATUSES = frozenset({"not_found", "invalid_input", "error", "denied", "requires_human_approval"})


def classify_outcome(result: Any, raised: bool = False) -> str:
    if raised:
        return "transient"
    if isinstance(result, dict):
        status = str(result.get("status", "")).lower()
        if status in _TERMINAL_STATUSES:
            return "terminal"
        if status == "success":
            return "success"
        if result.get("ok") is False or result.get("found") is False:
            return "terminal"
    return "success"
