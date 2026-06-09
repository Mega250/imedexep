from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from gumi.manifest_loader.registry import ManifestRegistry

_APPROVALS: dict[str, dict] = {}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def whoami(agent_id: Any = "", user_id: Any = "") -> dict:
    return {"ok": True, "status": "success", "agent_id": str(agent_id), "user_id": str(user_id) or "anonimo"}


def check_permission(tool: Any = "", action: Any = "") -> dict:
    name = str(tool)
    try:
        entry = ManifestRegistry().toolpack_catalog().functions.get(name)
        risk = entry.card.risk if entry is not None else "high"
    except Exception:
        risk = "high"
    allowed = risk == "low"
    return {"ok": True, "status": "success", "tool": name, "action": str(action), "risk": risk, "allowed": allowed, "requires_human_approval": not allowed}


def get_runtime_secret(name: Any = "") -> dict:
    return {"ok": True, "status": "success", "secret_ref": str(name), "value": "[REDACTED]", "note": "el valor real se inyecta en runtime, nunca al LLM"}


def require_human_approval(action: Any = "") -> dict:
    return {"ok": True, "status": "requires_human_approval", "outcome": "terminal", "action": str(action)}


def approval_request(action: Any = "", detail: Any = "") -> dict:
    approval_id = uuid.uuid4().hex[:12]
    _APPROVALS[approval_id] = {"approval_id": approval_id, "action": str(action), "detail": str(detail), "status": "pending", "created_at": _now()}
    return {"ok": True, "status": "success", "approval": _APPROVALS[approval_id]}


def approval_wait(approval_id: Any) -> dict:
    approval = _APPROVALS.get(str(approval_id))
    if approval is None:
        return {"ok": False, "status": "not_found", "outcome": "terminal", "error": "aprobacion no existe"}
    return {"ok": True, "status": "success", "approval": approval}


def approval_record_decision(approval_id: Any, decision: Any = "approved", approved_by: Any = "human") -> dict:
    approval = _APPROVALS.get(str(approval_id))
    if approval is None:
        return {"ok": False, "status": "not_found", "outcome": "terminal", "error": "aprobacion no existe"}
    approval["status"] = str(decision)
    approval["approved_by"] = str(approved_by)
    approval["decided_at"] = _now()
    return {"ok": True, "status": "success", "approval": approval}
