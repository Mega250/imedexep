"""Reverse-proxy transparente hacia el contenedor del agente GUMI.

Reenvía /api/v1/agent/chat y /api/v1/agent/health al servicio interno,
añadiendo los headers CORS del backend sin tocar los binarios firmados.
"""

import os
import logging

import httpx
from fastapi import APIRouter, Request, Response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent-proxy"])

_AGENT_INTERNAL_URL = os.environ.get("AGENT_INTERNAL_URL", "http://agente:8100")
_TIMEOUT = httpx.Timeout(connect=5.0, read=120.0, write=30.0, pool=5.0)


async def _proxy(method: str, path: str, request: Request) -> Response:
    url = f"{_AGENT_INTERNAL_URL}{path}"
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in {"host", "content-length", "transfer-encoding"}
    }
    body = await request.body()

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        try:
            resp = await client.request(method, url, headers=headers, content=body)
        except httpx.ConnectError:
            logger.warning("agent_proxy: cannot reach %s", url)
            return Response(
                content='{"detail":"Agente no disponible"}',
                status_code=502,
                media_type="application/json",
            )

    excluded = {"content-encoding", "content-length", "transfer-encoding"}
    resp_headers = {
        k: v for k, v in resp.headers.items() if k.lower() not in excluded
    }
    return Response(content=resp.content, status_code=resp.status_code, headers=resp_headers, media_type=resp.headers.get("content-type"))


@router.post("/chat")
async def proxy_chat(request: Request) -> Response:
    return await _proxy("POST", "/chat", request)


@router.get("/health")
async def proxy_health(request: Request) -> Response:
    return await _proxy("GET", "/health", request)
