"""
Transformação e persistência das proposições scrapadas do site da CMC.

Fluxo:
  transformar() — cruza dados scrapados com o banco, decide o que re-raspar,
                  aplica normalizações
  salvar()      — sincroniza tabelas auxiliares (tipo, estado, autor) e faz
                  UPSERT na tabela proposicao
"""

import time

import pandas as pd
from sqlalchemy import MetaData, Table
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import SQLAlchemyError

from . import config
from .scraper import buscar_detalhes_lote, limpar_data, normalizar_texto


def transformar(lista, session, engine):
    """
    Recebe a lista bruta do scraper e produz um DataFrame limpo e pronto
    para o UPSERT.

    Regras de atualização:
      • Se a proposição não existe no banco → incluída (nova)
      • Se existe e o *ultimo_tramite* scrapado é MAIS RECENTE que o do
        banco → incluída e os detalhes (texto/justificativa) são re-raspados
      • Se existe, mesma data, mas *texto* está nulo → incluída (re-raspa
        só o detalhe para preencher a lacuna)
      • Se existe e o scrapado é IGUAL ou MAIS VELHO que o do banco, e o
        texto já existe → pulada (nada mudou)
    """
    df = pd.DataFrame(lista)
    if df.empty:
        return df

    for col in df.columns:
        if col != "link_detalhe":
            df[col] = df[col].apply(normalizar_texto)

    df["codigo"] = (
        pd.to_numeric(df["codigo"].str.replace(r"\D", "", regex=True), errors="coerce")
        .astype("Int64")
    )
    df["data_envio"] = pd.to_datetime(
        df["data_envio_txt"].apply(limpar_data), dayfirst=True, errors="coerce"
    )
    df["ultimo_tramite"] = pd.to_datetime(
        df["ultimo_tramite_txt"].apply(limpar_data), dayfirst=True, errors="coerce"
    )
    df["data_efetivo"] = df["data_envio"]

    for col in ["razao", "localizacao", "ementa"]:
        df[col] = df[col].fillna("")

    df["tramite_alternativo"] = False
    estados_fim = [
        "arquivamento", "prejudicada", "aprovada",
        "promulgada", "concluído atendimento na cmc",
    ]
    df["encerrou_tramitacao"] = df["estado"].str.lower().isin(estados_fim)
    df["leis_similares"] = ""
    df["tag"] = ""


    print("Verificando registros existentes no banco...")
    try:
        query = """
            SELECT codigo, ultimo_tramite AS ultimo_tramite_db,
                   texto AS texto_db, justificativa AS justificativa_db,
                   leis_similares AS leis_similares_db
            FROM proposicao
        """
        existentes = pd.read_sql(query, engine)
        existentes["codigo"] = existentes["codigo"].astype("Int64")
        existentes["ultimo_tramite_db"] = pd.to_datetime(existentes["ultimo_tramite_db"])
        # Normaliza texto/justificativa/leis vazios do banco para NaN
        for col in ("texto_db", "justificativa_db", "leis_similares_db"):
            existentes[col] = existentes[col].replace("", None)
        df = df.merge(existentes, on="codigo", how="left")
    except Exception:
        print("Banco vazio ou tabela inexistente — todos serão tratados como novos.")
        df["texto_db"] = None
        df["justificativa_db"] = None
        df["leis_similares_db"] = None
        df["ultimo_tramite_db"] = pd.NaT

    # Verifica a data do ultimo tramite
    antes = len(df)
    mascara_novo = df["ultimo_tramite_db"].isna()
    mascara_atualizado = df["ultimo_tramite"] > df["ultimo_tramite_db"]
    mascara_lacuna = (
        (df["ultimo_tramite"] == df["ultimo_tramite_db"])
        & (df["texto_db"].isna() | df["justificativa_db"].isna())
    )

    df = df[mascara_novo | mascara_atualizado | mascara_lacuna].copy()
    depois = len(df)
    pulados = antes - depois
    if pulados:
        print(f"{pulados} proposicoes inalteradas (ultimo_tramite igual ou anterior)")

    if df.empty:
        return df

    precisa_buscar = []
    indices_busca = []
    textos = [None] * len(df)
    justificativas = [None] * len(df)
    leis_similares = [None] * len(df)

    for i, (_, row) in enumerate(df.iterrows()):
        # Reaproveita textos/leis do banco se ja existirem,
        # independentemente de ultimo_tramite ter mudado ou nao
        if (pd.notna(row["texto_db"])
                and pd.notna(row["justificativa_db"])
                and pd.notna(row["leis_similares_db"])):
            textos[i] = row["texto_db"]
            justificativas[i] = row["justificativa_db"]
            leis_similares[i] = row["leis_similares_db"]
        else:
            precisa_buscar.append(row["link_detalhe"])
            indices_busca.append(i)

    if precisa_buscar:
        print(f"Buscando detalhes de {len(precisa_buscar)} proposicoes em paralelo...")
        resultados = buscar_detalhes_lote(precisa_buscar, session)
        for idx, dados in zip(indices_busca, resultados):
            textos[idx] = dados["texto"]
            justificativas[idx] = dados["justificativa"]
            leis_similares[idx] = dados["leis_similares"]

    df["texto"] = textos
    df["justificativa"] = justificativas
    df["leis_similares"] = leis_similares

    # Converte strings vazias para none (viram null no banco)
    for col in ("texto", "justificativa", "leis_similares"):
        df[col] = df[col].replace("", None)

    df.drop(
        columns=["texto_db", "justificativa_db", "leis_similares_db", "ultimo_tramite_db"],
        errors="ignore", inplace=True,
    )
    df.dropna(subset=["codigo", "data_envio", "ultimo_tramite"], inplace=True)
    return df


