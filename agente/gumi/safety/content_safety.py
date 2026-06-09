from __future__ import annotations

import os
from typing import Any, Optional, Protocol

import httpx

from gumi.contracts.enums import SafetyLabel
from gumi.contracts.model import ContentSafetyVerdict
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.model.rate_budget import RateBudget


class ModeratorTransport(Protocol):
    async def complete(self, prompt: str, response: Optional[str], image: Optional[str]) -> str: ...


def parse_verdict(raw: str, model_id: str) -> ContentSafetyVerdict:
    user = SafetyLabel.SAFE
    response_safety: Optional[SafetyLabel] = None
    categories: list[str] = []
    for line in raw.splitlines():
        lowered = line.lower()
        if lowered.startswith("user safety:"):
            user = SafetyLabel.UNSAFE if "unsafe" in lowered else SafetyLabel.SAFE
        elif lowered.startswith("response safety:"):
            response_safety = SafetyLabel.UNSAFE if "unsafe" in lowered else SafetyLabel.SAFE
        elif lowered.startswith("safety categories:"):
            categories = [part.strip() for part in line.split(":", 1)[1].split(",") if part.strip()]
    return ContentSafetyVerdict(
        user_safety=user,
        response_safety=response_safety,
        categories=categories,
        moderated_by=model_id,
    )


class NvidiaModeratorTransport:
    def __init__(self, base_url: str, api_key: Optional[str], model_id: str, timeout: float = 30.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._model = model_id
        self._timeout = timeout

    async def complete(self, prompt: str, response: Optional[str], image: Optional[str]) -> str:
        content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
        if image:
            content.insert(0, {"type": "image_url", "image_url": {"url": image}})
        messages: list[dict[str, Any]] = [{"role": "user", "content": content}]
        if response:
            messages.append({"role": "assistant", "content": [{"type": "text", "text": response}]})
        payload: dict[str, Any] = {
            "model": self._model,
            "messages": messages,
            "temperature": 0.01,
            "max_tokens": 100,
            "extra_body": {"chat_template_kwargs": {"request_categories": "/categories"}},
        }
        headers = {"Authorization": f"Bearer {self._api_key}"} if self._api_key else {}
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            resp = await client.post(f"{self._base_url}/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        return data["choices"][0]["message"]["content"]


class NemotronContentModerator:
    def __init__(
        self,
        registry: Optional[ManifestRegistry] = None,
        transport: Optional[ModeratorTransport] = None,
        budget: Optional[RateBudget] = None,
    ) -> None:
        registry = registry or ManifestRegistry()
        self._cfg = registry.content_safety()
        self._budget = budget or RateBudget(registry)
        self._provider = self._cfg.provider
        if transport is not None:
            self._transport: ModeratorTransport = transport
        else:
            provider_cfg = registry.providers().providers.get(self._provider, {})
            base_url = os.getenv(provider_cfg.get("base_url_env", ""), "") or provider_cfg.get("default_base_url", "")
            api_key = os.getenv(getattr(self._cfg, "api_key_env", "") or "", "") or None
            self._transport = NvidiaModeratorTransport(base_url, api_key, self._cfg.model_id)

    async def moderate(
        self,
        prompt: str,
        response: Optional[str] = None,
        image: Optional[str] = None,
    ) -> ContentSafetyVerdict:
        if not self._cfg.enabled:
            return ContentSafetyVerdict(user_safety=SafetyLabel.SAFE, moderated_by="disabled")
        self._budget.record(provider=self._provider)
        raw = await self._transport.complete(prompt, response, image)
        return parse_verdict(raw, self._cfg.model_id)
