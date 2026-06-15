import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:senha@localhost:5432/TCC")
BASE_URL_CMC = os.getenv("BASE_URL_CMC", "https://www.cmc.pr.gov.br")
MODELO_PATH = os.getenv("MODELO_PATH", "./modelo_captcha_trocr")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "15"))
MAX_CAPTCHA_ATTEMPTS = int(os.getenv("MAX_CAPTCHA_ATTEMPTS", "5"))
RATE_LIMIT_DELAY = float(os.getenv("RATE_LIMIT_DELAY", "1.0"))
PAGINATION_DELAY = float(os.getenv("PAGINATION_DELAY", "1.5"))
DETALHES_DELAY = float(os.getenv("DETALHES_DELAY", "1.5"))
FORCE_CPU = os.getenv("FORCE_CPU", "true").lower() == "true"

TAG_API_URL = os.getenv("TAG_API_URL", "http://localhost:8085/tag")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}

BASE_URL_PERFIL = "https://www.curitiba.pr.leg.br/vereadores/vereadores-19a-legislatura/"
URL_PDF = "https://www.curitiba.pr.leg.br/vereadores/quem-sao-os-vereadores-de-curitiba-2025-2028"

MAPA_COR = {'branca': 'branca', 'parda': 'parda', 'preta': 'preta', 'amarela': 'amarela'}
MAPA_INSTRUCAO = {
    'superior completo': 'sup_comp',
    'superior incompleto': 'sup_incomp',
    'ensino médio completo': 'ens_med_comp',
    'ensino médio incompleto': 'ens_med_incomp',
    'ensino fundamental completo': 'ens_fund_comp',
    'ensino fundamental incompleto': 'ens_fund_incomp',
}

FALLBACK_TEXTO = "Não informado"
