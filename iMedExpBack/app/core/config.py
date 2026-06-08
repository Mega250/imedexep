import json
from functools import lru_cache
from urllib.parse import quote_plus, urlsplit

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "med_records"
    postgres_user: str = "postgres"
    postgres_password: str = ""

    @property
    def database_url(self) -> str:
        user = quote_plus(self.postgres_user)
        password = quote_plus(self.postgres_password)
        return (
            f"postgresql+asyncpg://{user}:{password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 30
    jwt_refresh_expire_days: int = 2

    encryption_key: str = ""

    app_env: str = "development"
    debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    max_request_body_bytes: int = Field(default=1_048_576, ge=1024, le=10_485_760)
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = Field(default=300, ge=1, le=10_000)
    rate_limit_auth_requests_per_minute: int = Field(default=20, ge=1, le=1_000)
    rate_limit_bucket_limit: int = Field(default=10_000, ge=100, le=1_000_000)
    trust_proxy_headers: bool = False
    cors_allow_origins: str | list[str] = ""
    cors_allow_origin_regex: str = ""
    mail_username: str = ""
    mail_password: str = ""
    mail_enabled: bool = False
    # SEP apagó el endpoint Solr público (search.sep.gob.mx) y el portal nuevo
    # exige reCAPTCHA v3, así que la verificación automática ya no es viable.
    # Se deja el flag por si se integra un proveedor de pago más adelante.
    cedula_verification_enabled: bool = False
    bootstrap_superadmin_email: str = ""
    bootstrap_superadmin_password: str = ""
    frontend_url: str = "http://localhost:8081"
    metrics_enabled: bool = False
    metrics_bearer_token: str = ""

    @field_validator("frontend_url", mode="before")
    @classmethod
    def validate_frontend_url(cls, value: object) -> str:
        normalized = str(value).strip().rstrip("/")
        parsed = urlsplit(normalized)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("frontend_url must be an absolute HTTP(S) URL")
        if parsed.username or parsed.password:
            raise ValueError("frontend_url cannot contain credentials")
        if parsed.query or parsed.fragment:
            raise ValueError("frontend_url cannot contain a query string or fragment")
        return normalized

    @model_validator(mode="after")
    def validate_environment(self) -> "Settings":
        if self.app_env == "production":
            missing = [
                field_name
                for field_name in ("jwt_secret_key", "encryption_key", "postgres_password")
                if not getattr(self, field_name)
            ]
            if missing:
                raise ValueError(f"Missing required production settings: {', '.join(missing)}")
            cors_origins = self._cors_origins_list()
            if not cors_origins:
                raise ValueError("cors_allow_origins must be set in production")
            if "*" in cors_origins:
                raise ValueError("cors_allow_origins cannot contain '*' in production")
            if self.debug:
                raise ValueError("debug must be false in production")
            if len(self.jwt_secret_key) < 32:
                raise ValueError("jwt_secret_key must be at least 32 characters in production")
            if self.jwt_algorithm not in {"HS256", "HS384", "HS512"}:
                raise ValueError("jwt_algorithm must use an explicit HMAC SHA algorithm")
            if self.metrics_enabled and len(self.metrics_bearer_token) < 32:
                raise ValueError("metrics_bearer_token must be at least 32 characters when metrics are enabled")
            if urlsplit(self.frontend_url).hostname in {"localhost", "127.0.0.1", "::1"}:
                raise ValueError("frontend_url must be externally reachable in production")
        return self

    @property
    def effective_cors_allow_origins(self) -> list[str]:
        cors_origins = self._cors_origins_list()
        if cors_origins:
            return cors_origins
        if self.app_env in {"development", "testing"}:
            return [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8081",
                "http://localhost:19006",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:19006",
            ]
        return []

    @property
    def effective_cors_allow_origin_regex(self) -> str | None:
        if self.cors_allow_origin_regex.strip():
            return self.cors_allow_origin_regex.strip()
        if self.app_env in {"development", "testing"}:
            # Túneles de desarrollo (Cloudflare, ngrok) + localhost en cualquier puerto.
            return (
                r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
                r"|^https://[a-z0-9-]+\.trycloudflare\.com$"
                r"|^https://[a-z0-9-]+\.ngrok(-free)?\.app$"
                r"|^https://[a-z0-9-]+\.ngrok\.io$"
            )
        return None

    def _cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_allow_origins, list):
            return self.cors_allow_origins

        raw = self.cors_allow_origins.strip()
        if not raw:
            return []
        if raw.startswith("["):
            parsed = json.loads(raw)
            if not isinstance(parsed, list):
                raise ValueError("cors_allow_origins JSON value must be a list")
            return [str(origin).strip() for origin in parsed if str(origin).strip()]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
