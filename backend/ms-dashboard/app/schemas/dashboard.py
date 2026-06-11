from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime


class ChartRequest(BaseModel):
    title: str
    chart_type: str
    operation: str = "count"
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    levels: Optional[List[str]] = None
    metric: Optional[str] = None
    filters: Optional[Dict[str, List[str]]] = None


class DashboardCreateRequest(BaseModel):
    usuario_id: int
    titulo: str
    chart_type: str
    config: ChartRequest


class DashboardUpdateRequest(BaseModel):
    titulo: str
    chart_type: str
    config: ChartRequest


class DashboardResponse(BaseModel):
    id: int
    usuario_id: int
    titulo: str
    chart_type: str
    config: Any
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HierarchyNode(BaseModel):
    name: str
    value: Optional[float] = None
    children: Optional[List['HierarchyNode']] = None
