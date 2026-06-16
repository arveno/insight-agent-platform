#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
RUNTIME_ROOT = REPO_ROOT / "services" / "agent-runtime"
if str(RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(RUNTIME_ROOT))

from src.app.config import get_settings
from src.infrastructure.model_gateway.errors import ModelGatewayConfigurationError
from src.infrastructure.model_gateway.readiness import (
    build_model_provider_readiness_report,
    run_provider_smoke,
)


def load_env_file(env_file: Path) -> None:
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip()


def print_readiness(
    *,
    provider: str,
    model: str,
    base_url: str,
    api_format: str,
    api_key_status: str,
    status: str,
    latency_ms: int | None = None,
    prompt_tokens: int | None = None,
    completion_tokens: int | None = None,
    total_tokens: int | None = None,
    error_type: str | None = None,
    error_detail: str | None = None,
) -> None:
    print(f"provider={provider}")
    print(f"model={model}")
    print(f"baseUrl={base_url}")
    print(f"apiFormat={api_format}")
    print(f"apiKey={api_key_status}")
    print(f"status={status}")
    if latency_ms is not None:
        print(f"latencyMs={latency_ms}")
    if prompt_tokens is not None:
        print(f"usage.promptTokens={prompt_tokens}")
    if completion_tokens is not None:
        print(f"usage.completionTokens={completion_tokens}")
    if total_tokens is not None:
        print(f"usage.totalTokens={total_tokens}")
    if error_type is not None:
        print(f"errorType={error_type}")
    if error_detail is not None:
        print(f"errorDetail={error_detail}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke the active real model provider config.")
    parser.add_argument("--env-file", type=Path, help="Path to env file to load before smoke.")
    parser.add_argument("--provider", help="Override the active provider for a single-provider smoke.")
    args = parser.parse_args()

    if args.env_file is not None:
        if not args.env_file.exists():
            print(f"status=missing_env_file path={args.env_file}")
            return 2
        load_env_file(args.env_file)

    get_settings.cache_clear()
    settings = get_settings()

    try:
        readiness = build_model_provider_readiness_report(settings, provider_name=args.provider)
    except ModelGatewayConfigurationError as exc:
        provider_name = (args.provider or settings.model_gateway.active_provider or "<missing>").strip()
        print(f"provider={provider_name or '<missing>'}")
        if exc.code == "missing_api_key":
            print("apiKey=missing")
        else:
            print("apiKey=unknown")
        print(f"status={exc.code}")
        print(f"errorType={exc.code}")
        return 2

    result = run_provider_smoke(
        readiness,
        timeout_ms=settings.model_gateway.timeout_ms,
        max_tokens=settings.model_gateway.max_tokens,
        temperature=settings.model_gateway.temperature,
        enable_thinking=settings.model_gateway.enable_thinking,
    )
    print_readiness(
        provider=readiness.provider,
        model=readiness.model,
        base_url=readiness.base_url,
        api_format=readiness.api_format,
        api_key_status=readiness.api_key_status,
        status=result.status,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        completion_tokens=result.completion_tokens,
        total_tokens=result.total_tokens,
        error_type=result.error_type,
        error_detail=result.error_detail,
    )
    return result.exit_code


if __name__ == "__main__":
    raise SystemExit(main())
