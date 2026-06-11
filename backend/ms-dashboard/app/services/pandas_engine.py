import pandas as pd
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.dashboard import Proposicao, Vereador, Partido
from app.schemas.dashboard import ChartRequest


def get_flattened_data(db: Session):
    query = db.query(
        Proposicao.codigo,
        Proposicao.data_envio,
        Proposicao.tag,
        Vereador.nome.label("vereador_nome"),
        Vereador.genero,
        Partido.nomepartido.label("partido_nome")
    ).join(Vereador, Proposicao.vereador_id == Vereador.id) \
     .join(Partido, Vereador.partido_id == Partido.id)

    df = pd.read_sql(query.statement, db.bind)
    return df


def get_dashboard_metadata(db: Session):
    df = get_flattened_data(db)

    metadata = {}
    for column in df.columns:
        dtype = (
            "numeric" if df[column].dtype in ("int64", "float64")
            else "date" if df[column].dtype == "datetime64[ns]"
            else "categorical"
        )
        metadata[column] = {
            "label": column.replace("_", " ").title(),
            "dtype": dtype,
            "options": df[column].dropna().unique().tolist() if dtype == "categorical" else []
        }
    return metadata


def processar_ranking_vereadores(db: Session):
    resultado = db.query(
        Vereador.nome.label("vereador_nome"),
        func.count(Proposicao.codigo).label("contagem")
    ).join(Proposicao, Vereador.id == Proposicao.vereador_id) \
     .group_by(Vereador.id, Vereador.nome) \
     .order_by(func.count(Proposicao.codigo).desc()) \
     .all()

    total = sum(row.contagem for row in resultado) if resultado else 0

    return [
        {
            "vereador_nome": row.vereador_nome,
            "contagem": row.contagem,
            "porcentagem": round((row.contagem / total) * 100, 2) if total > 0 else 0.0
        }
        for row in resultado
    ]


def _build_hierarchy(df, levels, value_col):
    if not levels:
        return []

    current_level = levels[0]
    remaining = levels[1:]
    nodes = []

    grouped = df.groupby(current_level, observed=True)[value_col].sum().reset_index()

    for _, row in grouped.iterrows():
        node = {"name": str(row[current_level])}

        if remaining:
            mask = df[current_level] == row[current_level]
            node["children"] = _build_hierarchy(df[mask], remaining, value_col)
            node["value"] = float(row[value_col])
        else:
            node["value"] = float(row[value_col])

        nodes.append(node)

    return nodes


def aggregate_dynamic_data(db: Session, config: ChartRequest):
    df = get_flattened_data(db)

    if not config.levels and not config.x_axis:
        raise ValueError("Nenhum nível de agrupamento fornecido. Envie 'levels' ou 'x_axis'.")

    if config.filters:
        for column, values in config.filters.items():
            if column in df.columns:
                df = df[df[column].isin(values)]

    if config.levels:
        levels = config.levels
        metric = config.metric or "codigo"

        if config.operation == "count":
            grouped = df.groupby(levels, observed=True).size().reset_index(name="count")
            value_col = "count"
        elif config.operation == "sum":
            grouped = df.groupby(levels, observed=True)[metric].sum().reset_index()
            value_col = metric
        else:
            grouped = df.groupby(levels, observed=True)[metric].mean().reset_index()
            value_col = metric

        tree = _build_hierarchy(grouped, levels, value_col)
        flat = grouped.to_dict(orient="records")

        return {
            "type": "hierarchy",
            "tree": tree,
            "flat": flat,
            "levels": levels,
            "value_col": value_col,
            "total": float(grouped[value_col].sum())
        }

    x_axis = config.x_axis
    y_axis = config.y_axis or "codigo"

    if config.operation == "count":
        result = df.groupby(x_axis, observed=True)[y_axis].count().reset_index()
    elif config.operation == "sum":
        result = df.groupby(x_axis, observed=True)[y_axis].sum().reset_index()
    else:
        result = df.groupby(x_axis, observed=True)[y_axis].mean().reset_index()

    result.columns = ["label", "value"]

    return {
        "type": "flat",
        "data": result.to_dict(orient="records")
    }
