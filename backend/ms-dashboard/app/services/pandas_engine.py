import pandas as pd
from sqlalchemy.orm import Session
from app.models.dashboard import Proposicao, Vereador, Partido
from app.schemas.dashboard import ChartRequest
from app.services.repository import get_proposicoes_por_vereador

def get_flattened_data(db: Session):
    query = db.query(
        Proposicao.codigo,
        Proposicao.data_envio,
        Proposicao.tag,
        Vereador.nome.label("vereador_nome"),
        Vereador.genero,
        Partido.nomepartido.label("partido_nome")
    ).join(Vereador, Proposicao.vereador_id == Vereador.id)\
     .join(Partido, Vereador.partido_id == Partido.id)

    df = pd.read_sql(query.statement, db.bind)
    return df

def get_dashboard_metadata(db: Session):
    df = get_flattened_data(db)
    
    metadata = {}
    for column in df.columns:
        metadata[column] = {
            "label": column.replace("_", " ").title(),
            "options": df[column].unique().tolist() if df[column].dtype == 'object' else []
        }
    return metadata

def processar_ranking_vereadores():
    #df = get_proposicoes_por_vereador()

    #total = df['contagem'].sum()
    #df['porcentagem'] = (df['contagem']/total * 100).round(1)

    #return df.sort_values(by='porcentagem', ascending=False).to_dict('records') 
    return [
        {"vereador_nome": "Angelo Vanhoni", "contagem": 10, "porcentagem": 50.0},
        {"vereador_nome": "Outro Vereador", "contagem": 10, "porcentagem": 50.0}
    ]

def aggregate_dynamic_data(db: Session, config: ChartRequest):
    df = get_flattened_data(db)

    if config.filters:
        for column, values in config.filters.items():
            df = df[df[column].isin(values)]
    
    if config.operation == "count":
        result = df.groupby(config.x_axis)[config.y_axis].count().reset_index()
    elif config.operation == "sum":
        result = df.groupby(config.x_axis)[config.y_axis].sum().reset_index()
    else:
        result = df.groupby(config.x_axis)[config.y_axis].mean().reset_index()

    result.columns = ['label', 'value']

    return result.to_dict(orient='records')    