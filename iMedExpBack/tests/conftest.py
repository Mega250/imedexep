import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import asyncio
from app.main import app
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.base import Base

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

from app.api.deps import get_rls_session, get_plain_session, get_current_user
from unittest.mock import AsyncMock
from fastapi import Depends

async def override_get_session_auth(token=Depends(get_current_user)):
    yield AsyncMock()

async def override_get_session_plain():
    yield AsyncMock()

app.dependency_overrides[get_rls_session] = override_get_session_auth
app.dependency_overrides[get_plain_session] = override_get_session_plain

@pytest_asyncio.fixture(scope="session")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

