"""Runtime configuration."""

from dataclasses import dataclass
from functools import lru_cache
from os import getenv


@dataclass(frozen=True)
class Settings:
    """Agent Runtime 最小配置。"""

    service_name: str = "agent-runtime"
    version: str = "0.1.0"
    app_env: str = "local"


@lru_cache
def get_settings() -> Settings:
    """读取最小运行配置。"""
    return Settings(app_env=getenv("APP_ENV", "local"))
