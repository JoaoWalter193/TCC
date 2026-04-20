import pandas as pd
from app.services.repository import get_proposicoes_por_vereador

def processar_ranking_vereadores():
    df = get_proposicoes_por_vereador()

    total = df['contagem'].sum()
    df['porcentagem'] = (df['contagem']/total * 100).round(1)

    return df.sort_values(by='porcentagem', ascending=False).to_dict('records') 

def process_dynamic_table(config):
    data = [
        {"id": 1, "regiao": "Sul", "vendas": 100, "status": "OK"},
        {"id": 2, "regiao": "Norte", "vendas": 200, "status": "Pendentes"}
    ]
    df = pd.DataFrame(data)

    return {
        "columnDefs": [{"field": col} for col in df.columns],
        "rowData": df.to_dict('records')
    }