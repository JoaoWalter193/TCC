import psycopg2
from sentence_transformers import SentenceTransformer

DB_CONFIG = {
    "host": "postgres",
    "port": 5432,
    "dbname": "TCC",
    "user": "postgres",
    "password": "senha"
}

print("Carregando modelo de embedding...")
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
print("Modelo carregado!")


def gerar_embedding(texto: str) -> list:
    embedding = model.encode(texto)
    return embedding.tolist()


def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            p.codigo,
            t.tipo,
            v.nome as vereador,
            p.data_envio,
            p.data_efetivo,
            ep.estado,
            p.localizacao,
            p.razao,
            p.leis_similares,
            p.ementa,
            p.texto,
            p.justificativa,
            p.tag
        FROM proposicao p
        JOIN tipoproposicao t ON p.tipo_id = t.id
        JOIN vereador v ON p.vereador_id = v.id
        JOIN estadoproposicao ep ON p.estado_id = ep.id
        WHERE p.embedding IS NULL
    """)
    proposicoes = cur.fetchall()

    print(f"{len(proposicoes)} proposições para processar...")

    for row in proposicoes:
        (codigo, tipo, vereador, data_envio, data_efetivo, estado,
         localizacao, razao, leis_similares, ementa, texto, justificativa, tag) = row

        # monta texto rico com todos os campos relevantes
        partes = [
            f"Tipo: {tipo}",
            f"Vereador: {vereador}",
            f"Estado: {estado}",
            f"Localização: {localizacao}",
            f"Tag: {tag}",
            f"Razão: {razao}",
            f"Ementa: {ementa}",
            f"Texto: {texto}",
            f"Justificativa: {justificativa}",
        ]

        if leis_similares:
            partes.append(f"Leis similares: {leis_similares}")

        texto_completo = " | ".join(partes)

        print(f"Gerando embedding para proposição {codigo}...")

        try:
            embedding = gerar_embedding(texto_completo)
            embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

            cur.execute(
                "UPDATE proposicao SET embedding = %s::vector WHERE codigo = %s",
                (embedding_str, codigo)
            )
            conn.commit()
            print(f"  ✓ Proposição {codigo} atualizada")

        except Exception as e:
            print(f"  ✗ Erro na proposição {codigo}: {e}")
            conn.rollback()

    cur.close()
    conn.close()
    print("Concluído!")


if __name__ == "__main__":
    main()
