from fastapi import APIRouter
from sqlalchemy.orm import Session
from app.services import pandas_engine
from app.core.database import get_db
from app.schemas.dashboard import TableRequest, TableResponse
from app.services.pandas_engine import processar_ranking_vereadores

router = APIRouter()

@router.get("/metadata")
def read_metadata(db: Session = get_db()):
    return pandas_engine.get_dashboard_metadata(db)

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