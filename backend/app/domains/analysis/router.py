from __future__ import annotations

from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

from backend.app.core.response import error_response, success_response
from backend.app.domains.analysis.schemas import (
    AnalysisCreateSuccessResponse,
    AnalysisErrorResponse,
    AnalysisJobCreateRequest,
    AnalysisStatusData,
    JobStatus,
)
from backend.app.domains.analysis.service import build_completed_or_failed_status

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# MVP 스텁 저장소 (프로세스 메모리)
STUB_JOBS: dict[str, AnalysisStatusData] = {}


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
            "analysisVersion": "v1",
            "schemaVersion": "analysis-result-v1",
        },
    }


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
    data = AnalysisStatusData(jobId=job_id, status=JobStatus.QUEUED)
    STUB_JOBS[job_id] = data

    # forceRefresh=true면 즉시 완료 샘플을 생성해 검증/보정 파이프라인이 동작하도록 유지
    if payload.force_refresh:
        outcome = build_completed_or_failed_status(job_id=job_id, raw_result=_build_stub_raw_result())
        STUB_JOBS[job_id] = outcome.status_data

    return success_response(data=data.model_dump(by_alias=True, exclude_none=True))


@router.get(
    "/jobs/{job_id}",
    response_model=AnalysisCreateSuccessResponse,
    responses={404: {"model": AnalysisErrorResponse}},
)
def get_analysis_job_status(job_id: str = Path(..., min_length=1)):
    if job_id not in STUB_JOBS:
        body = error_response(
            code="ANALYSIS_JOB_NOT_FOUND",
            message="분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요.",
        )
        return JSONResponse(status_code=404, content=body)

    current = STUB_JOBS[job_id]

    if current.status == JobStatus.QUEUED:
        current = AnalysisStatusData(
            jobId=job_id,
            status=JobStatus.PROCESSING,
            message="분석 진행 중입니다.",
        )
        STUB_JOBS[job_id] = current

    return success_response(data=current.model_dump(by_alias=True, exclude_none=True))
