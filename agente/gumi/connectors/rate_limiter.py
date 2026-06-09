from __future__ import annotations

import time
from typing import Callable, Optional


class RateLimiter:
    def __init__(self, now_fn: Optional[Callable[[], float]] = None) -> None:
        self._now = now_fn or time.monotonic
        self._calls: dict[str, list[float]] = {}

    def allow(self, key: str, per_minute: int) -> bool:
        if per_minute <= 0:
            return True
        window_start = self._now() - 60.0
        bucket = [moment for moment in self._calls.get(key, []) if moment >= window_start]
        self._calls[key] = bucket
        return len(bucket) < per_minute

    def record(self, key: str) -> None:
        self._calls.setdefault(key, []).append(self._now())
