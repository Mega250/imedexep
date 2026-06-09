from __future__ import annotations

import json
import re
from typing import Optional, Tuple, Type

from pydantic import BaseModel, ValidationError

_FENCE = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL)


def strip_fences(text: str) -> str:
    match = _FENCE.search(text)
    return match.group(1).strip() if match else text.strip()


def extract_json(text: str) -> Optional[dict]:
    candidate = strip_fences(text)
    try:
        obj = json.loads(candidate)
        return obj if isinstance(obj, dict) else None
    except Exception:
        pass
    start = candidate.find("{")
    end = candidate.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            obj = json.loads(candidate[start : end + 1])
            return obj if isinstance(obj, dict) else None
        except Exception:
            return None
    return None


def coerce(obj: dict, model_cls: Type[BaseModel]) -> Tuple[Optional[BaseModel], Optional[str]]:
    try:
        return model_cls.model_validate(obj), None
    except ValidationError as exc:
        return None, str(exc)
