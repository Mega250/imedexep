from __future__ import annotations

from typing import Protocol, runtime_checkable

from gumi.contracts.model import (
    BehaviorProfile,
    EmbeddingProfile,
    LLMRequest,
    LLMResponse,
    ModelProfile,
    SamplingParams,
)


@runtime_checkable
class LLMAdapter(Protocol):
    async def generate(self, request: LLMRequest, sampling: SamplingParams) -> LLMResponse: ...


@runtime_checkable
class ModelTierResolver(Protocol):
    async def resolve(self, model_id: str) -> ModelProfile: ...


@runtime_checkable
class ParameterMapper(Protocol):
    def map(self, profile: BehaviorProfile, family: str, role: str, model_profile: ModelProfile) -> SamplingParams: ...


@runtime_checkable
class ModelRouter(Protocol):
    async def call(self, request: LLMRequest) -> LLMResponse: ...


@runtime_checkable
class EmbeddingProvider(Protocol):
    @property
    def profile(self) -> EmbeddingProfile: ...

    @property
    def dimension(self) -> int: ...

    async def embed(self, texts: list[str]) -> list[list[float]]: ...
