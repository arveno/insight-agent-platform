"""Logging configuration for Agent Runtime."""

import logging


def configure_logging() -> None:
    """配置最小标准日志。"""
    logging.basicConfig(level=logging.INFO)
