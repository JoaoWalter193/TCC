from pydantic import BaseModel
from typing import Optional, Dict, List, Any

class ChartRequest(BaseModel):
    title: str
    char_type: str
    x_axis: str
    y_axis: str
    operation: str
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