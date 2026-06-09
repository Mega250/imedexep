from __future__ import annotations

import os
from pathlib import Path

_ROLES = ["scout", "planner", "methodologist", "skeptic", "judge", "appeal"]


class Settings:
    BASE_DIR: Path = Path(__file__).resolve().parents[1]
    MANIFESTS_DIR: Path = BASE_DIR / "manifests"
    MODE: str = os.getenv("GUMI_MODE", "local")
    PROVIDER: str = os.getenv("GUMI_PROVIDER", "ollama")
    BASE_URL: str = os.getenv("GUMI_BASE_URL", "http://localhost:11434")
    API_BASE_URL: str = os.getenv("GUMI_API_BASE_URL", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gumi")
    WORKSPACE: str = os.getenv("GUMI_WORKSPACE", str(BASE_DIR / "workspace"))
    AUDIT_DIR: str = os.getenv("GUMI_AUDIT_DIR", str(BASE_DIR / "audit"))
    EXPORTS_DIR: str = os.getenv("GUMI_EXPORTS_DIR", str(BASE_DIR / "exports"))
    DIST_DIR: str = os.getenv("GUMI_DIST_DIR", str(BASE_DIR / "dist"))
    EMBEDDINGS: str = os.getenv("GUMI_EMBEDDINGS", "embeddinggemma_local")
    TTS_VOICE: str = os.getenv("GUMI_TTS_VOICE", "")

    @property
    def role_models(self) -> dict[str, str]:
        return {role: os.getenv(f"GUMI_MODEL_{role.upper()}", "") for role in _ROLES}


settings = Settings()
