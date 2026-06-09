from __future__ import annotations

from typing import Any, Optional

from gumi.connectors.policy_gateway import ApiPolicyGatewayImpl
from gumi.manifest_loader.registry import ManifestRegistry


def _manifest_by_id(registry: ManifestRegistry, manifest_id: str):
    pools = list(registry.api_connectors().values()) + list(registry.deployment_connectors().values())
    for manifest in pools:
        if manifest.manifest_id == manifest_id:
            return manifest
    return None


async def connector_call(
    manifest_id: str,
    endpoint_name: str,
    agent_id: str = "",
    role: str = "agent_runtime",
    purpose: str = "",
    registry: Optional[ManifestRegistry] = None,
    gateway: Any = None,
    imedexp_token: str = "",
    **args: Any,
) -> dict:
    reg = registry or ManifestRegistry()
    manifest = _manifest_by_id(reg, str(manifest_id))
    if manifest is None:
        return {"ok": False, "status": "not_found", "outcome": "terminal", "error": f"ApiManifest '{manifest_id}' no encontrado"}
    impl = gateway or ApiPolicyGatewayImpl(reg)
    return await impl.call(manifest, str(endpoint_name), dict(args), str(agent_id), str(role or "agent_runtime"), str(purpose or ""), bearer=str(imedexp_token or ""))
