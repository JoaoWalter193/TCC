import pandas as pd
from app.services.repository import get_proposicoes_por_vereador

def processar_ranking_vereadores():
    #df = get_proposicoes_por_vereador()

    #total = df['contagem'].sum()
    #df['porcentagem'] = (df['contagem']/total * 100).round(1)

    #return df.sort_values(by='porcentagem', ascending=False).to_dict('records') 
    return [
        {"vereador_nome": "Angelo Vanhoni", "contagem": 10, "porcentagem": 50.0},
        {"vereador_nome": "Outro Vereador", "contagem": 10, "porcentagem": 50.0}
    ]