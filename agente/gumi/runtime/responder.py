from __future__ import annotations

import json
from typing import Any

from gumi.contracts.enums import CouncilRoleName, OutputMode
from gumi.contracts.model import LLMRequest

_RESPONDER_PROMPT = """Eres el asistente que responde al usuario. Basa tu respuesta UNICAMENTE en los DATOS de las observaciones de las tools. No inventes datos, numeros ni nombres.

PREGUNTA:
{goal}

OBSERVACIONES (resultados de las tools):
{observations}

INSTRUCCIONES:
- Si una observacion muestra una accion exitosa (ok=true o http_status 200/201: se creo, agendo, actualizo, cancelo o registro algo), CONFIRMA al usuario que se realizo y menciona los detalles relevantes (fecha, doctor, identificador, valores).
- Si las observaciones traen datos consultados, resumelos de forma clara y util.
- Si una observacion indica un error o no trae la informacion, dilo con claridad y sugiere el siguiente paso.
- NUNCA devuelvas una respuesta vacia.

Responde en {language}, breve y claro, solo con lo que aparece en las observaciones."""


class Responder:
    def __init__(self, router: Any, model_id: str, language: str = "es") -> None:
        self._router = router
        self._model_id = model_id
        self._language = language

    async def respond(self, goal: str, observations: list) -> str:
        block = json.dumps([observation.data for observation in observations], ensure_ascii=False)[:6000]
        prompt = _RESPONDER_PROMPT.replace("{goal}", goal).replace("{observations}", block).replace("{language}", self._language)
        response = await self._router.call(
            LLMRequest(
                model_id=self._model_id,
                role=CouncilRoleName.SCOUT,
                messages=[{"role": "user", "content": prompt}],
                output_mode=OutputMode.TEXT,
            )
        )
        return response.content.strip()
