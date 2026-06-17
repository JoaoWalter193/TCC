import contextlib
import os
import re
import time
import unicodedata

import numpy as np
import pandas as pd
import requests
import tabula
from bs4 import BeautifulSoup
from sqlalchemy import create_engine, text

from . import config

def normalizar_txt(texto):
    if pd.isna(texto):
        return ""
    return re.sub(r'[\r\n\s]+', ' ', str(texto)).strip()


def normalizar_url(nome):
    excecoes = {
        "joao 5 irmaos": "joao-da-5-irmaos",
        "giorgia prates - mandata preta": "giorgia-prates",
    }

    nome_normalizado = normalizar_txt(nome).lower()
    nome_sem_acento = unicodedata.normalize('NFKD', nome_normalizado).encode('ascii', 'ignore').decode('utf-8')

    if nome_sem_acento in excecoes:
        return excecoes[nome_sem_acento]

    caracter = nome_sem_acento
    caracter = re.sub(r'[^a-z0-9]', ' ', caracter)
    return "-".join(caracter.split())

def extrair_dados_pdf(url_pdf):
    with open(os.devnull, 'w') as devnull:
        with contextlib.redirect_stderr(devnull):
            tabelas = tabula.read_pdf(url_pdf, pages='all', multiple_tables=True)

    df_pt1 = tabelas[1].copy()
    df_pt2 = tabelas[2].copy()

    colunas_pt2 = df_pt2.columns.tolist()
    primeira_col = str(colunas_pt2[0]).upper()

    if "VEREADOR" not in primeira_col and "NOME" not in primeira_col:
        vereador_perdido = pd.DataFrame([colunas_pt2], columns=df_pt1.columns)
        df_pt2.columns = df_pt1.columns
        df_pt2 = pd.concat([vereador_perdido, df_pt2], ignore_index=True)
    else:
        df_pt2.columns = df_pt1.columns

    df_pt1['ativo'] = 'ativo'
    df_pt2['ativo'] = 'ativo'

    mascara_licenciados = (
        df_pt2.iloc[:, 0].astype(str).str.upper().str.contains("LICENCIADOS", na=False)
        | df_pt2.iloc[:, 1].astype(str).str.upper().str.contains("LICENCIADOS", na=False)
    )

    if any(mascara_licenciados):
        idx_licenciados = df_pt2[mascara_licenciados].index[0]
        df_pt2.loc[idx_licenciados:, 'ativo'] = 'licenciado'
        df_pt2 = df_pt2.drop(index=idx_licenciados)

    df_raw = pd.concat([df_pt1, df_pt2], ignore_index=True)

    df_raw = df_raw.dropna(subset=['Vereador(a)'])
    termos_cabecalho = ['NOME', 'VEREADOR', 'VEREADOR(A)', 'VEREADOR (A)']
    mascara_cabecalho = df_raw['Vereador(a)'].astype(str).str.strip().str.upper().isin(termos_cabecalho)
    df_raw = df_raw[~mascara_cabecalho]

    df_raw = df_raw.reset_index(drop=True)
    return df_raw.map(normalizar_txt)

def obter_celula_tabela(tabela, termo_busca):

    if not tabela:
        return ""
    td_titulo = tabela.find('td', string=lambda t: t and termo_busca in t)
    if td_titulo:
        td_valor = td_titulo.find_next_sibling('td')
        if td_valor and td_valor.find('ul'):
            return ", ".join([li.get_text(strip=True) for li in td_valor.find_all('li')])
        return td_valor.get_text(strip=True) if td_valor else ""
    return ""


