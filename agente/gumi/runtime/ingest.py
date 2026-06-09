from __future__ import annotations

import asyncio
import glob
import os
import subprocess
import sys
from typing import Any

from gumi.contracts.enums import CouncilRoleName, OutputMode
from gumi.contracts.model import LLMRequest
from gumi.manifest_loader.registry import ManifestRegistry
from gumi.model.router import GumiModelRouter
from gumi.platform.graph.graph_rag import merge_node, merge_relation, neo4j_config

_SYSTEM = (
    "Eres un EXTRACTOR de conocimiento. Lee el fragmento de un documento y extrae sus RELACIONES LOGICAS "
    "de forma FIEL al texto (no inventes nada). Devuelve UNICAMENTE un JSON con esta forma exacta:\n"
    '{"entidades": [{"nombre": "...", "tipo": "..."}], '
    '"relaciones": [{"sujeto": "...", "relacion": "...", "objeto": "...", "condicion": "<opcional>"}]}\n'
    "Usa relaciones en MAYUSCULAS_CON_GUION (p.ej. TRATA, CONTRAINDICA_EN, DOSIS, INTERACTUA_CON, EFECTO_ADVERSO, "
    "REQUIERE, CAUSA, PARTE_DE, INDICA). Captura sobre todo las condicionales y restricciones. "
    "Si algo no esta en el texto, NO lo incluyas. Nada fuera del JSON."
)


def _model() -> str:
    return os.environ.get("GUMI_INGEST_MODEL", "deepseek-v4-flash-free")


def _kb() -> str:
    return os.environ.get("GUMI_KB") or os.environ.get("GUMI_GUIAS_KB") or "default"


def _extraer_texto(path: str) -> str:
    low = path.lower()
    try:
        if low.endswith(".pdf"):
            return subprocess.run(["pdftotext", "-q", path, "-"], capture_output=True, text=True, timeout=120).stdout
        if low.endswith(".docx"):
            import docx

            return "\n".join(p.text for p in docx.Document(path).paragraphs)
        if low.endswith((".txt", ".md")):
            with open(path, encoding="utf-8", errors="ignore") as handle:
                return handle.read()
    except Exception:
        return ""
    return ""


async def _extraer(router: Any, fragmento: str) -> tuple[list, list]:
    resp = await router.call(
        LLMRequest(
            model_id=_model(),
            role=CouncilRoleName.METHODOLOGIST,
            messages=[{"role": "user", "content": _SYSTEM + "\n\nTEXTO:\n" + fragmento}],
            output_mode=OutputMode.JSON,
        )
    )
    data = resp.parsed if isinstance(resp.parsed, dict) else {}
    return data.get("entidades", []) or [], data.get("relaciones", []) or []


async def ingerir(carpeta: str) -> dict:
    cfg = neo4j_config()
    if cfg is None:
        return {"ok": False, "error": "grafo no configurado (define GUMI_NEO4J_URI)"}
    docs: list[str] = []
    for patron in ("*.pdf", "*.docx", "*.txt", "*.md"):
        docs.extend(glob.glob(os.path.join(carpeta, "**", patron), recursive=True))
    docs = sorted(set(docs))
    skip_head = int(os.environ.get("GUMI_INGEST_SKIP_HEAD", "1500"))
    chunk = int(os.environ.get("GUMI_INGEST_CHUNK", "6000"))
    max_chunks = int(os.environ.get("GUMI_INGEST_MAX_CHUNKS", "10"))
    from neo4j import AsyncGraphDatabase

    registry = ManifestRegistry()
    router = GumiModelRouter(registry)
    driver = AsyncGraphDatabase.driver(cfg[0], auth=(cfg[1], cfg[2]))
    kb = _kb()
    total_e = total_r = 0
    for index, path in enumerate(docs, 1):
        doc_id = os.path.basename(path)
        texto = _extraer_texto(path)
        if len(texto.strip()) < 200:
            print(f"[{index}/{len(docs)}] {doc_id} SKIP (sin texto)", flush=True)
            continue
        cuerpo = texto[skip_head:]
        fragmentos = [cuerpo[s:s + chunk] for s in range(0, len(cuerpo), chunk)][:max_chunks]
        for fragmento in fragmentos:
            if len(fragmento) < 300:
                continue
            try:
                ents, rels = await _extraer(router, fragmento)
            except Exception:
                continue
            async with driver.session() as session:
                for entidad in ents:
                    nombre = str(entidad.get("nombre") or "").strip()
                    if not nombre:
                        continue
                    cypher, params = merge_node({"name": nombre, "type": entidad.get("tipo", "Entity"), "doc_id": doc_id}, kb)
                    await session.run(cypher, **params)
                    total_e += 1
                for rel in rels:
                    sujeto = str(rel.get("sujeto") or "").strip()
                    objeto = str(rel.get("objeto") or "").strip()
                    if not sujeto or not objeto or sujeto == objeto:
                        continue
                    for nombre in (sujeto, objeto):
                        cypher, params = merge_node({"name": nombre, "type": "Entity", "doc_id": doc_id}, kb)
                        await session.run(cypher, **params)
                    cypher, params = merge_relation(
                        {"source": sujeto, "relation": rel.get("relacion", "RELATED_TO"), "target": objeto, "properties": {"condicion": str(rel.get("condicion") or "")[:200], "doc": doc_id}},
                        kb,
                    )
                    await session.run(cypher, **params)
                    total_r += 1
        print(f"[{index}/{len(docs)}] {doc_id}: acum {total_e} entidades / {total_r} relaciones", flush=True)
    await driver.close()
    return {"ok": True, "documentos": len(docs), "entidades": total_e, "relaciones": total_r, "kb": kb}


def main() -> None:
    carpeta = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("GUMI_INGEST_DIR", "")
    if not carpeta or not os.path.isdir(carpeta):
        print("uso: python -m gumi.runtime.ingest <carpeta_de_documentos>", flush=True)
        sys.exit(1)
    print(asyncio.run(ingerir(carpeta)), flush=True)


if __name__ == "__main__":
    main()
