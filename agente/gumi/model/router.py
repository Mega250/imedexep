from __future__ import annotations

import os
from typing import Callable, Optional

from gumi.contracts.enums import OutputMode
from gumi.contracts.model import LLMRequest, LLMResponse, SamplingParams
from gumi.interfaces.model import LLMAdapter
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.model import json_io
from gumi.model.adapters.ollama import OllamaAdapter
from gumi.model.adapters.openai_compat import OpenAICompatAdapter
from gumi.model.parameter_mapper import ParameterMapper
from gumi.model.prober import ModelProber
from gumi.model.rate_budget import RateBudget
from gumi.model.role_resolver import RoleResolver
from gumi.model.tier_resolver import TierResolver

AdapterFactory = Callable[[str, dict], LLMAdapter]

_REPAIR_INSTRUCTION = (
    "Tu salida anterior no fue JSON valido. No expliques, no agregues markdown. "
    "Devuelve unicamente JSON valido que cumpla este schema: {schema}. Salida anterior: {bad}"
)


class RateBudgetExceeded(Exception):
    def __init__(self, model_id: str) -> None:
        self.model_id = model_id
        super().__init__(f"Rate budget exhausted for model '{model_id}'")


def default_adapter_factory(provider: str, cfg: dict) -> LLMAdapter:
    provider_type = cfg.get("type", "openai_compat")
    base_url = os.getenv(cfg.get("base_url_env", ""), "") or cfg.get("default_base_url", "")
    if provider_type == "ollama":
        return OllamaAdapter(base_url or "http://localhost:11434")
    api_key_env = cfg.get("api_key_env")
    api_key = os.getenv(api_key_env, "") if api_key_env else None
    return OpenAICompatAdapter(base_url, api_key or None)


class GumiModelRouter:
    def __init__(
        self,
        registry: Optional[ManifestRegistry] = None,
        adapter_factory: Optional[AdapterFactory] = None,
        prober: Optional[ModelProber] = None,
        budget: Optional[RateBudget] = None,
    ) -> None:
        self._registry = registry or ManifestRegistry()
        self._tier = TierResolver(self._registry, prober)
        self._roles = RoleResolver(self._registry)
        self._mapper = ParameterMapper(self._registry)
        self._budget = budget or RateBudget(self._registry)
        self._providers = self._registry.providers().providers
        self._adapter_factory = adapter_factory or default_adapter_factory
        self._max_retries = int(self._registry.tier_policy().local_mode_defaults.get("max_json_retries", 2))

    @property
    def budget(self) -> RateBudget:
        return self._budget

    async def call(self, request: LLMRequest) -> LLMResponse:
        if not self._budget.can_call(model_id=request.model_id):
            raise RateBudgetExceeded(request.model_id)
        profile = await self._tier.resolve(request.model_id)
        sampling = request.sampling or self._mapper.map(
            self._roles.behavior_profile(request.role.value),
            profile.family,
            request.role.value,
            profile,
        )
        sampling = sampling.model_copy(update={"native_json_format": profile.supports.json_mode})
        adapter = self._adapter_factory(profile.provider, self._providers.get(profile.provider, {}))
        self._budget.record(model_id=request.model_id)
        response = await adapter.generate(request, sampling)
        if request.output_mode in (OutputMode.JSON, OutputMode.STRICT_JSON):
            return await self._ensure_json(response, request, sampling, adapter)
        return response

    async def _ensure_json(
        self,
        response: LLMResponse,
        request: LLMRequest,
        sampling: SamplingParams,
        adapter: LLMAdapter,
    ) -> LLMResponse:
        parsed = json_io.extract_json(response.content)
        if parsed is not None:
            response.parsed = parsed
            response.valid = True
            return response
        repair_sampling = sampling.model_copy(update={"temperature": 0.0})
        last = response
        for _ in range(self._max_retries):
            repair_request = request.model_copy(
                update={
                    "messages": request.messages
                    + [
                        {
                            "role": "user",
                            "content": _REPAIR_INSTRUCTION.format(
                                schema=request.output_schema or {},
                                bad=last.content[:2000],
                            ),
                        }
                    ]
                }
            )
            repaired = await adapter.generate(repair_request, repair_sampling)
            parsed = json_io.extract_json(repaired.content)
            if parsed is not None:
                repaired.parsed = parsed
                repaired.valid = True
                repaired.repaired = True
                return repaired
            last = repaired
        last.valid = False
        last.repaired = True
        last.error = "invalid_json_after_repair"
        return last
