from __future__ import annotations

import os
from typing import Optional


def resolve_secret(secret_ref: Optional[str]) -> Optional[str]:
    if not secret_ref:
        return None
    candidates = (f"GUMI_SECRET_{secret_ref.upper()}", f"GUMI_{secret_ref.upper()}", secret_ref)
    for key in candidates:
        value = os.getenv(key)
        if value:
            return value
    return None


def has_secret(secret_ref: Optional[str]) -> bool:
    return resolve_secret(secret_ref) is not None
