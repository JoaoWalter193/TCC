from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

router = APIRouter()

_model = None


def get_model():
    global _model
    if _model is None:
        print("Carregando modelo de embedding...")
        _model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
        print("Modelo carregado!")
    return _model


class EmbeddingRequest(BaseModel):
    texto: str


@router.post("/embedding")
def gerar_embedding(request: EmbeddingRequest):
    embedding = get_model().encode(request.texto).tolist()
    return embedding
