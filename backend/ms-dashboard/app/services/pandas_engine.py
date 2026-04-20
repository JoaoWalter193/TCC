import pandas as pd

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