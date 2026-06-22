import psycopg2
from sentence_transformers import SentenceTransformer

from . import config


def gerar_embedding(texto: str, model) -> list:
    embedding = model.encode(texto)
    return embedding.tolist()


def main():
    print("Carregando modelo de embedding...")
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
    print("Modelo carregado!")

    conn = psycopg2.connect(config.DATABASE_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            p.codigo,
            t.tipo,
            v.nome as vereador,
            ep.estado,
            p.localizacao,
            p.razao,
            p.ementa,
            p.texto,
            p.tag
        FROM proposicao p
        JOIN tipo_proposicao t ON p.tipo_id = t.id
        JOIN vereador v ON p.vereador_id = v.id
        JOIN estado_proposicao ep ON p.estado_id = ep.id
        ORDER BY p.codigo
    """)
    proposicoes = cur.fetchall()

    print(f"{len(proposicoes)} proposições para processar...")

    total = len(proposicoes)
    for i, row in enumerate(proposicoes, 1):
        if i % 100 == 0 or i == 1 or i == total:
            print(f"  [{i}/{total} ({i*100//total}%)]")
        (codigo, tipo, vereador, estado,
         localizacao, razao, ementa, texto, tag) = row

        partes = [
            f"Tipo: {tipo}",
            f"Vereador: {vereador}",
            f"Estado: {estado}",
            f"Localização: {localizacao}",
            f"Tag: {tag}",
            f"Razão: {razao}",
            f"Ementa: {ementa}",
            f"Texto: {texto}"
        ]


        texto_completo = " | ".join(partes)

        try:
            embedding = gerar_embedding(texto_completo, model)
            embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

            cur.execute(
                "UPDATE proposicao SET embedding = %s::vector WHERE codigo = %s",
                (embedding_str, codigo)
            )
            conn.commit()

        except Exception as e:
            print(f"  Erro ao gerar embedding para {codigo}: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print("Concluído!")

if __name__ == "__main__":
    main()
