from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.services import pandas_engine
from app.core.database import get_db
from app.schemas.dashboard import (
    DashboardCreateRequest,
    DashboardUpdateRequest,
    DashboardResponse,
    ChartRequest,
)
from app.models.dashboard import Dashboard
from app.services.pandas_engine import processar_ranking_vereadores

router = APIRouter()


# ── Metadata ──────────────────────────────────────────────────────────────


@router.get("/metadata")
def read_metadata(db: Session = Depends(get_db)):
    return pandas_engine.get_dashboard_metadata(db)


# ── Default ranking (Visão Geral) ────────────────────────────────────────


@router.get("/dashboard/default")
def get_ranking_vereadores(db: Session = Depends(get_db)):
    dados_processados = processar_ranking_vereadores(db)

    return {
        "columnDefs": [
            {"headerName": "Vereador", "field": "vereador_nome", "sortable": True},
            {"headerName": "Contagem", "field": "contagem"},
            {"headerName": "Porcentagem", "field": "porcentagem"},
        ],
        "rowData": dados_processados,
    }


# ── Chart preview ────────────────────────────────────────────────────────


@router.post("/dashboard/preview")
def preview_chart(config: ChartRequest, db: Session = Depends(get_db)):
    try:
        data = pandas_engine.aggregate_dynamic_data(db, config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"chart_data": data, "config": config}


# ── Dashboard CRUD ───────────────────────────────────────────────────────


@router.get("/dashboards", response_model=List[DashboardResponse])
def list_dashboards(
    user_id: int = Query(..., description="ID do usuário"),
    db: Session = Depends(get_db),
):
    dashboards = (
        db.query(Dashboard)
        .filter(Dashboard.usuario_id == user_id)
        .order_by(Dashboard.updated_at.desc())
        .all()
    )
    return dashboards


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
def get_dashboard(dashboard_id: int, db: Session = Depends(get_db)):
    dashboard = (
        db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard não encontrado")
    return dashboard


@router.post("/dashboards", response_model=DashboardResponse, status_code=201)
def create_dashboard(
    obj_in: DashboardCreateRequest, db: Session = Depends(get_db)
):
    new_dashboard = Dashboard(
        usuario_id=obj_in.usuario_id,
        titulo=obj_in.titulo,
        chart_type=obj_in.chart_type,
        config=obj_in.config.model_dump(),
    )
    db.add(new_dashboard)
    db.commit()
    db.refresh(new_dashboard)
    return new_dashboard


@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse)
def update_dashboard(
    dashboard_id: int,
    obj_in: DashboardUpdateRequest,
    db: Session = Depends(get_db),
):
    dashboard = (
        db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard não encontrado")

    dashboard.titulo = obj_in.titulo
    dashboard.chart_type = obj_in.chart_type
    dashboard.config = obj_in.config.model_dump()

    db.commit()
    db.refresh(dashboard)
    return dashboard


@router.delete("/dashboards/{dashboard_id}")
def delete_dashboard(dashboard_id: int, db: Session = Depends(get_db)):
    dashboard = (
        db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard não encontrado")

    db.delete(dashboard)
    db.commit()
    return {"ok": True}


# ── Load saved dashboard data ────────────────────────────────────────────


@router.get("/dashboard/{dashboard_id}/data")
def get_dashboard_data(dashboard_id: int, db: Session = Depends(get_db)):
    dashboard = (
        db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    cfg = dict(dashboard.config)
    if "char_type" in cfg and "chart_type" not in cfg:
        cfg["chart_type"] = cfg.pop("char_type")

    config = ChartRequest(**cfg)
    try:
        data = pandas_engine.aggregate_dynamic_data(db, config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"dashboard": dashboard, "chart_data": data}


# ── Backward-compatible aliases (deprecated) ─────────────────────────────


@router.get("/dashboards/user/{user_id}", response_model=List[DashboardResponse])
def list_user_dashboards_legacy(user_id: int, db: Session = Depends(get_db)):
    dashboards = (
        db.query(Dashboard)
        .filter(Dashboard.usuario_id == user_id)
        .order_by(Dashboard.updated_at.desc())
        .all()
    )
    return dashboards
