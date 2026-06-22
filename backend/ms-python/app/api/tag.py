from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq, RateLimitError
import os

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TAGS_POSSIVEIS = [
    "saude", "educacao", "urbanismo", "meio-ambiente",
    "seguranca", "transporte", "habitacao", "cultura",
    "esporte", "assistencia-social", "financas", "administrativo"
]

class TagRequest(BaseModel):
    ementa: str
    justificativa: str

@router.post("/tag")
def gerar_tag(request: TagRequest):
    prompt = f"""
    Classifique a proposição abaixo em UMA das seguintes categorias:
    {', '.join(TAGS_POSSIVEIS)}

    Responda APENAS com a categoria escolhida, sem explicação, sem pontuação.

    Ementa: {request.ementa}
    Justificativa: {request.justificativa}
    """
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=20
        )

        tag = response.choices[0].message.content.strip().lower()

        if tag not in TAGS_POSSIVEIS:
            tag = "administrativo"
    except RateLimitError:
        raise HTTPException(status_code=429, detail="rate_limit_exceeded")
    except Exception:
        tag = "administrativo"

    return {"tag": tag}
