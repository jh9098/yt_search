import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .domains.analysis.router import router as analysis_router
from .domains.search.router import router as search_router

app = FastAPI(title="yt_search backend", version="0.1.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(search_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
