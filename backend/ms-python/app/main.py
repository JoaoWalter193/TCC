from fastapi import FastAPI
from app.api.endpoints import router as api_router
from app.api.embedding import router as embedding_router
from app.api.tag import router as tag_router
from app.api.resumo import router as resumo_router

app = FastAPI(title="Dashboard Microservice")

app.include_router(api_router)
app.include_router(embedding_router)
app.include_router(tag_router)
app.include_router(resumo_router)


@app.get("/status")
def health_check():
    return {"status": "ok"}