def buscar_detalhes_vereador(nome_vereador):

    nome_url = normalizar_url(nome_vereador)
    url = f"{config.BASE_URL_PERFIL}{nome_url}"

    try:
        response = requests.get(url, timeout=30)
        if response.status_code != 200:
            print(f"   [DEBUG] Falha ao acessar perfil (HTTP {response.status_code}): {url}")
            print(f"   [DEBUG] Nome original: '{nome_vereador}' → URL gerada: '{nome_url}'")
            return {"legislaturas": config.FALLBACK_TEXTO, "gabinete": config.FALLBACK_TEXTO, "comissoes": ""}

        soup = BeautifulSoup(response.content, "html.parser")
        tabela_html = soup.find("table", class_="mceItemTable")

        return {
            "legislaturas": obter_celula_tabela(tabela_html, "Legislaturas") or config.FALLBACK_TEXTO,
            "gabinete": obter_celula_tabela(tabela_html, "Gabinete") or config.FALLBACK_TEXTO,
            "comissoes": obter_celula_tabela(tabela_html, "Comissões"),
        }
    except Exception as e:
        print(f"   Erro ao acessar {nome_vereador}: {e}")
        return {"legislaturas": config.FALLBACK_TEXTO, "gabinete": config.FALLBACK_TEXTO, "comissoes": ""}


def transformar_dados(df_raw):
    df = df_raw.copy()

    df['Nascimento'] = pd.to_datetime(df['Nascimento'], dayfirst=True, errors='coerce').dt.date
    df['Cor'] = df['Cor'].map(config.MAPA_COR)
    df['Instrução'] = (
        df['Instrução']
        .apply(normalizar_txt)
        .str.lower()
        .map(config.MAPA_INSTRUCAO)
    )
    df['Telefone'] = df['Telefone'].str.replace(r'\D', '', regex=True).str[:11]
    df['site'] = df['Vereador(a)'].apply(lambda x: f"{config.BASE_URL_PERFIL}{normalizar_url(x)}")

    df.loc[df['E-mail'] == '', 'E-mail'] = None
    df.loc[df['Telefone'] == '', 'Telefone'] = None

    return df.rename(columns={
        'Vereador(a)': 'nome',
        'E-mail': 'email',
        'Ocupação': 'ocupacao',
        'Gênero': 'genero',
        'Nascimento': 'nascimento',
        'Cor': 'cor',
        'Instrução': 'escolaridade',
        'Telefone': 'telefone',
    })


def _preencher_fallbacks(df):
    colunas_obrigatorias = {
        "legislaturas": config.FALLBACK_TEXTO,
        "gabinete": config.FALLBACK_TEXTO,
        "genero": config.FALLBACK_TEXTO,
        "cor": "branca",
        "ocupacao": config.FALLBACK_TEXTO,
        "escolaridade": "sup_comp",
    }
    for col, fallback in colunas_obrigatorias.items():
        if col in df.columns:
            df[col] = df[col].fillna(fallback)
            df[col] = df[col].replace("", fallback)
    return df


