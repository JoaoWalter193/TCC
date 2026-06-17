import time

import pandas as pd
import requests
from sqlalchemy import create_engine, text

from . import config


def enriquecer_dados():
    print("Iniciando rotina de enriquecimento de tags...")
    engine = create_engine(config.DATABASE_URL)

    query_busca = """
        SELECT codigo, ementa, justificativa
        FROM proposicao
        WHERE tag IS NULL OR tag = ''
    """

    with engine.connect() as conn:
        df = pd.read_sql(text(query_busca), conn)

    if df.empty:
        print("Todas as proposições já possuem tag. Nada a fazer.")
        return

    total = len(df)
    print(f"Encontradas {total} proposições sem tag. Iniciando requisições para a API...")

    tags_calculadas = []

    with requests.Session() as session:
        for index, row in df.iterrows():
            payload = {
                "ementa": str(row["ementa"]) if pd.notna(row["ementa"]) else "",
                "justificativa": str(row["justificativa"]) if pd.notna(row["justificativa"]) else ""
            }

            tag_retornada = "administrativo"
            sucesso = False

            for tentativa in range(3):
                try:
                    resp = session.post(config.TAG_API_URL, json=payload, timeout=15)
                    resp.raise_for_status()
                    tag_retornada = resp.json().get("tag", "administrativo")
                    sucesso = True
                    break
                except requests.exceptions.Timeout:
                    if tentativa < 2:
                        time.sleep(2 ** tentativa)
                except requests.exceptions.RequestException as e:
                    print(f"[{index+1}/{total}] Erro ao classificar código {row['codigo']}: {e}")
                    break

            if sucesso:
                print(f"[{index+1}/{total}] Código {row['codigo']} -> Tag: {tag_retornada}")

            tags_calculadas.append({
                "codigo": row["codigo"],
                "tag": tag_retornada
            })

            time.sleep(1.0)

    df_update = pd.DataFrame(tags_calculadas)

    query_update = text("""
        UPDATE proposicao
        SET tag = :tag
        WHERE codigo = :codigo
    """)

    parametros = df_update.to_dict(orient="records")

    print(f"Salvando {len(parametros)} tags no banco de dados...")

    with engine.begin() as conn:
        conn.execute(query_update, parametros)

    print("Enriquecimento finalizado com sucesso!")


if __name__ == "__main__":
    enriquecer_dados()
