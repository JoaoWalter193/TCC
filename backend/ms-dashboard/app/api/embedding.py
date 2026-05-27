from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

router = APIRouter()

print("Carregando modelo de embedding...")
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
print("Modelo carregado!")


class EmbeddingRequest(BaseModel):
    texto: str


@router.post("/embedding")
def gerar_embedding(request: EmbeddingRequest):
    embedding = model.encode(request.texto).tolist()
    return embedding