def salvar_dados_banco(df_final, engine):

    df_final = _preencher_fallbacks(df_final)

    df_partidos = df_final[['Partido']].drop_duplicates().rename(columns={'Partido': 'nomepartido'})
    df_partidos = df_partidos.dropna()

    try:
        db_partidos = pd.read_sql('SELECT id as partido_id, nomepartido FROM partido', engine)
    except Exception:
        db_partidos = pd.DataFrame(columns=['partido_id', 'nomepartido'])

    novos_partidos = df_partidos[~df_partidos['nomepartido'].isin(db_partidos['nomepartido'])]
    if not novos_partidos.empty:
        novos_partidos.to_sql('partido', engine, if_exists='append', index=False, method='multi')

    db_partidos = pd.read_sql('SELECT id as partido_id, nomepartido FROM partido', engine)

    df_v = df_final.merge(db_partidos, left_on='Partido', right_on='nomepartido')
    cols_v = [
        'nome', 'partido_id', 'email', 'legislaturas', 'gabinete',
        'telefone', 'site', 'ativo', 'genero', 'nascimento',
        'cor', 'ocupacao', 'escolaridade',
    ]

    try:
        db_vereadores = pd.read_sql('SELECT id as vereador_id, nome FROM vereador', engine)
    except Exception:
        db_vereadores = pd.DataFrame(columns=['vereador_id', 'nome'])

    df_v_insert = df_v[~df_v['nome'].isin(db_vereadores['nome'])]
    df_v_update = df_v[df_v['nome'].isin(db_vereadores['nome'])]

    if not df_v_insert.empty:
        df_v_insert[cols_v].to_sql('vereador', engine, if_exists='append', index=False)
        print(f"{len(df_v_insert)} novos vereadores inseridos.")

    if not df_v_update.empty:
        df_v_update = df_v_update.replace({np.nan: None})
        with engine.begin() as conn:
            for _, row in df_v_update.iterrows():
                query = text("""
                    UPDATE vereador
                    SET partido_id = :partido_id, email = :email,
                        legislaturas = :legislaturas, gabinete = :gabinete,
                        telefone = :telefone, site = :site, ativo = :ativo,
                        genero = :genero, nascimento = :nascimento,
                        cor = :cor, ocupacao = :ocupacao,
                        escolaridade = :escolaridade
                    WHERE nome = :nome
                """)
                conn.execute(query, {col: row[col] for col in cols_v})
        print(f"{len(df_v_update)} vereadores atualizados no banco.")

    db_vereadores = pd.read_sql('SELECT id as vereador_id, nome FROM vereador', engine)

    nomes_comissoes = (
        df_final['comissoes']
        .str.split('|')
        .explode()
        .str.strip()
        .dropna()
        .unique()
    )
    nomes_comissoes = [c for c in nomes_comissoes if c]
    df_comissoes_master = pd.DataFrame(nomes_comissoes, columns=['nomecomissao'])

    try:
        db_comissoes = pd.read_sql('SELECT id as comissao_id, nomecomissao FROM comissao', engine)
    except Exception:
        db_comissoes = pd.DataFrame(columns=['comissao_id', 'nomecomissao'])

    novas_comissoes = df_comissoes_master[~df_comissoes_master['nomecomissao'].isin(db_comissoes['nomecomissao'])]
    if not novas_comissoes.empty:
        novas_comissoes.to_sql('comissao', engine, if_exists='append', index=False, method='multi')

    db_comissoes = pd.read_sql('SELECT id as comissao_id, nomecomissao FROM comissao', engine)

    df_relacao = df_v[['nome', 'comissoes']].copy()
    df_relacao['comissao_nome_limpo'] = df_relacao['comissoes'].str.split('|')
    df_relacao = df_relacao.explode('comissao_nome_limpo')
    df_relacao['comissao_nome_limpo'] = df_relacao['comissao_nome_limpo'].str.strip()
    df_relacao = df_relacao.dropna(subset=['comissao_nome_limpo'])
    df_relacao = df_relacao[df_relacao['comissao_nome_limpo'] != '']

    df_relacao = df_relacao.merge(db_vereadores, on='nome')
    df_relacao = df_relacao.merge(db_comissoes, left_on='comissao_nome_limpo', right_on='nomecomissao')

    vereador_ids = df_relacao['vereador_id'].unique()

    try:
        if len(vereador_ids) > 0:
            with engine.begin() as conn:
                conn.execute(
                    text("DELETE FROM vereador_comissao WHERE vereador_id = ANY(:ids)"),
                    {"ids": [int(x) for x in vereador_ids]},
                )
        cols_ligacao = ['comissao_id', 'vereador_id']
        df_relacao[cols_ligacao].drop_duplicates().to_sql(
            'vereador_comissao', engine, if_exists='append', index=False
        )
        print("Vínculos de vereador_comissao atualizados com sucesso!")
    except Exception as e:
        print(f"Erro ao atualizar vereador_comissao: {e}")

def main():
    print("Iniciando extração de dados dos vereadores...")
    engine = create_engine(config.DATABASE_URL)

    print("Abrindo PDF...")
    df_raw = extrair_dados_pdf(config.URL_PDF)
    print(f"  {len(df_raw)} vereadores encontrados no PDF.")

    print("Buscando dados de perfil (legislaturas, gabinete, comissões)...")
    detalhes = []
    for i, nome in enumerate(df_raw["Vereador(a)"]):
        info = buscar_detalhes_vereador(nome)
        info['nome_ref'] = nome
        detalhes.append(info)
        print(f"  [{i+1}/{len(df_raw)}] {nome}")
        time.sleep(0.3)

    df_detalhes = pd.DataFrame(detalhes)
    df_completo = df_raw.merge(df_detalhes, left_on='Vereador(a)', right_on='nome_ref')

    df_final = transformar_dados(df_completo)

    # partidos → vereadores → comissoes
    salvar_dados_banco(df_final, engine)
    print("Processo finalizado com sucesso!")


if __name__ == "__main__":
    main()
