from __future__ import annotations

import re
from typing import Optional

import httpx

from gumi.config.settings import settings


class ModelProber:
    def __init__(self, base_url: Optional[str] = None, timeout: float = 3.0) -> None:
        self._base_url = (base_url or settings.BASE_URL).rstrip("/")
        self._timeout = timeout

    async def probe(self, model_id: str) -> Optional[float]:
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                resp = await client.post(f"{self._base_url}/api/show", json={"name": model_id})
                resp.raise_for_status()
                data = resp.json()
        except Exception:
            return None
        return extract_param_count_b(data)


def extract_param_count_b(data: dict) -> Optional[float]:
    if not isinstance(data, dict):
        return None
    details = data.get("details") if isinstance(data.get("details"), dict) else {}
    raw = details.get("parameter_size") or data.get("parameter_size")
    if not raw:
        return None
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*([BMK]?)", str(raw).upper())
    if not match:
        return None
    value = float(match.group(1))
    unit = match.group(2)
    if unit == "M":
        return value / 1000.0
    if unit == "K":
        return value / 1_000_000.0
    return value
