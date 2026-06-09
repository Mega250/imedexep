from __future__ import annotations

import os
import time
from typing import Callable, Optional, Tuple

from gumi.manifest_loader.registry import ManifestRegistry


class RateBudget:
    def __init__(self, registry: Optional[ManifestRegistry] = None, now_fn: Optional[Callable[[], float]] = None) -> None:
        self._registry = registry or ManifestRegistry()
        models = self._registry.models()
        self._models = models.models
        self._rate = models.rate
        self._providers = self._registry.providers().providers
        self._now = now_fn or time.monotonic
        self._calls: dict[str, list[float]] = {}
        self._lifetime: dict[str, int] = {}

    def _multiplier(self) -> int:
        env = self._rate.get("multiplier_env", "GUMI_RATE_MULTIPLIER")
        raw = os.getenv(env, "")
        if raw.isdigit():
            return int(raw)
        return int(self._rate.get("default_multiplier", 1))

    def _default_window_seconds(self) -> float:
        return float(self._rate.get("window_hours", 5)) * 3600.0

    def _window_seconds(self, spec: dict) -> float:
        if "window_seconds" in spec:
            return float(spec["window_seconds"])
        if "window_minutes" in spec:
            return float(spec["window_minutes"]) * 60.0
        if "window_hours" in spec:
            return float(spec["window_hours"]) * 3600.0
        return self._default_window_seconds()

    def _parse_limit(self, spec: dict) -> Optional[Tuple[int, float]]:
        max_calls = int(spec.get("max", 0))
        if max_calls <= 0:
            return None
        return max_calls * self._multiplier(), self._window_seconds(spec)

    def _model_limit(self, model_id: str) -> Optional[Tuple[int, float]]:
        entry = self._models.get(model_id)
        if entry is None:
            return None
        if entry.rate_limit:
            return self._parse_limit(entry.rate_limit)
        if entry.requests_per_5h is not None:
            return entry.requests_per_5h * self._multiplier(), self._default_window_seconds()
        return None

    def _provider_limit(self, provider: str) -> Optional[Tuple[int, float]]:
        cfg = self._providers.get(provider, {})
        spec = cfg.get("rate_limit")
        return self._parse_limit(spec) if isinstance(spec, dict) else None

    def _provider_of(self, model_id: str) -> Optional[str]:
        entry = self._models.get(model_id)
        return entry.provider if entry else None

    def _buckets(self, model_id: Optional[str], provider: Optional[str]) -> list[Tuple[str, Tuple[int, float]]]:
        out: list[Tuple[str, Tuple[int, float]]] = []
        resolved_provider = provider or (self._provider_of(model_id) if model_id else None)
        if model_id:
            model_limit = self._model_limit(model_id)
            if model_limit:
                out.append((f"model:{model_id}", model_limit))
        if resolved_provider:
            provider_limit = self._provider_limit(resolved_provider)
            if provider_limit:
                out.append((f"provider:{resolved_provider}", provider_limit))
        return out

    def record(self, model_id: Optional[str] = None, provider: Optional[str] = None) -> None:
        resolved_provider = provider or (self._provider_of(model_id) if model_id else None)
        if model_id:
            key = f"model:{model_id}"
            self._lifetime[key] = self._lifetime.get(key, 0) + 1
        if resolved_provider:
            key = f"provider:{resolved_provider}"
            self._lifetime[key] = self._lifetime.get(key, 0) + 1
        for bucket, _limit in self._buckets(model_id, provider):
            self._calls.setdefault(bucket, []).append(self._now())

    def _used(self, bucket: str, window_seconds: float) -> int:
        now = self._now()
        self._calls[bucket] = [t for t in self._calls.get(bucket, []) if now - t <= window_seconds]
        return len(self._calls[bucket])

    def budget_for(self, model_id: Optional[str] = None, provider: Optional[str] = None) -> Optional[int]:
        buckets = self._buckets(model_id, provider)
        if not buckets:
            return None
        return min(limit for _bucket, (limit, _window) in buckets)

    def remaining(self, model_id: Optional[str] = None, provider: Optional[str] = None) -> Optional[int]:
        buckets = self._buckets(model_id, provider)
        if not buckets:
            return None
        return min(max(0, limit - self._used(bucket, window)) for bucket, (limit, window) in buckets)

    def can_call(self, model_id: Optional[str] = None, provider: Optional[str] = None) -> bool:
        remaining = self.remaining(model_id, provider)
        return remaining is None or remaining > 0

    def report(self) -> dict:
        models_out: dict[str, dict] = {}
        for model_id in self._models:
            limit = self._model_limit(model_id)
            lifetime = self._lifetime.get(f"model:{model_id}", 0)
            if limit or lifetime:
                models_out[model_id] = {
                    "limit": limit[0] if limit else None,
                    "window_remaining": self.remaining(model_id=model_id),
                    "lifetime_requests": lifetime,
                }
        providers_out: dict[str, dict] = {}
        for provider, cfg in self._providers.items():
            provider_limit = self._provider_limit(provider)
            lifetime = self._lifetime.get(f"provider:{provider}", 0)
            credits_total = cfg.get("credits_total")
            if not (provider_limit or lifetime or credits_total is not None):
                continue
            entry: dict = {
                "limit": provider_limit[0] if provider_limit else None,
                "window_remaining": self.remaining(provider=provider),
                "lifetime_requests": lifetime,
            }
            if credits_total is not None:
                entry["credits_total"] = int(credits_total)
                entry["credits_remaining_estimate"] = max(0, int(credits_total) - lifetime)
            providers_out[provider] = entry
        return {"models": models_out, "providers": providers_out}
