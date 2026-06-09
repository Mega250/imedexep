from __future__ import annotations

import hashlib
import hmac
import json
import os
from typing import Any

from gumi.contracts.agent_package import Signature


def canonical_bytes(obj: Any) -> bytes:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, indent=2).encode("utf-8")


def _signing_key() -> bytes:
    return os.environ.get("GUMI_SIGNING_KEY", "").encode("utf-8")


def sha256_hex(data: bytes) -> str:
    key = _signing_key()
    if key:
        return hmac.new(key, data, hashlib.sha256).hexdigest()
    return hashlib.sha256(data).hexdigest()


def verify_signature(signature: Signature, spec_bytes: bytes, tools_bytes: bytes, policy_bytes: bytes) -> bool:
    return (
        hmac.compare_digest(signature.agent_spec_sha256, sha256_hex(spec_bytes))
        and hmac.compare_digest(signature.tool_manifest_sha256, sha256_hex(tools_bytes))
        and hmac.compare_digest(signature.policy_sha256, sha256_hex(policy_bytes))
    )
