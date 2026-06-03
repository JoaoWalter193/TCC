from pydantic import BaseModel
from typing import Optional, Dict, List, Any

class ChartRequest(BaseModel):
    title: str
    chart_type: str
    operation: str = "count"
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    levels: Optional[List[str]] = None
    metric: Optional[str] = None
    filters: Optional[Dict[str, List[str]]] = None

class DashboardCreate(BaseModel):
    user_id: int
    title: str
    config: ChartRequest

class DashboardResponse(BaseModel):
    id: int
    user_id: int
    title: str
    config: Any

    class Config:
        from_attributes = True

class HierarchyNode(BaseModel):
    name: str
    value: Optional[float] = None
    children: Optional[List['HierarchyNode']] = None
