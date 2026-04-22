import pandas as pd
from app.core.database import engine

def get_proposicoes_por_vereador():
    query = """
    SELECT
        v.nome AS vereador,
        COUNT(p.id) as contagem
    FROM proposicao p
    JOIN vereador v ON p.fk_vereador_proposicao = v.id
    GROUP BY v.nome
    """
    return pd.read_sql(query, engine)