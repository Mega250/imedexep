from __future__ import annotations

from typing import Any

import httpx

from gumi.contracts.enums import OutputMode
from gumi.contracts.model import LLMRequest, LLMResponse, SamplingParams
from gumi.model.usage import collect_response_usage


class OllamaAdapter:
    def __init__(self, base_url: str, timeout: float = 120.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    async def generate(self, request: LLMRequest, sampling: SamplingParams) -> LLMResponse:
        options: dict[str, Any] = {"temperature": sampling.temperature, "top_p": sampling.top_p}
        if sampling.top_k is not None:
            options["top_k"] = sampling.top_k
        if sampling.repetition_penalty is not None:
            options["repeat_penalty"] = sampling.repetition_penalty
        if sampling.max_tokens is not None:
            options["num_predict"] = sampling.max_tokens
        payload: dict[str, Any] = {
            "model": request.model_id,
            "messages": request.messages,
            "stream": False,
            "options": options,
        }
        if request.output_mode in (OutputMode.JSON, OutputMode.STRICT_JSON):
            payload["format"] = "json"
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            resp = await client.post(f"{self._base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
        content = (data.get("message") or {}).get("content", "")
        usage = collect_response_usage(resp.headers, data)
        return LLMResponse(model_id=request.model_id, role=request.role, content=content, usage=usage)
