from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.services import pandas_engine
from app.core.database import get_db
from app.schemas.dashboard import DashboardCreate, DashboardResponse, ChartRequest
from app.models.dashboard import Dashboard
from app.services.pandas_engine import processar_ranking_vereadores

router = APIRouter()

@router.get("/metadata")
def read_metadata(db: Session = Depends(get_db)):
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

@router.post("/dashboard/preview")
def preview_chart(config: ChartRequest, db:Session = Depends(get_db)):
    data = pandas_engine.aggregate_dynamic_data(db, config)
    return {
        "chart_data": data,
        "config": config
    }

@router.post("/dashboards")
def create_dashboard(obj_in: DashboardCreate, db: Session = Depends(get_db)):
    new_dashboard = Dashboard(
        user_id=obj_in.user_id,
        title=obj_in.title,
        config=obj_in.config.model_dump()
    )
    db.add(new_dashboard)
    db.commit()
    db.refresh(new_dashboard)

    return new_dashboard

@router.get("/dashboards/user/{user_id}", response_model=List[DashboardResponse])
def list_user_dashboards(user_id: int, db: Session = Depends(get_db)):
    dashboards = db.query(Dashboard).filter(Dashboard.user_id == user.id).all()
    return dashboards
