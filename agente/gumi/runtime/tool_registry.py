from __future__ import annotations

import importlib
from difflib import get_close_matches
from typing import Any, Callable, Optional

from gumi.manifest_loader.registry import ManifestRegistry
from gumi.manifest_loader.schemas import CatalogEntry


class ToolRegistry:
    def __init__(self, registry: Optional[ManifestRegistry] = None, fuzzy_min_ratio: int = 88) -> None:
        self._functions = (registry or ManifestRegistry()).toolpack_catalog().functions
        self._fuzzy_min_ratio = fuzzy_min_ratio

    def names(self) -> list[str]:
        return list(self._functions)

    def resolve(self, name: str) -> Optional[str]:
        if name in self._functions:
            return name
        matches = get_close_matches(name, list(self._functions), n=1, cutoff=self._fuzzy_min_ratio / 100.0)
        return matches[0] if matches else None

    def entry(self, name: str) -> Optional[CatalogEntry]:
        canonical = self.resolve(name)
        return self._functions.get(canonical) if canonical else None

    def import_path(self, name: str) -> Optional[str]:
        entry = self.entry(name)
        return entry.import_path if entry else None

    def load_function(self, name: str) -> Optional[Callable[..., Any]]:
        path = self.import_path(name)
        if not path or ":" not in path:
            return None
        module_name, function_name = path.split(":", 1)
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            return None
        return getattr(module, function_name, None)

    def tool_definitions(self) -> list[dict[str, Any]]:
        definitions = []
        for name, entry in self._functions.items():
            card = entry.card
            definitions.append(
                {
                    "name": name,
                    "category": card.category,
                    "description": card.use_when or card.category,
                    "risk": card.risk,
                    "side_effects": card.side_effects,
                    "inputs": list(getattr(card, "inputs", None) or []),
                }
            )
        return definitions
