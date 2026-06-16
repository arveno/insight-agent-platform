"""Runtime configuration."""

from dataclasses import dataclass, field
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


MODEL_PROVIDER_NAMES: tuple[str, ...] = ("siliconflow", "zhipu")


@dataclass(frozen=True)
class ModelProviderSettings:
    """单个真实模型 provider 的配置表面。"""

    name: str
    api_format: str = ""
    base_url: str = ""
    chat_completions_path: str = ""
    default_model: str = ""
    api_key: str = ""

    def api_key_configured(self) -> bool:
        return bool(self.api_key)


@dataclass(frozen=True)
class ModelGatewaySettings:
    """Model Gateway 配置读取结果。"""

    active_provider: str = ""
    providers: tuple[ModelProviderSettings, ...] = ()
    max_tokens: int = 512
    timeout_ms: int = 30_000
    temperature: float = 0.2
    enable_thinking: bool = False
    real_api_required: bool = True

    def provider(self, provider_name: str) -> ModelProviderSettings | None:
        normalized_name = provider_name.strip().lower()
        for provider in self.providers:
            if provider.name == normalized_name:
                return provider
        return None


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
    model_gateway: ModelGatewaySettings = field(default_factory=ModelGatewaySettings)


def _read_model_provider_settings(provider_name: str) -> ModelProviderSettings:
    provider_token = provider_name.upper()
    prefix = f"IAP_MODEL_PROVIDER_{provider_token}"
    return ModelProviderSettings(
        name=provider_name,
        api_format=getenv(f"{prefix}_API_FORMAT", "").strip(),
        base_url=getenv(f"{prefix}_BASE_URL", "").strip(),
        chat_completions_path=getenv(f"{prefix}_CHAT_COMPLETIONS_PATH", "").strip(),
        default_model=getenv(f"{prefix}_DEFAULT_MODEL", "").strip(),
        api_key=getenv(f"{prefix}_API_KEY", "").strip(),
    )


@lru_cache
def get_settings() -> Settings:
    """读取最小运行配置。"""
    app_env = getenv("APP_ENV", "local")
    model_gateway_settings = ModelGatewaySettings(
        active_provider=getenv("IAP_MODEL_ACTIVE_PROVIDER", "").strip().lower(),
        providers=tuple(
            _read_model_provider_settings(provider_name)
            for provider_name in MODEL_PROVIDER_NAMES
        ),
        max_tokens=int(getenv("IAP_MODEL_MAX_TOKENS", "512")),
        timeout_ms=int(getenv("IAP_MODEL_TIMEOUT_MS", "30000")),
        temperature=float(getenv("IAP_MODEL_TEMPERATURE", "0.2")),
        enable_thinking=_read_bool_env("IAP_MODEL_ENABLE_THINKING", default=False),
        real_api_required=_read_bool_env("IAP_MODEL_REAL_API_REQUIRED", default=True),
    )
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
        model_gateway=model_gateway_settings,
    )
