from __future__ import annotations

import os
import re
import unicodedata
from typing import Any, Optional

_REL_LABELS = {
    "TRATA": "trata",
    "INDICA": "indicado para",
    "CONTRAINDICA_EN": "contraindicado en",
    "DOSIS": "dosis",
    "INTERACTUA_CON": "interactua con",
    "EFECTO_ADVERSO": "efecto adverso",
    "REQUIERE_MONITOREO": "requiere monitoreo",
    "AJUSTE_EN": "ajuste en",
    "FACTOR_RIESGO_DE": "es factor de riesgo de",
    "COMPLICACION_DE": "es complicacion de",
    "RELATED_TO": "relacionado con",
}


def canonical_name(name: str) -> str:
    name = (name or "").replace("_", " ")
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", name).strip().upper()


def merge_node(entity: dict, kb: str) -> tuple[str, dict]:
    entity_type = str(entity.get("type") or "Entity").strip() or "Entity"
    props = entity.get("properties") or {}
    safe_props = {k: v for k, v in props.items() if isinstance(v, (str, int, float, bool))}
    cypher = (
        "MERGE (n:Entity {canonical: $canonical, kb: $kb})\n"
        "SET n.name = $name, n.type = $type, n.doc_id = $doc_id\n"
    )
    params: dict = {
        "canonical": canonical_name(entity["name"]),
        "name": entity["name"],
        "kb": kb,
        "type": entity_type,
        "doc_id": entity.get("doc_id", ""),
    }
    if safe_props:
        cypher += "SET n += $props\n"
        params["props"] = safe_props
    return cypher, params


def merge_relation(rel: dict, kb: str) -> tuple[str, dict]:
    relation_type = str(rel.get("relation") or "RELATED_TO").upper().strip()
    relation_type = re.sub(r"[^A-Z0-9_]", "_", relation_type) or "RELATED_TO"
    props = rel.get("properties") or {}
    safe_props = {k: v for k, v in props.items() if isinstance(v, (str, int, float, bool))}
    cypher = (
        "MATCH (s:Entity {canonical: $source_canonical, kb: $kb})\n"
        "MATCH (t:Entity {canonical: $target_canonical, kb: $kb})\n"
        f"MERGE (s)-[r:{relation_type}]->(t)\n"
    )
    if safe_props:
        cypher += "SET r += $props\n"
    params: dict = {
        "source_canonical": canonical_name(rel["source"]),
        "target_canonical": canonical_name(rel["target"]),
        "kb": kb,
        "props": safe_props,
    }
    return cypher, params


def _strip_accents(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn")


def extract_query_terms(query: str, stop_words: Optional[set[str]] = None, min_len: int = 3, max_terms: int = 12) -> list[str]:
    stop = stop_words or set()
    base = (query or "").strip()
    if not base:
        return []
    terms: list[str] = []
    seen: set[str] = set()

    def _push(token: str) -> None:
        cleaned = token.strip().strip(".,;:¿?¡!\"'()[]{}")
        if not cleaned:
            return
        key = _strip_accents(cleaned.lower())
        if key in seen or key in stop:
            return
        if len(cleaned) < min_len and not cleaned.isdigit():
            return
        seen.add(key)
        terms.append(cleaned)

    for m in re.finditer(r"[\"«»](.+?)[\"«»]", base):
        _push(m.group(1))
    for m in re.finditer(r"\b[A-ZÁÉÍÓÚÑÜ][\wáéíóúñÁÉÍÓÚÑüÜ]+(?:\s+[A-ZÁÉÍÓÚÑÜ][\wáéíóúñÁÉÍÓÚÑüÜ]+)+\b", base):
        _push(m.group(0))
    for m in re.finditer(r"\b[\wáéíóúñÁÉÍÓÚÑüÜ]+(?:-[\wáéíóúñÁÉÍÓÚÑüÜ]+)+\b", base):
        _push(m.group(0))
    for word in re.findall(r"\b[\wáéíóúñÁÉÍÓÚÑüÜ]+\b", base):
        _push(word)
    terms.sort(key=lambda t: (-len(t), t.lower()))
    return terms[:max_terms]


def _rel_human(relation: str) -> str:
    return _REL_LABELS.get(relation, relation.lower().replace("_", " "))


def neo4j_config() -> Optional[tuple[str, str, str]]:
    uri = os.environ.get("GUMI_NEO4J_URI")
    if not uri:
        return None
    return uri, os.environ.get("GUMI_NEO4J_USER", "neo4j"), os.environ.get("GUMI_NEO4J_PASS", "")


class GraphRetriever:
    def __init__(self, driver: Any = None) -> None:
        self._driver = driver
        self._owns_driver = driver is None

    async def _ensure_driver(self) -> bool:
        if self._driver is not None:
            return True
        cfg = neo4j_config()
        if cfg is None:
            return False
        try:
            from neo4j import AsyncGraphDatabase

            self._driver = AsyncGraphDatabase.driver(cfg[0], auth=(cfg[1], cfg[2]))
            return True
        except Exception:
            return False

    async def close(self) -> None:
        if self._owns_driver and self._driver is not None:
            await self._driver.close()
            self._driver = None

    async def retrieve(self, query: str, kb: str, limit: int = 20) -> list[dict]:
        if not await self._ensure_driver():
            return []
        entities = extract_query_terms(query, min_len=4, max_terms=6)
        if not entities:
            return []
        try:
            return await self._query_entity_graph(entities, kb, limit)
        except Exception:
            return []

    async def _query_entity_graph(self, entities: list[str], kb: str, limit: int) -> list[dict]:
        results: list[dict] = []
        seen: set[tuple] = set()
        out_cypher = (
            "MATCH (src:Entity {kb: $kb})-[r]->(tgt:Entity {kb: $kb})\n"
            "WHERE src.canonical CONTAINS $canonical OR toLower(src.name) CONTAINS toLower($entity)\n"
            "RETURN src.name AS source_name, type(r) AS relation, tgt.name AS target_name, tgt.type AS target_type\n"
            "LIMIT $limit"
        )
        in_cypher = (
            "MATCH (src:Entity {kb: $kb})-[r]->(tgt:Entity {kb: $kb})\n"
            "WHERE tgt.canonical CONTAINS $canonical OR toLower(tgt.name) CONTAINS toLower($entity)\n"
            "RETURN src.name AS source_name, type(r) AS relation, tgt.name AS target_name, tgt.type AS target_type\n"
            "LIMIT $limit"
        )
        async with self._driver.session() as session:
            for entity in entities[:5]:
                params = {"kb": kb, "entity": entity, "canonical": canonical_name(entity), "limit": limit}
                for cypher in (out_cypher, in_cypher):
                    records = await session.run(cypher, **params)
                    async for rec in records:
                        key = (rec["source_name"], rec["target_name"], rec["relation"])
                        if key not in seen:
                            seen.add(key)
                            results.append(
                                {
                                    "source_name": rec["source_name"],
                                    "relation": rec["relation"],
                                    "target_name": rec["target_name"],
                                    "target_type": rec.get("target_type") or "",
                                    "matched_entity": entity,
                                }
                            )
        return results


def format_graph_context(results: list[dict]) -> str:
    if not results:
        return ""
    lines = ["=== Relaciones del grafo clinico ==="]
    for r in results:
        ttype = r.get("target_type", "")
        type_hint = f" [{ttype}]" if ttype else ""
        lines.append(f"- {r['source_name']} {_rel_human(r['relation'])} -> {r['target_name']}{type_hint}")
    return "\n".join(lines)
