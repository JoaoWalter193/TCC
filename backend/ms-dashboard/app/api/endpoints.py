from fastapi import APIRouter
from app.schemas.dashboard import TableRequest, TableResponse
from app.services.pandas_engine import process_dynamic_table
from app.services.pandas_engine import processar_ranking_vereadores

router = APIRouter()

@router.get("/dashboard/default")
def get_ranking_vereadores():
    dados_processados = processar_ranking_vereadores()

    return {
        "columnDefs": [
            {"headerName": "Vereador", "field": "vereador_nome", "sortable": True},
            {"headerName": "Contagem", "field": "contagem"},
            {"headerName": "Porcentagem", "field": "porcentagem"}
        ],
        "rowData": dados_processados
    }

@router.post("/generate-table", response_model=TableResponse)
def generate_table(request: TableRequest):
    result = process_dynamic_table(request)
    return result