from __future__ import annotations

from typing import Optional

from gumi.contracts.manifests import ApiEndpoint, ApiManifest
from gumi.manifest_loader.registry import ManifestRegistry


class Rbac:
    def __init__(self, registry: Optional[ManifestRegistry] = None) -> None:
        self._roles = (registry or ManifestRegistry()).role_matrix().roles

    def permits(self, manifest: ApiManifest, endpoint: ApiEndpoint, role: str) -> tuple[bool, str]:
        if manifest.allowed_roles and "*" not in manifest.allowed_roles and role not in manifest.allowed_roles:
            return False, f"rol '{role}' no autorizado para el conector"
        entry = self._roles.get(role)
        if entry is None:
            return False, f"rol '{role}' desconocido"
        allowed_tools = entry.get("allowed_tools", [])
        if endpoint.name in entry.get("forbidden_tools", []):
            return False, f"endpoint '{endpoint.name}' prohibido para el rol '{role}'"
        if "*" not in allowed_tools and endpoint.name not in allowed_tools:
            return False, f"rol '{role}' no tiene acceso al endpoint '{endpoint.name}'"
        scopes = set(entry.get("scopes", []))
        if "*" not in scopes and not set(endpoint.required_scopes).issubset(scopes):
            missing = sorted(set(endpoint.required_scopes) - scopes)
            return False, f"faltan scopes {missing} para '{endpoint.name}'"
        return True, ""
