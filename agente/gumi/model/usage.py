from __future__ import annotations

from typing import Any, Mapping

_HEADER_HINTS = ("ratelimit", "rate-limit", "retry-after", "credit", "remaining", "x-quota")


def collect_response_usage(headers: Mapping[str, str], data: Any) -> dict[str, Any]:
    usage: dict[str, Any] = {}
    for key, value in headers.items():
        lowered = key.lower()
        if any(hint in lowered for hint in _HEADER_HINTS):
            usage[lowered] = value
    if isinstance(data, dict) and isinstance(data.get("usage"), dict):
        usage["tokens"] = data["usage"]
    return usage
