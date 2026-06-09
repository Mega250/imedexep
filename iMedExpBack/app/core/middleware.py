import time
from dataclasses import dataclass

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class RequestBodyTooLargeError(Exception):
    pass


class MaxBodySizeMiddleware:
    def __init__(self, app: ASGIApp, max_body_size: int) -> None:
        self.app = app
        self.max_body_size = max_body_size

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers") or [])
        content_length = headers.get(b"content-length")
        if content_length is not None:
            try:
                if int(content_length) > self.max_body_size:
                    await self._reject(scope, receive, send)
                    return
            except ValueError:
                await self._reject(scope, receive, send)
                return

        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_body_size:
                    raise RequestBodyTooLargeError
            return message

        try:
            await self.app(scope, limited_receive, send)
        except RequestBodyTooLargeError:
            await self._reject(scope, receive, send)

    @staticmethod
    async def _reject(scope: Scope, receive: Receive, send: Send) -> None:
        response = JSONResponse(
            status_code=413,
            content={"detail": "El cuerpo de la solicitud excede el límite permitido"},
        )
        await response(scope, receive, send)


@dataclass
class _RateLimitBucket:
    tokens: float
    updated_at: float


class RateLimitMiddleware:
    def __init__(
        self,
        app: ASGIApp,
        *,
        enabled: bool,
        requests_per_minute: int,
        auth_requests_per_minute: int,
        bucket_limit: int,
        trust_proxy_headers: bool,
    ) -> None:
        self.app = app
        self.enabled = enabled
        self.requests_per_minute = requests_per_minute
        self.auth_requests_per_minute = auth_requests_per_minute
        self.bucket_limit = bucket_limit
        self.trust_proxy_headers = trust_proxy_headers
        self._buckets: dict[str, _RateLimitBucket] = {}
        self._last_cleanup = time.monotonic()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if not self.enabled or scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = str(scope.get("path") or "")
        client_ip = self._client_ip(scope)
        group, limit = self._policy_for_path(path)
        now = time.monotonic()

        allowed, retry_after = self._consume(f"{client_ip}:{group}", limit, now)
        if not allowed:
            await self._reject(scope, receive, send, limit, retry_after)
            return

        if now - self._last_cleanup > 60:
            self._cleanup(now)

        await self.app(scope, receive, send)

    def _policy_for_path(self, path: str) -> tuple[str, int]:
        if path.startswith("/api/v1/auth/"):
            return "auth", self.auth_requests_per_minute
        return "general", self.requests_per_minute

    def _consume(self, key: str, limit: int, now: float) -> tuple[bool, int]:
        refill_rate = limit / 60.0
        bucket = self._buckets.get(key)
        if bucket is None:
            self._buckets[key] = _RateLimitBucket(tokens=limit - 1, updated_at=now)
            return True, 0

        elapsed = max(0.0, now - bucket.updated_at)
        bucket.tokens = min(float(limit), bucket.tokens + (elapsed * refill_rate))
        bucket.updated_at = now

        if bucket.tokens >= 1:
            bucket.tokens -= 1
            return True, 0

        retry_after = max(1, int((1 - bucket.tokens) / refill_rate))
        return False, retry_after

    def _cleanup(self, now: float) -> None:
        self._last_cleanup = now
        if len(self._buckets) <= self.bucket_limit:
            return

        stale_before = now - 120
        stale_keys = [
            key for key, bucket in self._buckets.items()
            if bucket.updated_at < stale_before
        ]
        for key in stale_keys:
            self._buckets.pop(key, None)

        if len(self._buckets) <= self.bucket_limit:
            return

        ordered_keys = sorted(
            self._buckets,
            key=lambda item: self._buckets[item].updated_at,
        )
        for key in ordered_keys[: len(self._buckets) - self.bucket_limit]:
            self._buckets.pop(key, None)

    def _client_ip(self, scope: Scope) -> str:
        headers = dict(scope.get("headers") or [])
        if self.trust_proxy_headers:
            forwarded_for = headers.get(b"x-forwarded-for")
            if forwarded_for:
                return forwarded_for.decode("latin1").split(",", 1)[0].strip()
            real_ip = headers.get(b"x-real-ip")
            if real_ip:
                return real_ip.decode("latin1").strip()

        client = scope.get("client")
        if isinstance(client, tuple) and client:
            return str(client[0])
        return "unknown"

    @staticmethod
    async def _reject(
        scope: Scope,
        receive: Receive,
        send: Send,
        limit: int,
        retry_after: int,
    ) -> None:
        response = JSONResponse(
            status_code=429,
            content={"detail": "Demasiadas solicitudes. Intenta nuevamente más tarde."},
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
            },
        )
        await response(scope, receive, send)
