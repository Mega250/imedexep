from __future__ import annotations

import os
import re
from typing import Any, Optional

import httpx

from gumi.contracts.enums import AuthType
from gumi.contracts.manifests import ApiEndpoint, ApiManifest

_PLACEHOLDER = re.compile(r"\{(\w+)\}")
_TIMEOUT = 20.0
_MAX_BYTES = 1_000_000


def _resolve_base_url(manifest: ApiManifest) -> str:
    key = "GUMI_CONNECTOR_BASE_URL_" + re.sub(r"[^A-Z0-9]", "_", manifest.manifest_id.upper())
    return os.environ.get(key) or os.environ.get("GUMI_CONNECTOR_BASE_URL") or manifest.base_url


def _http_allowed() -> bool:
    return os.environ.get("GUMI_CONNECTOR_ALLOW_HTTP", "").strip().lower() in ("1", "true", "yes")


def _auth_header(manifest: ApiManifest, secret: Optional[str]) -> dict:
    if secret is None or manifest.auth.type == AuthType.NONE:
        return {}
    name = manifest.auth.header_name or "Authorization"
    if manifest.auth.type == AuthType.API_KEY:
        return {name: secret}
    return {name: f"Bearer {secret}"}


class HttpCaller:
    def __init__(self, transport: Any = None) -> None:
        self._transport = transport

    def build_url(self, manifest: ApiManifest, endpoint: ApiEndpoint, args: dict) -> tuple[str, dict]:
        used: set = set()

        def substitute(match: re.Match) -> str:
            key = match.group(1)
            used.add(key)
            return str(args.get(key, ""))

        filled = _PLACEHOLDER.sub(substitute, endpoint.path)
        query = {key: value for key, value in (args or {}).items() if key not in used}
        url = _resolve_base_url(manifest).rstrip("/") + "/" + filled.lstrip("/")
        return url, query

    async def call(self, manifest: ApiManifest, endpoint: ApiEndpoint, args: dict, secret: Optional[str]) -> dict:
        url, query = self.build_url(manifest, endpoint, args)
        secure = url.lower().startswith("https://")
        internal_http = url.lower().startswith("http://") and _http_allowed()
        if not secure and not internal_http:
            return {"ok": False, "status": "invalid_input", "outcome": "terminal", "error": "el conector solo permite https (o http en red interna con GUMI_CONNECTOR_ALLOW_HTTP)"}
        headers = _auth_header(manifest, secret)
        if self._transport is not None:
            status, data = await self._transport(endpoint.method.value, url, headers, query)
            return {"ok": 200 <= status < 300, "status": "success" if 200 <= status < 300 else "error", "http_status": status, "data": data}
        method = endpoint.method.value
        send = {"json": query} if method in ("POST", "PUT", "PATCH") else {"params": query}
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                response = await client.request(method, url, headers=headers, **send)
        except Exception as exc:
            return {"ok": False, "status": "error", "outcome": "transient", "error": f"servicio no disponible (sin red?): {exc}"}
        try:
            data = response.json()
        except Exception:
            data = {"text": response.text[:_MAX_BYTES]}
        return {"ok": response.is_success, "status": "success" if response.is_success else "error", "http_status": response.status_code, "data": data}
