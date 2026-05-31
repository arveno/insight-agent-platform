"""Health response schema."""

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    """GET /health response."""

    model_config = ConfigDict(extra="forbid")

    status: str
    service: str
    version: str
