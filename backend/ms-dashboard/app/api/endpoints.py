from fastapi import APIRouter
from app.schemas.dashboard import TableRequest, TableResponse
from app.services.pandas_engine import process_dynamic_table

router = APIRouter()

@router.post("/generate-table", response_model=TableResponse)
def generate_table(request: TableRequest):
    result = process_dynamic_table(request)
    return result