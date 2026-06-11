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
    mysql_host: str = "mysql"
    mysql_port: int = 3306
    mysql_database: str = ""
    mysql_user: str = ""
    mysql_password: str = ""


@lru_cache
def get_settings() -> Settings:
    """读取最小运行配置。"""
    return Settings(
        app_env=getenv("APP_ENV", "local"),
        mysql_host=getenv("MYSQL_HOST", "mysql"),
        mysql_port=int(getenv("MYSQL_PORT", "3306")),
        mysql_database=getenv("MYSQL_DATABASE", ""),
        mysql_user=getenv("MYSQL_USER", ""),
        mysql_password=getenv("MYSQL_PASSWORD", ""),
    )
