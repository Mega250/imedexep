from __future__ import annotations

import re

from gumi.contracts.enums import PiiLevel, RiskLevel, ToolSource
from gumi.contracts.manifests import ApiEndpoint, ApiManifest
from gumi.contracts.tool_spec import ToolParameter, ToolParameters, ToolPermissions, ToolSpec

_PLACEHOLDER = re.compile(r"\{(\w+)\}")


def _endpoint_risk(endpoint: ApiEndpoint, manifest: ApiManifest) -> str:
    if endpoint.method.value != "GET":
        return "high"
    if endpoint.pii_level != PiiLevel.NONE:
        return "high"
    if manifest.risk_level in (RiskLevel.C, RiskLevel.D):
        return "high"
    return "medium"


class TypedToolFactory:
    def typed_tools_for(self, manifest: ApiManifest) -> list[ToolSpec]:
        tools: list[ToolSpec] = []
        for endpoint in manifest.allowed_endpoints:
            names = _PLACEHOLDER.findall(endpoint.path) + list(endpoint.request_fields)
            properties = {name: ToolParameter(type="string", description=f"parametro {name}") for name in names}
            tools.append(
                ToolSpec(
                    tool_id=f"api.{manifest.manifest_id}.{endpoint.name}",
                    name=endpoint.name,
                    description=f"{endpoint.method.value} {endpoint.path} via {manifest.owner or manifest.manifest_id}",
                    parameters=ToolParameters(properties=properties, required=list(properties)),
                    backend_function="gumi.connectors.dispatch:connector_call",
                    fixed_arguments={"manifest_id": manifest.manifest_id, "endpoint_name": endpoint.name},
                    source=ToolSource.API_CONNECTOR,
                    required_scopes=list(endpoint.required_scopes),
                    permissions=ToolPermissions(network=True),
                    pii_level=endpoint.pii_level,
                    requires_audit=endpoint.requires_audit,
                    api_manifest_ref=manifest.manifest_id,
                )
            )
        return tools

    def catalog_entries(self, manifest: ApiManifest) -> dict:
        entries: dict = {}
        for endpoint in manifest.allowed_endpoints:
            tool_id = f"api.{manifest.manifest_id}.{endpoint.name}"
            entries[tool_id] = {
                "import_path": "gumi.connectors.dispatch:connector_call",
                "injected_keys": ["agent_id", "role", "purpose", "registry", "imedexp_token", "patient_id"],
                "fixed_arguments": {"manifest_id": manifest.manifest_id, "endpoint_name": endpoint.name},
                "card": {
                    "category": "conector",
                    "side_effects": endpoint.method.value != "GET",
                    "risk": _endpoint_risk(endpoint, manifest),
                    "use_when": f"Llamar el endpoint '{endpoint.name}' de {manifest.owner or manifest.manifest_id} ({endpoint.method.value} {endpoint.path})."
                    + (f" Campos de entrada requeridos: {', '.join(endpoint.request_fields)}." if endpoint.request_fields else ""),
                    "inputs": _PLACEHOLDER.findall(endpoint.path) + list(endpoint.request_fields),
                },
                "pii_level": endpoint.pii_level.value,
                "source": "connector",
            }
        return entries
