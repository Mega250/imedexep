import logging
import time

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.metrics import metrics_collector
from app.core.middleware import MaxBodySizeMiddleware, RateLimitMiddleware
from app.api.v1 import (
    admin,
    appointments,
    auth,
    clinical_extras,
    clinical_history,
    clinical_readings,
    consultations,
    doctor,
    emergency_contacts,
    institutions,
    invitations,
    medications,
    menstrual_cycles,
    patient_institution,
    patients,
    personal_log,
    prescriptions,
    qr_record_access,
    screen_access,
    secretary,
    vitals
)
from app.api.deps import get_plain_session

logger = logging.getLogger(__name__)


def _docs_enabled(app_env: str) -> bool:
    return app_env in {"development", "testing"}


docs_enabled = _docs_enabled(settings.app_env)

app = FastAPI(
    title="imedexp API",
    debug=settings.debug,
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)


@app.on_event("startup")
async def _bootstrap_superadmin() -> None:
    if not (settings.bootstrap_superadmin_email and settings.bootstrap_superadmin_password):
        return
    from sqlalchemy import text
    from app.core.database import AsyncSessionLocal
    from app.core.security import hash_password
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(
                text("SELECT fn_bootstrap_superadmin(:email, :hash)"),
                {
                    "email": settings.bootstrap_superadmin_email,
                    "hash": hash_password(settings.bootstrap_superadmin_password),
                },
            )
            await session.commit()
        logger.info("bootstrap superadmin ensured")
    except Exception as exc:
        logger.warning("bootstrap superadmin failed: %s", exc)


app.add_middleware(
    RateLimitMiddleware,
    enabled=settings.rate_limit_enabled,
    requests_per_minute=settings.rate_limit_requests_per_minute,
    auth_requests_per_minute=settings.rate_limit_auth_requests_per_minute,
    bucket_limit=settings.rate_limit_bucket_limit,
    trust_proxy_headers=settings.trust_proxy_headers,
)
app.add_middleware(
    MaxBodySizeMiddleware,
    max_body_size=settings.max_request_body_bytes,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.effective_cors_allow_origins,
    allow_origin_regex=settings.effective_cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception:
        metrics_collector.record(
            request.method,
            request.url.path,
            500,
            time.perf_counter() - started_at,
        )
        raise

    if request.url.path != "/metrics":
        metrics_collector.record(
            request.method,
            request.url.path,
            status_code,
            time.perf_counter() - started_at,
        )
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "accelerometer=(), autoplay=(), camera=(), geolocation=(), "
        "gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
    )
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; object-src 'none'; base-uri 'self'; "
        "frame-ancestors 'none'; form-action 'self'; img-src 'self' data:"
    )
    return response

@app.exception_handler(IntegrityError)
async def handle_integrity_error(request, exc: IntegrityError):
    logger.warning("Database integrity error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=409,
        content={"detail": "Conflicto con datos existentes o inválidos"},
    )

@app.exception_handler(SQLAlchemyError)
async def handle_database_error(request, exc: SQLAlchemyError):
    logger.exception("Database error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=503,
        content={"detail": "Servicio de base de datos no disponible"},
    )

@app.exception_handler(Exception)
async def handle_unexpected_error(request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"},
    )

app.include_router(auth.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(institutions.router, prefix="/api/v1")
app.include_router(doctor.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")
app.include_router(patient_institution.router, prefix="/api/v1")
app.include_router(qr_record_access.router, prefix="/api/v1")
app.include_router(emergency_contacts.router, prefix="/api/v1")
app.include_router(clinical_history.router, prefix="/api/v1")
app.include_router(clinical_extras.router, prefix="/api/v1")
app.include_router(clinical_readings.router, prefix="/api/v1")
app.include_router(screen_access.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(consultations.router, prefix="/api/v1")
app.include_router(secretary.router, prefix= "/api/v1")
app.include_router(invitations.router, prefix="/api/v1")
app.include_router(prescriptions.router, prefix="/api/v1")
app.include_router(vitals.router, prefix="/api/v1")
app.include_router(medications.router, prefix="/api/v1")
app.include_router(menstrual_cycles.router, prefix="/api/v1")
app.include_router(personal_log.router, prefix="/api/v1")


@app.get("/metrics", include_in_schema=False)
async def metrics(request: Request):
    if not settings.metrics_enabled:
        raise HTTPException(status_code=404, detail="Not Found")

    expected = settings.metrics_bearer_token
    authorization = request.headers.get("authorization", "")
    if not expected or authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    return Response(
        content=metrics_collector.render(),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


@app.get("/live", tags=["infrastructure"])
async def live():
    return {"status": "ok"}


async def _database_health(session: AsyncSession) -> dict[str, str]:
    try:
        await session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "unavailable"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "db": db_status,
    }


@app.get("/ready", tags=["infrastructure"])
async def ready(session: AsyncSession = Depends(get_plain_session)):
    return await _database_health(session)


@app.get("/health", tags=["infrastructure"])
async def health(session: AsyncSession = Depends(get_plain_session)):
    return await _database_health(session)
