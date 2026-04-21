from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(title="Dashboard Microservice")

app.add_middleware(
    CORSMiddleware,
    #Mudar para o API Gateway
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/status")
def health_check():
    return {"status": "ok"}