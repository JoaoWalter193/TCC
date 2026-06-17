import requests
from sqlalchemy import create_engine

from . import config
from .banco import salvar, transformar
from .scraper import pesquisar
from .tags import enriquecer_dados
from .gerar_embeddings import main as gerar_embeddings


def _enriquecer_tags():
    try:
        requests.get(config.TAG_API_URL, timeout=3)
    except requests.RequestException:
        print("API de tags não respondeu. Pulando enriquecimento.")
        return

    enriquecer_dados()


def main():
    print("Iniciando extração de proposições da CMC...")

    engine = create_engine(config.DATABASE_URL)
    session = requests.Session()

    DATA_INI = "01/01/2026"
    DATA_FIM = "09/06/2026"

    print(f"Filtrando período de {DATA_INI} até {DATA_FIM}")
    lista = pesquisar(session, data_inicio=DATA_INI, data_fim=DATA_FIM)

    if not lista:
        print("Nenhuma proposição encontrada. Abortando.")
        return

    print(f"\nTotal de {len(lista)} proposições encontradas.\n")

    print("Transformando dados e buscando detalhes...")
    df = transformar(lista, session, engine)

    print("Salvando no banco de dados...")
    salvar(df, engine)

    _enriquecer_tags()

    print("\nGerando embeddings das proposições...")
    gerar_embeddings()

    print("\nProcesso finalizado com sucesso!")


if __name__ == "__main__":
    main()
