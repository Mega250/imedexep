from __future__ import annotations

from gumi.contracts.enums import StepStatus
from gumi.contracts.runtime_state import Observation, Step
from gumi.interfaces.dispatch import ToolDispatcher


class StepExecutor:
    def __init__(self, dispatcher: ToolDispatcher) -> None:
        self._dispatcher = dispatcher

    async def execute(self, step: Step) -> Observation:
        result = await self._dispatcher.execute(step.tool, step.input)
        outcome = str(result.get("outcome", "success"))
        ok = bool(result.get("ok", True)) and outcome == "success"
        status = StepStatus.SUCCESS if ok else StepStatus.ERROR
        error = None if ok else str(result.get("error") or result.get("status") or "tool failed")
        return Observation(step_id=step.step_id, status=status, data=result, error=error)
