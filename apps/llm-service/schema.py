from typing import Literal, Optional, List
from pydantic import BaseModel, Field

class RouteField(BaseModel):
    type: Literal["array", "object"]
    fields: List[str]

class Route(BaseModel):
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE"]
    path: str
    protected: bool = False
    response: RouteField
    latency_base_ms: int = 50
    latency_jitter_ms: int = 100
    error_rate: float = Field(ge=0.0, le=1.0, default=0.0)
    rate_limit_per_minute: Optional[int] = None

class RouteConfig(BaseModel):
    name: str
    routes: List[Route]
