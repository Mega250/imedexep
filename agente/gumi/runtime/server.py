from __future__ import annotations

import asyncio
import json
import os
from typing import Any, Optional

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from gumi.connectors.secret_resolver import resolve_secret
from gumi.contracts.enums import SafetyLabel
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.runtime.chat_safety import image_ok, looks_injection
from gumi.runtime.conversations import ConversationStore
from gumi.runtime.loader import FrozenRuntimeError, load_verified_spec
from gumi.runtime.loop import AgentRuntimeLoop
from gumi.safety.content_safety import NemotronContentModerator

_HISTORY_TURNS = 20


class ChatRequest(BaseModel):
    message: str = ""
    image_base64: Optional[str] = None
    patient_id: Optional[str] = None
    conversation_id: Optional[str] = None
    title: str = ""


class NewConversation(BaseModel):
    patient_id: str
    title: str = ""


def _bearer(authorization: Optional[str]) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()
    return ""


async def _patient_from_identity(bearer: str) -> str:
    url = os.environ.get("GUMI_IDENTITY_URL", "").strip()
    if not url or not bearer:
        return ""
    import httpx

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers={"Authorization": f"Bearer {bearer}"})
        if response.is_success:
            data = response.json()
            for key in ("patient_id", "id", "user_id", "sub", "uuid"):
                value = data.get(key)
                if value:
                    return str(value)
    except Exception:
        return ""
    return ""


def _data_blocks(result: dict) -> list:
    blocks: list = []
    steps = ((result.get("plan") or {}).get("steps")) or []
    for index, obs in enumerate(result.get("observations") or []):
        data = obs.get("data") if isinstance(obs, dict) else None
        if not isinstance(data, dict) or not data.get("ok"):
            continue
        payload = data.get("data")
        if payload in (None, {}, []):
            continue
        tool = data.get("endpoint") or (steps[index].get("tool") if index < len(steps) and isinstance(steps[index], dict) else "")
        blocks.append({"tool": str(tool), "data": payload})
    return blocks


async def handle_chat(
    req: ChatRequest,
    authorization: Optional[str],
    registry: ManifestRegistry,
    store: ConversationStore,
    emit: Optional[Any] = None,
) -> dict:
    message = (req.message or "").strip()
    if not message and not req.image_base64:
        raise HTTPException(status_code=400, detail="mensaje vacio")
    if looks_injection(message):
        return {
            "answer": "Por tu seguridad no puedo seguir instrucciones que intenten cambiar mi comportamiento. ¿En que te ayudo con tu salud?",
            "blocked": "prompt_injection",
        }
    if not image_ok(req.image_base64):
        raise HTTPException(status_code=413, detail="imagen invalida o demasiado grande")

    moderator = NemotronContentModerator(registry)
    try:
        verdict = await moderator.moderate(message or "imagen adjunta", image=req.image_base64)
    except Exception:
        verdict = None
    if verdict is not None and verdict.user_safety == SafetyLabel.UNSAFE:
        return {
            "answer": "No puedo procesar ese contenido. Si tienes una urgencia medica, contacta a tu medico o a servicios de emergencia.",
            "blocked": "content_safety",
            "categories": verdict.categories,
        }

    bundle = os.environ.get("GUMI_AGENT_BUNDLE", "")
    if not bundle:
        raise HTTPException(status_code=500, detail="agente no configurado (define GUMI_AGENT_BUNDLE)")
    try:
        spec = load_verified_spec(bundle)
    except FrozenRuntimeError as exc:
        raise HTTPException(status_code=500, detail=f"agente no verificable: {exc}")

    bearer = _bearer(authorization)
    patient_id = await _patient_from_identity(bearer) or (req.patient_id or "")
    conversation_id = req.conversation_id or ""
    if conversation_id and not await store.exists(conversation_id):
        conversation_id = ""
    if not conversation_id:
        titulo = req.title or (message[:60] if message else "Consulta")
        conv = await store.create(patient_id, titulo)
        conversation_id = conv["id"]

    context = {
        "patient_id": patient_id,
        "imedexp_token": bearer or resolve_secret("imedexp_token") or "",
    }
    goal = message
    if req.image_base64:
        context["imagen"] = req.image_base64
        goal = (message or "Analiza la imagen medica que adjunto.") + (
            "\n(El paciente adjunto una imagen; si aplica usa la tool de analisis de imagen medica y marca el resultado como PRELIMINAR.)"
        )

    history = (await store.history(conversation_id))[-_HISTORY_TURNS:]
    loop = AgentRuntimeLoop(registry)
    model_id = os.environ.get("GUMI_AGENT_MODEL", "deepseek-v4-flash-free")
    try:
        result = await loop.run(spec, goal, model_id, context=context, history=history, emit=emit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"runtime error: {exc}")
    answer = str(result.get("answer", ""))

    try:
        out = await moderator.moderate(message or "imagen", response=answer)
        if out.response_safety == SafetyLabel.UNSAFE:
            answer = "He preparado informacion para tu medico; por seguridad la revisara el directamente."
    except Exception:
        pass

    await store.append(conversation_id, "user", message or "[imagen]")
    await store.append(conversation_id, "assistant", answer)
    return {
        "answer": answer,
        "conversation_id": conversation_id,
        "tier": result.get("tier"),
        "requires_clinician_review": True,
        "blocks": _data_blocks(result),
    }


