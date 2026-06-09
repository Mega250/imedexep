from __future__ import annotations

import inspect
import json
from typing import Any, Optional

from gumi.contracts.enums import CouncilRoleName, OutputMode
from gumi.contracts.model import LLMRequest
from gumi.contracts.runtime_state import Step
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.runtime.tool_registry import ToolRegistry

_PROMPT = """Vas a llamar una tool para cumplir un objetivo. Determina los ARGUMENTOS finales correctos.

OBJETIVO:
{goal}

TOOL: {tool}
QUE HACE: {use_when}
PARAMETROS QUE RECIBE (nombre: obligatorio): {params}
ARGUMENTOS PROPUESTOS (pueden estar incompletos o equivocados): {current}

Reglas: usa SOLO estos parametros; deriva cada valor del objetivo con un valor concreto; una tasa o porcentaje exprasala como la fraccion decimal que la tool espera (16% -> 0.16); si un argumento propuesto contradice el objetivo, corrigelo.

Devuelve UNICAMENTE JSON valido con esta forma: {"args": {"<parametro>": <valor>}}"""


class ArgResolver:
    def __init__(self, router: Any, model_id: str, registry: Optional[ManifestRegistry] = None) -> None:
        registry = registry or ManifestRegistry()
        self._router = router
        self._model_id = model_id
        self._tools = ToolRegistry(registry)
        self._functions = registry.toolpack_catalog().functions

    def _params(self, tool_name: str) -> tuple[Optional[str], list[tuple[str, bool]]]:
        canonical = self._tools.resolve(tool_name)
        if canonical is None:
            return None, []
        function = self._tools.load_function(canonical)
        entry = self._functions.get(canonical)
        injected = set(entry.injected_keys) if entry is not None else set()
        if function is None:
            return canonical, []
        try:
            signature = inspect.signature(function)
        except (TypeError, ValueError):
            return canonical, []
        params: list[tuple[str, bool]] = []
        for name, parameter in signature.parameters.items():
            if name in injected or parameter.kind in (inspect.Parameter.VAR_KEYWORD, inspect.Parameter.VAR_POSITIONAL):
                continue
            params.append((name, parameter.default is inspect.Parameter.empty))
        return canonical, params

    async def resolve(self, step: Step, goal: str) -> Step:
        canonical, params = self._params(step.tool)
        if not params:
            return step
        current = {key: value for key, value in (step.input or {}).items()}
        entry = self._functions.get(canonical) if canonical else None
        use_when = entry.card.use_when if entry is not None else ""
        prompt = (
            _PROMPT.replace("{goal}", goal)
            .replace("{tool}", canonical or step.tool)
            .replace("{use_when}", use_when)
            .replace("{params}", ", ".join(f"{name}: {'si' if required else 'no'}" for name, required in params))
            .replace("{current}", json.dumps(current, ensure_ascii=False))
        )
        try:
            response = await self._router.call(
                LLMRequest(
                    model_id=self._model_id,
                    role=CouncilRoleName.SCOUT,
                    messages=[{"role": "user", "content": prompt}],
                    output_mode=OutputMode.JSON,
                )
            )
            data = response.parsed or {}
        except Exception:
            return step
        filled = data.get("args")
        if not isinstance(filled, dict) or not filled:
            return step
        allowed = {name for name, _ in params}
        merged = dict(current)
        for key, value in filled.items():
            if key in allowed and value is not None:
                merged[key] = value
        return step.model_copy(update={"input": merged})
