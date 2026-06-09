from __future__ import annotations

from pathlib import Path
from typing import Type, TypeVar

import yaml
from pydantic import BaseModel, ValidationError

from gumi.manifest_loader.errors import ManifestNotFoundError, ManifestValidationError

T = TypeVar("T", bound=BaseModel)

MANIFESTS_DIR = Path(__file__).resolve().parents[1] / "manifests"


class ManifestLoader:
    def __init__(self, base_dir: Path | None = None) -> None:
        self._base = base_dir or MANIFESTS_DIR
        self._cache: dict[str, BaseModel] = {}

    @property
    def base_dir(self) -> Path:
        return self._base

    def load_raw(self, relative: str) -> dict:
        path = self._base / relative
        if not path.exists():
            raise ManifestNotFoundError(str(path))
        with path.open("r", encoding="utf-8") as handle:
            return yaml.safe_load(handle) or {}

    def load(self, relative: str, schema: Type[T]) -> T:
        cached = self._cache.get(relative)
        if cached is not None:
            return cached
        raw = self.load_raw(relative)
        try:
            obj = schema.model_validate(raw)
        except ValidationError as exc:
            raise ManifestValidationError(relative, str(exc)) from exc
        self._cache[relative] = obj
        return obj

    def load_dir(self, relative_dir: str, schema: Type[T]) -> dict[str, T]:
        directory = self._base / relative_dir
        out: dict[str, T] = {}
        if not directory.exists():
            return out
        for path in sorted(directory.glob("*.yaml")):
            rel = str(Path(relative_dir) / path.name)
            out[path.stem] = self.load(rel, schema)
        return out

    def clear_cache(self) -> None:
        self._cache.clear()

    def invalidate(self, relative: str) -> None:
        self._cache.pop(relative, None)
