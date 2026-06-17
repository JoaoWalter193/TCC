import io
import re
import time

import requests
import torch
from bs4 import BeautifulSoup
from PIL import Image

from . import config
from .imagem import preprocessar
from .modelo import carregar_modelo

processor, model, device = carregar_modelo()


def resolver_captcha(session, url_atual, html_atual, max_tentativas=None):
    if max_tentativas is None:
        max_tentativas = config.MAX_CAPTCHA_ATTEMPTS

    for tentativa in range(1, max_tentativas + 1):
        print(f"Tentativa {tentativa}/{max_tentativas} de resolver o captcha...")
        soup = BeautifulSoup(html_atual, "html.parser")

        img_tag = soup.find("img", src=re.compile("jcaptcha"))
        if not img_tag:
            print("Imagem do captcha nao encontrada.")
            return None

        caminho = img_tag["src"]
        if not caminho.startswith("http"):
            caminho = "/" + caminho.lstrip("./")
            url_imagem = config.BASE_URL_CMC + caminho
        else:
            url_imagem = caminho

        form_tag = soup.find("form", attrs={"name": "LogonActionForm"})
        if not form_tag:
            return None

        action = form_tag["action"]
        url_post = config.BASE_URL_CMC + action if action.startswith("/") else action

        dados_post = {}
        for inp in form_tag.find_all("input"):
            nome = inp.get("name")
            if nome:
                dados_post[nome] = inp.get("value", "")

        headers_img = config.HEADERS.copy()
        headers_img["Referer"] = url_atual

        resp = session.get(url_imagem, headers=headers_img, timeout=config.REQUEST_TIMEOUT)
        if resp.status_code != 200:
            return None

        try:
            imagem = Image.open(io.BytesIO(resp.content)).convert("RGB")
        except Exception:
            return None

        imagem_pronta = preprocessar(imagem)

        pixels = processor(imagem_pronta, return_tensors="pt").pixel_values.to(device)
        with torch.no_grad():
            saida = model.generate(pixels, max_length=10)

        texto = processor.decode(saida[0], skip_special_tokens=True)
        texto = texto.replace(" ", "").replace(".PNG", "").replace(".P", "")[:5].upper()
        print(f"Identificado pela IA: '{texto}'")

        dados_post["captcha"] = texto
        dados_post["logon_action"] = "Entrar"

        time.sleep(config.RATE_LIMIT_DELAY)
        resposta = session.post(url_post, data=dados_post, headers=config.HEADERS)

        if "jcaptcha" not in resposta.text:
            print("Captcha identificado com sucesso!")
            return resposta

        print("CAPTCHA incorreto. Tentando novamente...")
        html_atual = resposta.text

    return None
