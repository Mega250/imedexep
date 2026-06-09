from __future__ import annotations

import re

from gumi.contracts.manifests import ApiEndpoint

_PLACEHOLDER = re.compile(r"\{(\w+)\}")


def check(endpoint: ApiEndpoint, args: dict) -> tuple[bool, str]:
    if not endpoint.aggregate_only:
        return True, ""
    placeholders = _PLACEHOLDER.findall(endpoint.path)
    if placeholders:
        return False, "endpoint agregado no admite parametros de registro individual"
    return True, ""
