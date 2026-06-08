import pytest

from app.core.middleware import MaxBodySizeMiddleware, RateLimitMiddleware


async def ok_app(scope, receive, send):
    await send({"type": "http.response.start", "status": 200, "headers": []})
    await send({"type": "http.response.body", "body": b"ok"})


async def run_asgi(app, *, path="/", headers=None, client=("127.0.0.1", 12345)):
    messages = []
    scope = {
        "type": "http",
        "method": "GET",
        "path": path,
        "headers": headers or [],
        "client": client,
    }

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        messages.append(message)

    await app(scope, receive, send)
    return messages


@pytest.mark.asyncio
async def test_rate_limit_rejects_when_bucket_is_empty():
    app = RateLimitMiddleware(
        ok_app,
        enabled=True,
        requests_per_minute=1,
        auth_requests_per_minute=1,
        bucket_limit=100,
        trust_proxy_headers=False,
    )

    first = await run_asgi(app, path="/api/v1/auth/login")
    second = await run_asgi(app, path="/api/v1/auth/login")

    assert first[0]["status"] == 200
    assert second[0]["status"] == 429


@pytest.mark.asyncio
async def test_max_body_size_rejects_large_content_length():
    app = MaxBodySizeMiddleware(ok_app, max_body_size=10)

    response = await run_asgi(
        app,
        headers=[(b"content-length", b"11")],
    )

    assert response[0]["status"] == 413
