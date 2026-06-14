FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

ARG AGENT_RUNTIME_PYPI_INDEX_URL="https://pypi.org/simple"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/services/agent-runtime

COPY services/agent-runtime/pyproject.toml ./pyproject.toml
COPY services/agent-runtime/README.md ./README.md

RUN python - <<'PY' > requirements.in
import tomllib
from pathlib import Path

project = tomllib.loads(Path("pyproject.toml").read_text())
for dependency in project["project"]["dependencies"]:
    print(dependency)
PY

RUN uv pip install --system --index-url "${AGENT_RUNTIME_PYPI_INDEX_URL}" -r requirements.in \
    && rm -f requirements.in

COPY services/agent-runtime/src ./src

EXPOSE 8000

CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
