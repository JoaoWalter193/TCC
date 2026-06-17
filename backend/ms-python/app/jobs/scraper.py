import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd
import requests
from bs4 import BeautifulSoup

from . import config
from .captcha import resolver_captcha


def normalizar_texto(texto):
    if pd.isna(texto):
        return ""
    return re.sub(r"[\r\n\s]+", " ", str(texto)).strip()


def limpar_data(d):
    if pd.isna(d):
        return ""
    return re.sub(r"\s+", " ", re.sub(r"[^\d/:\s]", " ", str(d))).strip()


def extrair_dados(html):
    if not html:
        return []
    soup = BeautifulSoup(html, "html.parser")
    linhas = soup.select('tr[id^="TRbl_report_Proposicoes_consulta"]')
    resultado = []

    for linha in linhas:
        colunas = [td.get_text(strip=True) for td in linha.find_all("td")]
        if len(colunas) >= 9:
            link = linha.find_all("td")[0].find("a")
            resultado.append({
                "codigo": colunas[0],
                "iniciativa_nome": colunas[1],
                "tipo": colunas[2],
                "ementa": colunas[3],
                "estado": colunas[4],
                "ultimo_tramite_txt": colunas[5],
                "razao": colunas[6],
                "localizacao": colunas[7],
                "data_envio_txt": colunas[8],
                "link_detalhe": link["href"] if link else "",
            })
    return resultado

def _extrair_leis_similares(soup):

    for tr in soup.find_all("tr", class_="itemTr"):
        label = tr.find("span", class_="spamFormLabel")
        if label and "Leis similares" in label.get_text():
            field = tr.find("td", class_="formField")
            if field:
                leis = [a.get_text(strip=True) for a in field.find_all("a")]
                return "; ".join(leis)
    return ""

def obter_detalhes(session, link_parcial):

    if not link_parcial:
        return {"texto": "", "justificativa": ""}

    if "?" in link_parcial:
        parametros = link_parcial.split("?", 1)[1]
    else:
        parametros = link_parcial.replace("../", "").replace("wspl/sistema/", "")

    url = f"{config.BASE_URL_CMC}/wspl/sistema/ProposicaoDetalhesForm.do?{parametros}"

    try:
        time.sleep(config.DETALHES_DELAY)
        resp = session.get(url, headers=config.HEADERS, timeout=config.REQUEST_TIMEOUT)

        if "jcaptcha" in resp.text.lower():
            print("   Bloqueio detectado! Resolvendo CAPTCHA...")
            resp = resolver_captcha(session, url, resp.text)
            if not resp:
                return {"texto": "", "justificativa": ""}

        soup = BeautifulSoup(resp.text, "html.parser")
        div_texto = soup.find("div", id="pro_texto")
        div_justificativa = soup.find("div", id="pro_justificativa")

        return {
            "texto": div_texto.get_text(separator="\n", strip=True) if div_texto else "",
            "justificativa": div_justificativa.get_text(separator="\n", strip=True) if div_justificativa else "",
        }
    except Exception as e:
        print(f"   Erro ao acessar detalhes: {e}")
        return {"texto": "", "justificativa": ""}


def _parse_detalhes(args):

    link_parcial, session_principal = args

    if not link_parcial:
        return (link_parcial, {"texto": "", "justificativa": ""})

    session = requests.Session()
    session.headers.update(session_principal.headers)
    session.cookies.update(session_principal.cookies)

    if "?" in link_parcial:
        parametros = link_parcial.split("?", 1)[1]
    else:
        parametros = link_parcial.replace("../", "").replace("wspl/sistema/", "")

    url = f"{config.BASE_URL_CMC}/wspl/sistema/ProposicaoDetalhesForm.do?{parametros}"

    try:
        time.sleep(config.DETALHES_DELAY)
        resp = session.get(url, headers=config.HEADERS, timeout=config.REQUEST_TIMEOUT)

        if "jcaptcha" in resp.text.lower():
            resp = resolver_captcha(session, url, resp.text)
            if not resp:
                return (link_parcial, {"texto": "", "justificativa": ""})

        soup = BeautifulSoup(resp.text, "html.parser")
        div_texto = soup.find("div", id="pro_texto")
        div_just = soup.find("div", id="pro_justificativa")
        leis_similares = _extrair_leis_similares(soup)

        return (link_parcial, {
            "texto": div_texto.get_text(separator="\n", strip=True) if div_texto else "",
            "justificativa": div_just.get_text(separator="\n", strip=True) if div_just else "",
            "leis_similares": leis_similares,
        })
    except Exception as e:
        print(f"   Erro ao acessar detalhes: {e}")
        return (link_parcial, {"texto": "", "justificativa": "", "leis_similares": ""})


