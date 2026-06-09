from __future__ import annotations

from typing import Any, Optional

from gumi.connectors.aggregation_guard import check as aggregation_check
from gumi.connectors.http_caller import HttpCaller
from gumi.connectors.rate_limiter import RateLimiter
from gumi.connectors.rbac import Rbac
from gumi.connectors.response_filter import filter_response
from gumi.connectors.secret_resolver import resolve_secret
from gumi.contracts.manifests import ApiEndpoint, ApiManifest
from gumi.manifest_loader.registry import ManifestRegistry


def _denied(reason: str) -> dict:
    return {"ok": False, "status": "denied", "outcome": "terminal", "error": reason}


class ApiPolicyGatewayImpl:
    def __init__(self, registry: Optional[ManifestRegistry] = None, caller: Any = None, rate_limiter: Any = None) -> None:
        self._registry = registry or ManifestRegistry()
        self._rbac = Rbac(self._registry)
        self._caller = caller or HttpCaller()
        self._rate = rate_limiter or RateLimiter()

    def _endpoint(self, manifest: ApiManifest, name: str) -> Optional[ApiEndpoint]:
        for endpoint in manifest.allowed_endpoints:
            if endpoint.name == name:
                return endpoint
        return None

    async def call(self, manifest: ApiManifest, endpoint_name: str, args: dict, agent_id: str, role: str, purpose: str, bearer: str = "") -> dict:
        endpoint = self._endpoint(manifest, endpoint_name)
        if endpoint is None:
            return {"ok": False, "status": "not_found", "outcome": "terminal", "error": f"endpoint '{endpoint_name}' no esta en allowed_endpoints"}
        permitted, reason = self._rbac.permits(manifest, endpoint, role)
        if not permitted:
            return _denied(reason)
        aggregate_ok, reason = aggregation_check(endpoint, args or {})
        if not aggregate_ok:
            return _denied(reason)
        key = f"{manifest.manifest_id}:{endpoint_name}"
        if not self._rate.allow(key, endpoint.rate_limit_per_min):
            return {"ok": False, "status": "error", "outcome": "transient", "error": "rate limit del conector excedido"}
        secret = bearer or resolve_secret(manifest.auth.secret_ref)
        if manifest.auth.type.value != "none" and not secret:
            return _denied(f"falta el secreto '{manifest.auth.secret_ref}' (configurar en env, nunca en el manifiesto ni al LLM)")
        self._rate.record(key)
        result = await self._caller.call(manifest, endpoint, args or {}, secret)
        if result.get("ok"):
            result["data"] = filter_response(result.get("data"), endpoint.response_fields)
        result["endpoint"] = endpoint_name
        result["audit"] = {"agent_id": agent_id, "role": role, "purpose": purpose, "manifest": manifest.manifest_id, "pii": endpoint.pii_level.value}
        return result
