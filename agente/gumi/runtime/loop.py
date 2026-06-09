from __future__ import annotations

from typing import Any, Optional

from gumi.contracts.agent_spec import AgentSpec
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.model.router import GumiModelRouter
from gumi.model.tier_resolver import TierResolver
from gumi.runtime.arg_resolver import ArgResolver
from gumi.runtime.dispatcher import ToolDispatcherImpl
from gumi.runtime.executor import StepExecutor
from gumi.runtime.guards import AnaphoraResolver, ContextCheck
from gumi.runtime.plan_validator import PlanValidator
from gumi.runtime.planner import RuntimePlanner
from gumi.runtime.responder import Responder
from gumi.runtime.state import RunState
from gumi.runtime.step_evaluator import StepEvaluator


def _tool_lines(dispatcher: ToolDispatcherImpl, spec: AgentSpec) -> str:
    granted = {tool.tool_id for tool in spec.tools} | {tool.name for tool in spec.tools} | dispatcher.exposed_tool_ids
    definitions = dispatcher.tool_definitions
    if granted:
        definitions = [definition for definition in definitions if definition["name"] in granted]
    lines = []
    for definition in definitions:
        inputs = definition.get("inputs") or []
        args = f" (args: {', '.join(map(str, inputs))})" if inputs else ""
        lines.append(f"- {definition['name']}{args}: {definition['description']}")
    return "\n".join(lines)


def _entity_lines(context: dict) -> str:
    manifest = context.get("manifest")
    if manifest is None:
        return "(sin manifest de datos)"
    return "\n".join(f"- {name} (campos: {', '.join(entity.fields)})" for name, entity in manifest.entities.items())


class AgentRuntimeLoop:
    def __init__(
        self,
        registry: Optional[ManifestRegistry] = None,
        router: Optional[Any] = None,
        tier_resolver: Optional[TierResolver] = None,
        embedder: Optional[Any] = None,
    ) -> None:
        self._registry = registry or ManifestRegistry()
        self._router = router or GumiModelRouter(self._registry)
        self._tier = tier_resolver or TierResolver(self._registry)
        self._embedder = embedder
        self._flows = self._registry.runtime_flows()
        self._guards = self._registry.small_model_guards().defaults

    async def run(
        self,
        spec: AgentSpec,
        goal: str,
        model_id: str,
        context: Optional[dict] = None,
        tier_override: Optional[str] = None,
        history: Optional[list] = None,
        emit: Optional[Any] = None,
    ) -> dict:
        async def _emit(kind: str, **data: Any) -> None:
            if emit is not None:
                await emit({"type": kind, **data})

        tier = tier_override or (await self._tier.resolve(model_id)).tier.value
        flow = self._flows.flows.get(tier) or self._flows.flows.get("frontier") or {}
        context = context or {}
        state = RunState(
            goal=goal,
            user_input=goal,
            tier=tier,
            model_id=model_id,
            max_retries=int(self._guards.get("max_retries", 2)),
            context=context,
            history=history or [],
        )

        dispatcher = ToolDispatcherImpl(self._registry, context=context, agent_spec=spec)
        executor = StepExecutor(dispatcher)
        arg_resolver = ArgResolver(self._router, model_id, self._registry) if flow.get("resolve_args") else None
        planner = RuntimePlanner(self._router, spec, model_id, _tool_lines(dispatcher, spec), _entity_lines(context))
        validator = PlanValidator(self._registry, int(self._guards.get("fuzzy_tool_name_min_ratio", 88)))
        evaluator = StepEvaluator()
        responder = Responder(self._router, model_id, spec.language or "es")
        guard_nodes = {
            "anaphora_resolver": AnaphoraResolver(
                self._router,
                model_id,
                self._embedder,
                float(self._guards.get("reformulate_min_sim_short", 0.35)),
                float(self._guards.get("reformulate_min_sim_long", 0.55)),
            ),
            "context_check": ContextCheck(self._router, model_id, float(self._guards.get("context_min_grounding", 0.5))),
        }

        for node_name in flow.get("pre", []):
            node = guard_nodes.get(node_name)
            if node is None:
                continue
            await node.run(state)
            state.trace.append(node_name)
            if state.short_circuit:
                break

        if not state.short_circuit:
            goal_text = state.resolved_input or state.goal
            while not state.done and state.retries <= state.max_retries:
                await _emit("status", stage="planificando")
                state.plan = await planner.plan(goal_text, state.last_error)
                state.trace.append("planner")
                if flow.get("validate_plan"):
                    state.plan = validator.validate(state.plan)
                    state.trace.append("plan_validator")
                state.observations = []
                state.evaluations = []
                needs_replan = False
                for step in state.plan.steps:
                    if arg_resolver is not None and step.tool:
                        step = await arg_resolver.resolve(step, goal_text)
                        state.trace.append(f"args:{step.tool}")
                    if step.tool:
                        await _emit("tool", name=step.tool)
                    observation = await executor.execute(step)
                    state.observations.append(observation)
                    state.trace.append(f"exec:{step.tool}")
                    evaluation = evaluator.evaluate(step, observation)
                    state.evaluations.append(evaluation)
                    if evaluation.needs_replan:
                        needs_replan = True
                        state.last_error = evaluation.reason
                        break
                    if not evaluation.should_continue:
                        break
                if needs_replan and state.retries < state.max_retries:
                    state.retries += 1
                    continue
                state.done = True

        if not state.answer:
            await _emit("status", stage="redactando")
            state.answer = await responder.respond(state.resolved_input or state.goal, state.observations)
            state.trace.append("responder")

        return {
            "answer": state.answer,
            "tier": tier,
            "model_id": model_id,
            "resolved_input": state.resolved_input,
            "retries": state.retries,
            "short_circuit": state.short_circuit,
            "trace": state.trace,
            "plan": state.plan.model_dump() if state.plan else None,
            "observations": [observation.model_dump() for observation in state.observations],
        }
