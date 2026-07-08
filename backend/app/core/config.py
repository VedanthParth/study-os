"""Central application configuration.

Every configurable value in StudyOS is loaded through the single ``Settings``
object defined here. Nothing in the codebase should read ``os.environ`` directly
or assume where the application is running (localhost, a fixed port, a local
database, etc.). Behaviour is determined by configuration alone, so the exact
same codebase can run in development, Docker, a VPS, or any managed platform by
changing environment variables only.

Resolution order (highest priority first):
    1. Real environment variables.
    2. Values in the ``.env`` file next to the backend root.
    3. The defaults declared on ``Settings``.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# Repository-relative anchor: ``backend/`` (three levels up from this file:
# app/core/config.py -> app/core -> app -> backend).
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Sentinel used to detect that the security key was never configured. Startup
# fails in non-development environments while this value is still in place.
_INSECURE_SECRET = "dev-insecure-secret-change-me"

Environment = Literal["development", "testing", "staging", "production"]


class Settings(BaseSettings):
    """Type-safe, environment-driven application settings."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "StudyOS API"
    ENVIRONMENT: Environment = "development"
    DEBUG: bool = False

    # ── Server ───────────────────────────────────────────────────────────────
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    API_PREFIX: str = "/api"

    # ── Database ─────────────────────────────────────────────────────────────
    # Leave empty to fall back to a local SQLite file under ``backend/database``.
    # Set to a full SQLAlchemy URL (e.g. postgresql+psycopg://...) in deployment.
    DATABASE_URL: str = ""

    # ── Security ─────────────────────────────────────────────────────────────
    # Not yet consumed (no auth in this milestone) but required so that every
    # downstream environment is forced to provide a real secret before auth lands.
    SECRET_KEY: str = _INSECURE_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Accepts a JSON array or a comma-separated string of origins. ``NoDecode``
    # disables pydantic-settings' automatic JSON decoding so the validator below
    # can also accept the (friendlier) comma-separated form.
    BACKEND_CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # ── Logging ──────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── Future: AI providers (documented, currently unused) ──────────────────
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    OPENROUTER_API_KEY: str | None = None
    OLLAMA_BASE_URL: str | None = None

    # ── Future: storage (documented, currently unused) ───────────────────────
    STORAGE_PROVIDER: str = "local"

    # ── Future: email (documented, currently unused) ─────────────────────────
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None

    # ── Derived helpers ──────────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    # ── Validation / defaults ────────────────────────────────────────────────
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _assemble_cors_origins(cls, value: object) -> object:
        """Allow a comma-separated string or a JSON array of origins."""
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                import json

                return json.loads(stripped)
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value

    @field_validator("LOG_LEVEL", mode="before")
    @classmethod
    def _normalise_log_level(cls, value: object) -> object:
        if isinstance(value, str):
            return value.upper()
        return value

    @model_validator(mode="after")
    def _finalise(self) -> Settings:
        # Provide a sensible local default for the database so development needs
        # zero configuration, while deployments supply a full DATABASE_URL.
        if not self.DATABASE_URL:
            db_path = BACKEND_DIR / "database" / "studyos.db"
            # SQLAlchemy SQLite URLs use forward slashes on every platform.
            self.DATABASE_URL = f"sqlite:///{db_path.as_posix()}"

        # Fail fast: a real secret is mandatory outside of local development.
        if self.ENVIRONMENT in ("staging", "production") and self.SECRET_KEY == _INSECURE_SECRET:
            raise ValueError(
                "SECRET_KEY must be set to a secure, non-default value when "
                f"ENVIRONMENT={self.ENVIRONMENT!r}."
            )

        return self


@lru_cache
def get_settings() -> Settings:
    """Return the cached, validated settings instance.

    Cached so the ``.env`` file and environment are read exactly once. Prefer
    importing the module-level ``settings`` object, or depend on ``get_settings``
    where dependency injection is useful (e.g. overriding in tests).
    """
    return Settings()


# Convenient module-level singleton for non-DI call sites.
settings = get_settings()
