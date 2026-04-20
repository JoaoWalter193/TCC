from fastapi import FastAPI
from app.api.endpoints import router as api_router

app = FastAPI(title="Dashboard Microservice")

app.include_router(api_router)

@app.get("/status")
def health_check():
    return {"status": "ok"}