def build_app(registry: Optional[ManifestRegistry] = None, store: Optional[ConversationStore] = None) -> FastAPI:
    deployment_dir = os.environ.get("GUMI_DEPLOYMENT_DIR") or os.environ.get("GUMI_AGENT_BUNDLE") or None
    registry = registry or ManifestRegistry(deployment_dir=deployment_dir)
    store = store or ConversationStore()
    app = FastAPI(title="Gumi Agent Runtime")

    origins = [o.strip() for o in os.environ.get("GUMI_CORS_ORIGINS", "*").split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict:
        name = ""
        ok = False
        try:
            spec = load_verified_spec(os.environ.get("GUMI_AGENT_BUNDLE", ""))
            ok = True
            name = spec.name
        except Exception:
            ok = False
        return {"status": "ok" if ok else "sin_agente", "agent": name, "persistent": store.persistent}

    @app.post("/chat")
    async def chat(req: ChatRequest, authorization: Optional[str] = Header(default=None)) -> dict:
        return await handle_chat(req, authorization, registry, store)

    @app.post("/chat/stream")
    async def chat_stream(req: ChatRequest, authorization: Optional[str] = Header(default=None)) -> StreamingResponse:
        async def eventos():
            cola: asyncio.Queue = asyncio.Queue()

            async def emit(ev: dict) -> None:
                await cola.put(ev)

            async def trabajo() -> None:
                try:
                    resultado = await handle_chat(req, authorization, registry, store, emit=emit)
                    await cola.put({"type": "final", **resultado})
                except HTTPException as exc:
                    await cola.put({"type": "error", "detail": exc.detail})
                except Exception as exc:
                    await cola.put({"type": "error", "detail": str(exc)})
                finally:
                    await cola.put(None)

            tarea = asyncio.create_task(trabajo())
            try:
                while True:
                    ev = await cola.get()
                    if ev is None:
                        break
                    yield f"data: {json.dumps(ev, ensure_ascii=False)}\n\n"
            finally:
                await tarea

        return StreamingResponse(eventos(), media_type="text/event-stream")

    @app.post("/conversations")
    async def crear(req: NewConversation) -> dict:
        return await store.create(req.patient_id, req.title)

    @app.get("/conversations")
    async def listar(patient_id: str) -> dict:
        return {"conversations": await store.list_for(patient_id)}

    @app.get("/conversations/{conversation_id}/messages")
    async def mensajes(conversation_id: str) -> dict:
        return {"conversation_id": conversation_id, "messages": await store.history(conversation_id)}

    return app


def run_server(bundle: str) -> None:
    import uvicorn

    os.environ["GUMI_AGENT_BUNDLE"] = bundle
    host = os.environ.get("GUMI_HOST", "0.0.0.0")
    port = int(os.environ.get("GUMI_PORT", "8100"))
    uvicorn.run(build_app(), host=host, port=port)
