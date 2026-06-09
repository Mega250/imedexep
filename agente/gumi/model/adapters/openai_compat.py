from __future__ import annotations

from typing import Any, Optional

import httpx

from gumi.contracts.enums import OutputMode
from gumi.contracts.model import LLMRequest, LLMResponse, SamplingParams
from gumi.model.usage import collect_response_usage


class OpenAICompatAdapter:
    def __init__(self, base_url: str, api_key: Optional[str] = None, timeout: float = 120.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._timeout = timeout

    async def generate(self, request: LLMRequest, sampling: SamplingParams) -> LLMResponse:
        payload: dict[str, Any] = {
            "model": request.model_id,
            "messages": request.messages,
            "temperature": sampling.temperature,
            "top_p": sampling.top_p,
        }
        if sampling.max_tokens is not None:
            payload["max_tokens"] = sampling.max_tokens
        if sampling.frequency_penalty is not None:
            payload["frequency_penalty"] = sampling.frequency_penalty
        if sampling.presence_penalty is not None:
            payload["presence_penalty"] = sampling.presence_penalty
        if request.output_mode in (OutputMode.JSON, OutputMode.STRICT_JSON) and sampling.native_json_format:
            payload["response_format"] = {"type": "json_object"}
        headers: dict[str, str] = {}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            resp = await client.post(f"{self._base_url}/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        content = data["choices"][0]["message"]["content"]
        usage = collect_response_usage(resp.headers, data)
        return LLMResponse(model_id=request.model_id, role=request.role, content=content, usage=usage)
