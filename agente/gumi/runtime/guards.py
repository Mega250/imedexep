from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Any, Optional

from gumi.contracts.enums import CouncilRoleName, OutputMode
from gumi.contracts.model import LLMRequest
from gumi.runtime.state import RunState

_ANAPHORA_PROMPT = """Eres un reformulador de consultas en espanol. Si el MENSAJE ACTUAL depende del turno anterior para entenderse (referencia anaforica: lo, la, le, ese, esa, su, sus, o una orden corta que reutiliza el verbo anterior), reescribelo de forma autocontenida usando el referente del TURNO ANTERIOR. Si ya se entiende solo, dejalo identico.

TURNO ANTERIOR:
{prev}

MENSAJE ACTUAL:
{current}

Devuelve UNICAMENTE JSON valido: {"tiene_anafora": true, "reformulado": "<mensaje autocontenido o identico>"}"""

_CONTEXT_PROMPT = """Decide si la PREGUNTA ACTUAL se puede responder por completo con lo que YA aparece TEXTUALMENTE en el HISTORIAL (modo recordar), o si hay que ejecutar tools (modo consultar).

Reglas estrictas:
- Cualquier peticion de PRODUCIR, CREAR, MODIFICAR, EJECUTAR o CALCULAR algo = consultar.
- Si piden un DATO ESPECIFICO (correo, telefono, fecha, monto, direccion, identificador, cantidad) que NO aparece textualmente en el historial = consultar.
- recordar SOLO si la respuesta exacta ya fue mostrada literalmente en el historial.
- Ante cualquier duda = consultar.

HISTORIAL:
{history}

PREGUNTA ACTUAL:
{current}

Devuelve UNICAMENTE JSON valido: {"modo": "recordar", "suficiente": true, "respuesta": "<solo si recordar, copiada literal del historial>"}"""


def _cosine(a: list[float], b: list[float]) -> float:
    numerator = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    return numerator / (norm_a * norm_b) if norm_a and norm_b else 0.0


def _lexical_ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def _significant(text: str) -> list[str]:
    return [word for word in re.findall(r"\w+", text.lower()) if len(word) > 3]


def _grounded(answer: str, history_text: str, min_ratio: float) -> bool:
    words = _significant(answer)
    if not words:
        return False
    history = history_text.lower()
    hits = sum(1 for word in words if word in history)
    return hits / len(words) >= min_ratio


class AnaphoraResolver:
    name = "anaphora_resolver"

    def __init__(
        self,
        router: Any,
        model_id: str,
        embedder: Optional[Any] = None,
        short_threshold: float = 0.35,
        long_threshold: float = 0.55,
    ) -> None:
        self._router = router
        self._model_id = model_id
        self._embedder = embedder
        self._short = short_threshold
        self._long = long_threshold

    async def _similarity(self, a: str, b: str) -> float:
        if self._embedder is not None:
            try:
                vectors = await self._embedder.embed([a, b])
                if len(vectors) == 2:
                    return _cosine(vectors[0], vectors[1])
            except Exception:
                pass
        return _lexical_ratio(a, b)

    async def run(self, state: RunState) -> None:
        if not state.history:
            return
        prev = state.history[-1]
        prompt = _ANAPHORA_PROMPT.replace("{prev}", f"{prev.get('role', '?')}: {prev.get('content', '')}").replace("{current}", state.user_input)
        response = await self._router.call(
            LLMRequest(model_id=self._model_id, role=CouncilRoleName.SCOUT, messages=[{"role": "user", "content": prompt}], output_mode=OutputMode.JSON)
        )
        data = response.parsed or {}
        reformulado = str(data.get("reformulado") or "").strip()
        if not (data.get("tiene_anafora") and reformulado) or reformulado.lower() == state.user_input.strip().lower():
            return
        similarity = await self._similarity(state.user_input, reformulado)
        threshold = self._short if len(state.user_input.split()) <= 5 else self._long
        if similarity >= threshold:
            state.resolved_input = reformulado
            state.trace.append("anaphora:resolved")
        else:
            state.trace.append("anaphora:rejected_low_sim")


class ContextCheck:
    name = "context_check"

    def __init__(self, router: Any, model_id: str, min_grounding: float = 0.5) -> None:
        self._router = router
        self._model_id = model_id
        self._min_grounding = min_grounding

    async def run(self, state: RunState) -> None:
        if not state.history:
            return
        history_block = "\n".join(f"{message.get('role', '?')}: {message.get('content', '')}" for message in state.history[-6:])
        current = state.resolved_input or state.user_input
        prompt = _CONTEXT_PROMPT.replace("{history}", history_block).replace("{current}", current)
        response = await self._router.call(
            LLMRequest(model_id=self._model_id, role=CouncilRoleName.SCOUT, messages=[{"role": "user", "content": prompt}], output_mode=OutputMode.JSON)
        )
        data = response.parsed or {}
        respuesta = str(data.get("respuesta") or "").strip()
        if not (data.get("modo") == "recordar" and data.get("suficiente") and respuesta):
            return
        if _grounded(respuesta, history_block, self._min_grounding):
            state.answer = respuesta
            state.short_circuit = True
            state.trace.append("context_check:short_circuit")
        else:
            state.trace.append("context_check:rejected_ungrounded")