def salvar(df, engine):

    if df.empty:
        print("Nenhum dado para salvar.")
        return

    # Tabela auxiliar (tipo_proposicao)
    tipos = df[["tipo"]].drop_duplicates()
    tipos_db = pd.read_sql("SELECT id AS tipo_id, tipo FROM tipo_proposicao", engine)
    novos_tipos = tipos[~tipos["tipo"].isin(tipos_db["tipo"])].copy()
    if not novos_tipos.empty:
        novos_tipos.to_sql("tipo_proposicao", engine, if_exists="append", index=False)
        tipos_db = pd.read_sql("SELECT id AS tipo_id, tipo FROM tipo_proposicao", engine)

    # Tabela auxiliar (estado_proposicao)
    estados = df[["estado"]].drop_duplicates()
    estados_db = pd.read_sql("SELECT id AS estado_id, estado FROM estado_proposicao", engine)
    novos_estados = estados[~estados["estado"].isin(estados_db["estado"])].copy()
    if not novos_estados.empty:
        novos_estados.to_sql("estado_proposicao", engine, if_exists="append", index=False)
        estados_db = pd.read_sql("SELECT id AS estado_id, estado FROM estado_proposicao", engine)

    # Normalizar autores da proposicao
    mapa_autores = {
        "Lorens Nogueira": "Lórens Nogueira",
        "João da 5 Irmãos": "João 5 Irmãos",
        "Da Costa do Perdeu Piá": "Da Costa",
        "Sergio R. B. Balaguer (Serginho do Posto)": "Serginho do Posto",
    }
    df["iniciativa_nome"] = df["iniciativa_nome"].replace(mapa_autores)

    vereadores_db = pd.read_sql("SELECT id AS vereador_id, nome FROM vereador", engine)

    final = df.merge(tipos_db, on="tipo", how="left")
    final = final.merge(estados_db, on="estado", how="left")
    final = final.merge(
        vereadores_db, left_on="iniciativa_nome", right_on="nome", how="left"
    )

    # Loga proposições que serão descartadas por falta de FK
    tamanho_antes = len(final)
    final.dropna(subset=["tipo_id", "estado_id", "vereador_id"], inplace=True)
    perdidos = tamanho_antes - len(final)
    if perdidos:
        print(f"   [ALERTA] {perdidos} proposicoes descartadas — FK não encontrada "
              "(tipo, estado ou vereador inexistente no banco).")

    colunas = [
        "codigo", "tipo_id", "vereador_id", "data_envio", "data_efetivo",
        "estado_id", "localizacao", "ultimo_tramite", "razao",
        "tramite_alternativo", "encerrou_tramitacao", "leis_similares",
        "ementa", "texto", "justificativa", "tag",
    ]
    inserir = final[colunas].copy()
    inserir = inserir.where(pd.notnull(inserir), None)
    registros = inserir.to_dict(orient="records")

    if not registros:
        print("Nenhum registro para inserir apos os filtros.")
        return

    try:
        metadata = MetaData()
        tabela = Table("proposicao", metadata, autoload_with=engine)

        stmt = insert(tabela).values(registros)
        colunas_update = {
            c.name: stmt.excluded[c.name]
            for c in tabela.columns
            if c.name != "codigo"
        }
        upsert = stmt.on_conflict_do_update(
            index_elements=["codigo"],
            set_=colunas_update,
        )

        with engine.begin() as conn:
            conn.execute(upsert)

        print(f"{len(inserir)} proposicoes salvas/atualizadas com sucesso!")
    except SQLAlchemyError as e:
        print(f"Erro no banco: {e}")
        backup = f"backup_emergencia_{int(time.time())}.csv"
        inserir.to_csv(backup, index=False, encoding="utf-8")
        print(f"Backup salvo em {backup}")
