from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class ResumoRequest(BaseModel):
    codigo: int
    tipo: str
    vereador: str
    ementa: str
    texto: str
    justificativa: str
    estado: str
    tag: str


@router.post("/resumo")
def gerar_resumo(request: ResumoRequest):
    prompt = f"""
    Você é um assistente que ajuda cidadãos comuns a entenderem proposições da Câmara Municipal.
    
    Explique a proposição abaixo de forma simples, clara e acessível para uma pessoa que não tem 
    conhecimento jurídico. Use linguagem cotidiana, evite termos técnicos e jurídicos. 
    Seja objetivo e explique em no máximo 3 parágrafos:
    - O que esta proposição quer fazer
    - Por que ela foi criada
    - O que muda na prática para o cidadão

    Proposição #{request.codigo}
    Tipo: {request.tipo}
    Vereador: {request.vereador}
    Situação atual: {request.estado}
    Tema: {request.tag}
    
    Ementa: {request.ementa}
    Texto: {request.texto}
    Justificativa: {request.justificativa}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )

    resumo = response.choices[0].message.content.strip()
    return {"resumo": resumo}
