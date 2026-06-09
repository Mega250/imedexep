from __future__ import annotations

from gumi.contracts.enums import ResultQuality, StepStatus
from gumi.contracts.runtime_state import Observation, Step, StepEvaluation


class StepEvaluator:
    def evaluate(self, step: Step, observation: Observation) -> StepEvaluation:
        if observation.status == StepStatus.SUCCESS:
            return StepEvaluation(step_id=step.step_id, result_quality=ResultQuality.GOOD, should_continue=True, needs_replan=False, reason="ok")
        outcome = str((observation.data or {}).get("outcome", "terminal"))
        if outcome == "transient":
            return StepEvaluation(
                step_id=step.step_id,
                result_quality=ResultQuality.POOR,
                should_continue=True,
                needs_replan=True,
                reason=observation.error or "transient error",
            )
        return StepEvaluation(
            step_id=step.step_id,
            result_quality=ResultQuality.POOR,
            should_continue=False,
            needs_replan=False,
            reason=observation.error or "terminal error",
        )
