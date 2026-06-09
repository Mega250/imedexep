from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class GumiModel(BaseModel):
    model_config = ConfigDict(protected_namespaces=(), populate_by_name=True)
