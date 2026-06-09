from __future__ import annotations

from typing import Any


def filter_response(data: Any, fields: list[str]) -> Any:
    if not fields:
        return data
    allowed = set(fields)
    if isinstance(data, dict):
        return {key: value for key, value in data.items() if key in allowed}
    if isinstance(data, list):
        return [
            {key: value for key, value in item.items() if key in allowed} if isinstance(item, dict) else item
            for item in data
        ]
    return data
