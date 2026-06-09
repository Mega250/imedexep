from __future__ import annotations

from typing import Any, Optional, Protocol, runtime_checkable


@runtime_checkable
class ToolDispatcher(Protocol):
    @property
    def tool_definitions(self) -> list[dict[str, Any]]: ...

    def backend_fn_for(self, tool_name: str) -> Optional[str]: ...

    async def execute(self, tool_name: str, llm_args: dict[str, Any]) -> dict[str, Any]: ...
