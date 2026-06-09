from __future__ import annotations


class ManifestError(Exception):
    pass


class ManifestNotFoundError(ManifestError):
    def __init__(self, path: str):
        self.path = path
        super().__init__(f"Manifest not found: {path}")


class ManifestValidationError(ManifestError):
    def __init__(self, name: str, detail: str):
        self.name = name
        self.detail = detail
        super().__init__(f"Manifest validation failed for '{name}': {detail}")


class EmbeddingDimensionError(ManifestError):
    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(f"Embedding dimension error: {detail}")
