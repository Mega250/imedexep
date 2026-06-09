from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from gumi.contracts.agent_package import Signature
from gumi.contracts.agent_spec import AgentSpec
from gumi.runtime.signing import verify_signature


class FrozenRuntimeError(RuntimeError):
    pass


def load_verified_spec(bundle_dir: str, layout: Optional[dict] = None) -> AgentSpec:
    base = Path(bundle_dir)
    layout = layout or {}
    spec_path = base / layout.get("spec_file", "agent.spec.json")
    lock_path = base / layout.get("lock_file", "agent.lock.json")
    tools_path = base / layout.get("tools_dir", "tools") / "manifest.json"
    policy_path = base / layout.get("policies_dir", "policies") / "policy.json"
    for path in (spec_path, lock_path, tools_path, policy_path):
        if not path.is_file():
            raise FrozenRuntimeError(f"bundle incompleto: falta {path.name}; el runtime se niega a ejecutar")
    spec_bytes = spec_path.read_bytes()
    tools_bytes = tools_path.read_bytes()
    policy_bytes = policy_path.read_bytes()
    lock_data = json.loads(lock_path.read_text(encoding="utf-8"))
    signature = lock_data.get("signature")
    if not signature:
        raise FrozenRuntimeError("bundle sin firma; el runtime se niega a ejecutar")
    if not verify_signature(Signature(**signature), spec_bytes, tools_bytes, policy_bytes):
        raise FrozenRuntimeError("firma invalida: el bundle fue manipulado; el runtime se niega a ejecutar")
    lock = lock_data.get("lock") or {}
    if not lock.get("frozen", False):
        raise FrozenRuntimeError("el lock no esta congelado (frozen=false); no es un frozen-runtime valido")
    return AgentSpec.model_validate(json.loads(spec_bytes))
