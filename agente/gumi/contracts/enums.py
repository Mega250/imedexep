from __future__ import annotations

from enum import Enum


class RiskLevel(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class PolicyVerdict(str, Enum):
    ALLOW = "allow"
    RESTRICTED = "restricted"
    BLOCK = "block"


class ModelTier(str, Enum):
    FRONTIER = "frontier"
    MID = "mid"
    SMALL = "small"


class TierSource(str, Enum):
    REGISTRY = "registry"
    PROBE = "probe"
    FALLBACK = "fallback"


class OutputMode(str, Enum):
    TEXT = "text"
    JSON = "json"
    STRICT_JSON = "strict_json"


class ReasoningBudget(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RiskTolerance(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CouncilRoleName(str, Enum):
    SCOUT = "scout"
    PLANNER = "planner"
    METHODOLOGIST = "methodologist"
    SKEPTIC = "skeptic"
    JUDGE = "judge"
    APPEAL_JUDGE = "appeal_judge"


class FinalDecision(str, Enum):
    APPROVED = "approved"
    NEEDS_HUMAN_CLARIFICATION = "needs_human_clarification"
    REJECTED = "rejected"


class SkepticRecommendation(str, Enum):
    ACCEPT = "accept"
    REVISE = "revise"
    REJECT = "reject"


class AppealDecision(str, Enum):
    DEFEND_PREVIOUS = "defend_previous"
    REVISE = "revise"
    ASK_HUMAN = "ask_human"


class ManifestState(str, Enum):
    DRAFT = "draft"
    DETECTED = "detected"
    PENDING_HUMAN_CONFIRMATION = "pending_human_confirmation"
    HUMAN_CONFIRMED = "human_confirmed"
    ACTIVE = "active"
    DEPRECATED = "deprecated"


class AuthType(str, Enum):
    BEARER = "bearer"
    API_KEY = "api_key"
    OAUTH2_CLIENT_CREDENTIALS = "oauth2_client_credentials"
    NONE = "none"


class HttpMethod(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


class PiiLevel(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ToolSource(str, Enum):
    TOOLPACK = "toolpack"
    API_CONNECTOR = "api_connector"
    CUSTOM_SANDBOX = "custom_sandbox"


class VectorType(str, Enum):
    VECTOR = "vector"
    HALFVEC = "halfvec"


class QueryComplexity(str, Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"
    MULTI_HOP = "multi_hop"


class DistanceMetric(str, Enum):
    COSINE = "cosine"
    L2 = "l2"
    INNER_PRODUCT = "inner_product"


class CragVerdict(str, Enum):
    PROCEED = "proceed"
    WARN = "warn"
    REFUSE = "refuse"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AuditEventType(str, Enum):
    REQUEST_RECEIVED = "request_received"
    CONTENT_MODERATED = "content_moderated"
    DOMAIN_CLASSIFIED = "domain_classified"
    CAPABILITY_EXTRACTED = "capability_extracted"
    POLICY_DECISION = "policy_decision"
    META_GUARD_BLOCK = "meta_guard_block"
    COUNCIL_VERDICT = "council_verdict"
    SAFETY_GATE = "safety_gate"
    APPROVAL_REQUESTED = "approval_requested"
    APPROVAL_DECIDED = "approval_decided"
    TOOL_RESOLUTION = "tool_resolution"
    FORGE_RESULT = "forge_result"
    COMPILE_ATTEMPT = "compile_attempt"
    COMPILE_RESULT = "compile_result"
    EXPORT = "export"
    CONNECTOR_CALL = "connector_call"
    RUNTIME_STEP = "runtime_step"
    CHANGE_REQUESTED = "change_requested"
    CHANGE_IMPACT = "change_impact"
    CHANGE_REJECTED = "change_rejected"
    CHANGE_APPLIED = "change_applied"


class AgentRunState(str, Enum):
    DESIGN_PENDING = "design_pending"
    TOOLS_PENDING_APPROVAL = "tools_pending_approval"
    TOOL_CREATION_REQUIRED = "tool_creation_required"
    TOOL_SANDBOX_TESTING = "tool_sandbox_testing"
    AGENT_COMPILED = "agent_compiled"
    PLANNING = "planning"
    PLAN_EVALUATION = "plan_evaluation"
    EXECUTING_STEP = "executing_step"
    STEP_EVALUATION = "step_evaluation"
    REPLANNING = "replanning"
    HUMAN_CONFIRMATION_REQUIRED = "human_confirmation_required"
    FINAL_EVALUATION = "final_evaluation"
    DONE = "done"
    FAILED = "failed"


class StepStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    ERROR = "error"


class ResultQuality(str, Enum):
    POOR = "poor"
    ACCEPTABLE = "acceptable"
    GOOD = "good"


class SafetyLabel(str, Enum):
    SAFE = "safe"
    UNSAFE = "unsafe"


class OnUnsafe(str, Enum):
    BLOCK = "block"
    ESCALATE = "escalate"
    REDACT = "redact"


class ChangeType(str, Enum):
    ADD_TOOL = "add_tool"
    REMOVE_TOOL = "remove_tool"
    ADD_PACK = "add_pack"
    MODIFY_WORKFLOW = "modify_workflow"
    MODIFY_POLICY = "modify_policy"


class ModificationLevel(str, Enum):
    LOW_RISK = "low_risk"
    MEDIUM_RISK = "medium_risk"
    HIGH_RISK = "high_risk"


class ChangeStatus(str, Enum):
    NO_OP = "no_op"
    PENDING_APPROVAL = "pending_approval"
    REJECTED = "rejected"
    APPLIED = "applied"


class ExportMode(str, Enum):
    FROZEN_RUNTIME = "frozen_runtime"
    EDITABLE_PROJECT = "editable_project"


class CreationStatus(str, Enum):
    BLOCKED = "blocked"
    RESTRICTED = "restricted"
    AWAITING_APPROVAL = "awaiting_approval"
    COMPILED = "compiled"


class AudioFormat(str, Enum):
    WAV = "wav"
    MP3 = "mp3"
    OGG = "ogg"
    FLAC = "flac"


class TtsEngine(str, Enum):
    PIPER = "piper"
    XTTS = "xtts"
    GPT_SOVITS = "gpt_sovits"
    OPENAI_COMPAT = "openai_compat"
