from __future__ import annotations

from typing import Any

from gumi.contracts.agent_spec import AgentSpec
from gumi.contracts.enums import CouncilRoleName, OutputMode
from gumi.contracts.model import LLMRequest
from gumi.contracts.runtime_state import Plan, Step

_PLANNER_PROMPT = """Eres el planificador de un agente. Dado el OBJETIVO y las TOOLS disponibles, decide que tools ejecutar y en que orden.

REGLAS IMPORTANTES:
- Si el OBJETIVO necesita datos reales (informacion del usuario o paciente, signos vitales, presion, consultas, diagnosticos, recetas, citas, medicos, busquedas o calculos), DEBES incluir en el plan la tool que obtiene ese dato. NUNCA respondas de memoria ni afirmes que "no hay datos" sin haber ejecutado antes una tool que los consulte.
- Usa SOLO tools de la lista y copia su nombre EXACTO. No inventes tools ni argumentos.
- Los identificadores del propio usuario (por ejemplo patient_id) los completa el sistema automaticamente: si una tool los pide, pon el valor que conozcas o "me".
- Encadena varios pasos cuando haga falta (por ejemplo: primero listar opciones, luego actuar sobre una).
- Solo si de verdad ningun dato externo hace falta, devuelve {"steps": []}.

OBJETIVO:
{goal}

TOOLS DISPONIBLES (nombre: descripcion):
{tools}

ENTIDADES DE DATOS DISPONIBLES:
{entities}
{error}
Devuelve UNICAMENTE JSON valido, sin texto extra, con esta forma exacta:
{"steps": [{"action": "<que hace este paso>", "tool": "<nombre exacto de la lista>", "input": {"<arg>": "<valor>"}}]}"""


class RuntimePlanner:
    def __init__(self, router: Any, spec: AgentSpec, model_id: str, tool_lines: str = "", entity_lines: str = "") -> None:
        self._router = router
        self._spec = spec
        self._model_id = model_id
        self._tools = tool_lines
        self._entities = entity_lines

    async def plan(self, goal: str, last_error: str = "") -> Plan:
        error_block = f"\nEl intento anterior fallo: {last_error}. Corrige el plan.\n" if last_error else ""
        prompt = (
            _PLANNER_PROMPT.replace("{goal}", goal)
            .replace("{tools}", self._tools)
            .replace("{entities}", self._entities)
            .replace("{error}", error_block)
        )
        response = await self._router.call(
            LLMRequest(
                model_id=self._model_id,
                role=CouncilRoleName.SCOUT,
                messages=[{"role": "user", "content": prompt}],
                output_mode=OutputMode.JSON,
            )
        )
        data = response.parsed or {}
        steps = []
        for index, raw in enumerate(data.get("steps", []) or []):
            if not isinstance(raw, dict):
                continue
            payload = raw.get("input", {})
            steps.append(
                Step(
                    step_id=f"s{index + 1}",
                    action=str(raw.get("action", "")),
                    tool=str(raw.get("tool", "")),
                    input=payload if isinstance(payload, dict) else {},
                )
            )
        return Plan(goal=goal, steps=steps)
