from __future__ import annotations

import os
import uuid
from typing import Optional

_SCHEMA = """
CREATE TABLE IF NOT EXISTS gumi_conversation (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS gumi_message (
    id BIGSERIAL PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES gumi_conversation(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_gumi_message_conv ON gumi_message(conversation_id, id);
CREATE INDEX IF NOT EXISTS ix_gumi_conv_patient ON gumi_conversation(patient_id, created_at DESC);
"""


def _new_id() -> str:
    return uuid.uuid4().hex


class ConversationStore:
    def __init__(self, dsn: Optional[str] = None) -> None:
        self._dsn = dsn if dsn is not None else (os.environ.get("GUMI_CONV_DSN") or "")
        self._pool = None
        self._ready = False
        self._mem_conv: dict[str, dict] = {}
        self._mem_msg: dict[str, list] = {}

    @property
    def persistent(self) -> bool:
        return bool(self._dsn)

    async def ready(self) -> None:
        if self._ready:
            return
        if not self._dsn:
            self._ready = True
            return
        import asyncpg

        self._pool = await asyncpg.create_pool(self._dsn, min_size=1, max_size=4)
        async with self._pool.acquire() as conn:
            await conn.execute(_SCHEMA)
        self._ready = True

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None
        self._ready = False

    async def create(self, patient_id: str, title: str = "") -> dict:
        await self.ready()
        cid = _new_id()
        if self._pool is None:
            rec = {"id": cid, "patient_id": patient_id, "title": title, "created_at": None}
            self._mem_conv[cid] = rec
            self._mem_msg[cid] = []
            return dict(rec)
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "INSERT INTO gumi_conversation (id, patient_id, title) VALUES ($1, $2, $3) "
                "RETURNING id, patient_id, title, created_at",
                cid,
                patient_id,
                title,
            )
        return {
            "id": row["id"],
            "patient_id": row["patient_id"],
            "title": row["title"],
            "created_at": row["created_at"].isoformat(),
        }

    async def list_for(self, patient_id: str) -> list[dict]:
        await self.ready()
        if self._pool is None:
            convs = [c for c in self._mem_conv.values() if c["patient_id"] == patient_id]
            return [dict(c) for c in convs]
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, patient_id, title, created_at FROM gumi_conversation "
                "WHERE patient_id = $1 ORDER BY created_at DESC",
                patient_id,
            )
        return [
            {
                "id": r["id"],
                "patient_id": r["patient_id"],
                "title": r["title"],
                "created_at": r["created_at"].isoformat(),
            }
            for r in rows
        ]

    async def history(self, conversation_id: str) -> list[dict]:
        await self.ready()
        if self._pool is None:
            return [dict(m) for m in self._mem_msg.get(conversation_id, [])]
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT role, content FROM gumi_message WHERE conversation_id = $1 ORDER BY id",
                conversation_id,
            )
        return [{"role": r["role"], "content": r["content"]} for r in rows]

    async def append(self, conversation_id: str, role: str, content: str) -> None:
        await self.ready()
        if self._pool is None:
            self._mem_msg.setdefault(conversation_id, []).append({"role": role, "content": content})
            return
        async with self._pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO gumi_message (conversation_id, role, content) VALUES ($1, $2, $3)",
                conversation_id,
                role,
                content,
            )

    async def exists(self, conversation_id: str) -> bool:
        await self.ready()
        if self._pool is None:
            return conversation_id in self._mem_conv
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow("SELECT 1 FROM gumi_conversation WHERE id = $1", conversation_id)
        return row is not None
