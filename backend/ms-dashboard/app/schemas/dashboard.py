from pydantic import BaseModel
from typing import List, Any

class TableRequest(BaseModel):
    table_type: str
    dimensions: List[str]
    metrics: List[str]

class TableResponse(BaseModel):
    columnDefs: List[Any]
    rowData: List[Any]