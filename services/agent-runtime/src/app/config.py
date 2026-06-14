"""Runtime configuration."""

from dataclasses import dataclass
from functools import lru_cache
from os import getenv


def _read_bool_env(name: str, default: bool) -> bool:
    raw_value = getenv(name)
    if raw_value is None:
        return default
    return raw_value.lower() in {"1", "true", "yes", "on"}


def _read_csv_env(name: str) -> tuple[str, ...]:
    raw_value = getenv(name, "")
    values = [value.strip() for value in raw_value.split(",")]
    return tuple(value for value in values if value)


@dataclass(frozen=True)
class Settings:
    """Agent Runtime 最小配置。"""

    service_name: str = "agent-runtime"
    version: str = "0.1.0"
    app_env: str = "local"
    mysql_host: str = "mysql"
    mysql_port: int = 3306
    mysql_database: str = ""
    mysql_user: str = ""
    mysql_password: str = ""
    auth_session_cookie_name: str = "iap_auth_session"
    auth_session_cookie_samesite: str = "lax"
    auth_session_cookie_secure: bool = False
    auth_session_ttl_seconds: int = 2_592_000
    cors_allowed_origins: tuple[str, ...] = ()


@lru_cache
def get_settings() -> Settings:
    """读取最小运行配置。"""
    app_env = getenv("APP_ENV", "local")
    return Settings(
        app_env=app_env,
        mysql_host=getenv("MYSQL_HOST", "mysql"),
        mysql_port=int(getenv("MYSQL_PORT", "3306")),
        mysql_database=getenv("MYSQL_DATABASE", ""),
        mysql_user=getenv("MYSQL_USER", ""),
        mysql_password=getenv("MYSQL_PASSWORD", ""),
        auth_session_cookie_name=getenv("AUTH_SESSION_COOKIE_NAME", "iap_auth_session"),
        auth_session_cookie_samesite=getenv("AUTH_SESSION_COOKIE_SAMESITE", "lax"),
        auth_session_cookie_secure=_read_bool_env(
            "AUTH_SESSION_COOKIE_SECURE",
            default=app_env != "local",
        ),
        auth_session_ttl_seconds=int(getenv("AUTH_SESSION_TTL_SECONDS", "2592000")),
        cors_allowed_origins=_read_csv_env("CORS_ALLOWED_ORIGINS"),
    )