def buscar_detalhes_lote(links, session, max_threads=5):
    if not links:
        return []

    print(f"   Buscando detalhes de {len(links)} proposições em paralelo "
          f"({max_threads} threads)...")
    resultados = [None] * len(links)
    argumentos = [(links[i], session) for i in range(len(links))]

    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        futuros = {
            executor.submit(_parse_detalhes, arg): i
            for i, arg in enumerate(argumentos)
        }
        for futuro in as_completed(futuros):
            idx = futuros[futuro]
            _, dados = futuro.result()
            resultados[idx] = dados

    return resultados


def pesquisar(session, data_inicio, data_fim):

    print("1. Acessando o portal da Câmara...")
    url_home = f"{config.BASE_URL_CMC}/wspl/sistema/LogonActionForm.do"

    try:
        resp = session.get(url_home, headers=config.HEADERS,
                           timeout=config.REQUEST_TIMEOUT)

        if "jcaptcha" in resp.text.lower():
            print("   Bloqueado por CAPTCHA. Resolvendo...")
            resp = resolver_captcha(session, url_home, resp.text)
            if not resp:
                print("   Falha ao passar pelo CAPTCHA.")
                return []

        print("2. Indo para o formulário de busca...")
        url_busca = (
            f"{config.BASE_URL_CMC}/wspl/sistema/"
            "ProposicaoConsultaForm.do?resetfull_action="
        )
        resp_busca = session.get(url_busca, headers=config.HEADERS)
        soup = BeautifulSoup(resp_busca.text, "html.parser")

        print("3. Preenchendo e enviando pesquisa...")
        form = soup.find("form")
        if not form:
            print("   Formulário não encontrado.")
            return []

        action = form["action"]
        url_post = (
            config.BASE_URL_CMC + action if action.startswith("/") else action
        )

        dados = {}
        for tag in form.find_all(["input", "select", "textarea"]):
            nome = tag.get("name")
            if not nome:
                continue
            if tag.name == "input" and tag.get("type") in ["submit", "reset", "button"]:
                continue
            if tag.name == "input":
                dados[nome] = tag.get("value", "")
            elif tag.name == "select":
                opcao = tag.find("option", selected=True) or tag.find("option")
                dados[nome] = opcao.get("value", "") if opcao else ""
            elif tag.name == "textarea":
                dados[nome] = tag.text.strip()

        dados.update({
            "proapre": "7",
            "tin_nome": "1",
            "pro_ano": "",
            "pro_protocolada": data_inicio,
            "pro_protocolada1": data_fim,
            "tipopesq": "0",
            "tpr_pdu": "t",
            "pro_encerradas": "t",
            "select_action": "Pesquisar",
        })

        time.sleep(config.RATE_LIMIT_DELAY)
        resp_resultado = session.post(url_post, data=dados, headers=config.HEADERS)

        todas = []
        pagina = 1
        html_atual = resp_resultado.text

        while True:
            itens = extrair_dados(html_atual)
            todas.extend(itens)
            print(f"   Página {pagina}: {len(itens)} itens (total: {len(todas)})")

            soup_pag = BeautifulSoup(html_atual, "html.parser")
            link_prox = soup_pag.find(
                "a", string=re.compile(r"(?i)pr[oó]xima|>|next")
            )

            if link_prox and link_prox.get("href"):
                href = link_prox["href"]
                if not href.startswith("http"):
                    href = "/" + href.lstrip("./")
                    if "wspl/sistema" not in href:
                        url_prox = f"{config.BASE_URL_CMC}/wspl/sistema/{href}"
                    else:
                        url_prox = f"{config.BASE_URL_CMC}{href}"
                else:
                    url_prox = href

                time.sleep(config.PAGINATION_DELAY)
                resp_prox = session.get(url_prox, headers=config.HEADERS)
                html_atual = resp_prox.text
                pagina += 1
            else:
                break

        print(f"   Fim da lista — {len(todas)} proposições encontradas.")
        return todas

    except Exception as e:
        print(f"Erro na pesquisa: {e}")
        return []
