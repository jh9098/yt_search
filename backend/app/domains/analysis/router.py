from __future__ import annotations

from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

from backend.app.core.response import error_response, success_response
from backend.app.domains.analysis.repository import (
    DEFAULT_ANALYSIS_VERSION,
    InMemoryAnalysisRepository,
)
from backend.app.domains.analysis.schemas import (
    AnalysisCreateSuccessResponse,
    AnalysisErrorResponse,
    AnalysisJobCreateRequest,
    AnalysisStatusData,
    JobStatus,
)
from backend.app.domains.analysis.service import build_completed_or_failed_status

router = APIRouter(prefix="/api/analysis", tags=["analysis"])
repository = InMemoryAnalysisRepository()


def _build_stub_raw_result() -> dict:
    return {
        "summary": {
            "majorReactions": "영상 내용에 공감하며 자신의 경험과 연결짓는 댓글이 많습니다.",
            "positivePoints": "뇌과학/심리학적 설명이 이해에 도움 되었다는 평가가 있습니다.",
            # weakPoints intentionally omitted to verify fallback path
        },
        # contentIdeas intentionally omitted to verify fallback path
        "recommendedKeywords": ["가족관계", "심리", "감정조절"],
        "meta": {
            "model": "gemini-2.0-flash",
            "analyzedAt": "2026-02-22T12:00:08Z",
            "commentSampleCount": 320,
            "analysisBasis": ["title", "description", "comments"],
            "languageSummary": ["ko"],
            "analysisVersion": DEFAULT_ANALYSIS_VERSION,
            "schemaVersion": "analysis-result-v1",
        },
    }


def _build_completed_status(job_id: str, cache_hit: bool) -> AnalysisStatusData:
    outcome = build_completed_or_failed_status(job_id=job_id, raw_result=_build_stub_raw_result())
    status_data = outcome.status_data

    if status_data.result is not None:
        status_data.result.meta.cache_hit = cache_hit

    return status_data


@router.post(
    "/jobs",
    response_model=AnalysisCreateSuccessResponse,
    responses={400: {"model": AnalysisErrorResponse}},
)
def create_analysis_job(payload: AnalysisJobCreateRequest):
    video_id = payload.video_id.strip()
    if not video_id:
        body = error_response(
            code="COMMON_INVALID_REQUEST",
            message="요청값이 올바르지 않습니다. 입력값을 확인해 주세요.",
        )
        return JSONResponse(status_code=400, content=body)

    job_id = f"job_{video_id}_001"
    cache_key = repository.build_cache_key(video_id=video_id, analysis_version=DEFAULT_ANALYSIS_VERSION)

    if not payload.force_refresh:
        cached_result = repository.get_cached_result(cache_key=cache_key)
        if cached_result is not None:
            cached_status = AnalysisStatusData(
                jobId=job_id,
                status=JobStatus.COMPLETED,
                result=cached_result.model_copy(deep=True),
            )
            cached_status.result.meta.cache_hit = True
            repository.upsert_job_status(cached_status)
            return success_response(data=cached_status.model_dump(by_alias=True, exclude_none=True))

    completed_status = _build_completed_status(job_id=job_id, cache_hit=False)
    repository.upsert_job_status(completed_status)

    if completed_status.result is not None:
        repository.save_result(cache_key=cache_key, result=completed_status.result.model_copy(deep=True))

    return success_response(data=completed_status.model_dump(by_alias=True, exclude_none=True))


@router.get(
    "/jobs/{job_id}",
    response_model=AnalysisCreateSuccessResponse,
    responses={404: {"model": AnalysisErrorResponse}},
)
def get_analysis_job_status(job_id: str = Path(..., min_length=1)):
    current = repository.get_job_status(job_id)
    if current is None:
        body = error_response(
            code="ANALYSIS_JOB_NOT_FOUND",
            message="분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요.",
        )
        return JSONResponse(status_code=404, content=body)

    return success_response(data=current.model_dump(by_alias=True, exclude_none=True))
