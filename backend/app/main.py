from fastapi import FastAPI

from app.domains.analysis.router import router as analysis_router

app = FastAPI(title="yt_search backend", version="0.1.0")
app.include_router(analysis_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
