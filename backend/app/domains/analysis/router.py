from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

from backend.app.core.response import error_response, success_response
from backend.app.domains.analysis.client import ExternalAnalysisClient
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
from backend.app.domains.analysis.service import AnalysisProcessingError, process_analysis_job
from backend.app.domains.analysis.telemetry import log_analysis_event

router = APIRouter(prefix="/api/analysis", tags=["analysis"])
repository = InMemoryAnalysisRepository()
external_analysis_client = ExternalAnalysisClient()


@router.post(
    "/jobs",
    response_model=AnalysisCreateSuccessResponse,
    responses={400: {"model": AnalysisErrorResponse}},
)
def create_analysis_job(payload: AnalysisJobCreateRequest):
    request_id = f"req_{uuid4().hex[:12]}"
    video_id = payload.video_id.strip()
    if not video_id:
        body = error_response(
            code="COMMON_INVALID_REQUEST",
            message="요청값이 올바르지 않습니다. 입력값을 확인해 주세요.",
            request_id=request_id,
        )
        log_analysis_event(
            event="analysis_invalid_request",
            request_id=request_id,
            video_id=video_id,
            error_code="COMMON_INVALID_REQUEST",
        )
        return JSONResponse(status_code=400, content=body)

    cache_key = repository.build_cache_key(video_id=video_id, analysis_version=DEFAULT_ANALYSIS_VERSION)

    if not payload.force_refresh:
        cached_result = repository.get_cached_result(cache_key=cache_key)
        if cached_result is not None:
            cached_job_id = repository.create_job_id(video_id=video_id)
            cached_status = AnalysisStatusData(
                jobId=cached_job_id,
                status=JobStatus.COMPLETED,
                result=cached_result.model_copy(deep=True),
            )
            cached_status.result.meta.cache_hit = True
            repository.upsert_job_status(cached_status)
            log_analysis_event(
                event="analysis_cache_hit",
                request_id=request_id,
                job_id=cached_job_id,
                video_id=video_id,
                analysis_version=DEFAULT_ANALYSIS_VERSION,
                cache_hit=True,
            )
            return success_response(
                data=cached_status.model_dump(by_alias=True, exclude_none=True),
                request_id=request_id,
            )

        inflight_job_id = repository.get_inflight_job_id(cache_key=cache_key)
        if inflight_job_id is not None:
            inflight_status = repository.get_job_status(inflight_job_id)
            if inflight_status is not None and inflight_status.status in {
                JobStatus.QUEUED,
                JobStatus.PROCESSING,
            }:
                log_analysis_event(
                    event="analysis_dedupe_reuse",
                    request_id=request_id,
                    job_id=inflight_job_id,
                    video_id=video_id,
                    analysis_version=DEFAULT_ANALYSIS_VERSION,
                    cache_hit=False,
                )
                return success_response(
                    data=inflight_status.model_dump(by_alias=True, exclude_none=True),
                    request_id=request_id,
                )

    job_id = repository.create_job_id(video_id=video_id)

    queued_status = AnalysisStatusData(jobId=job_id, status=JobStatus.QUEUED, progress=0, step="queued")
    if not payload.force_refresh and not repository.mark_job_inflight(cache_key=cache_key, job_id=job_id):
        reused_job_id = repository.get_inflight_job_id(cache_key=cache_key)
        if reused_job_id:
            reused = repository.get_job_status(reused_job_id)
            if reused is not None:
                log_analysis_event(
                    event="analysis_dedupe_race_reuse",
                    request_id=request_id,
                    job_id=reused_job_id,
                    video_id=video_id,
                    analysis_version=DEFAULT_ANALYSIS_VERSION,
                    cache_hit=False,
                )
                return success_response(
                    data=reused.model_dump(by_alias=True, exclude_none=True),
                    request_id=request_id,
                )

    repository.upsert_job_status(queued_status)

    processing_status = AnalysisStatusData(
        jobId=job_id,
        status=JobStatus.PROCESSING,
        progress=20,
        step="generating_insights",
        message="분석을 진행하고 있습니다.",
    )
    repository.upsert_job_status(processing_status)

    log_analysis_event(
        event="analysis_processing_started",
        request_id=request_id,
        job_id=job_id,
        video_id=video_id,
        analysis_version=DEFAULT_ANALYSIS_VERSION,
        cache_hit=False,
    )

    try:
        completed_or_failed_status = process_analysis_job(
            job_id=job_id,
            video_id=video_id,
            client=external_analysis_client,
        ).status_data
    except AnalysisProcessingError as processing_error:
        repository.clear_inflight_job(cache_key=cache_key, job_id=job_id)
        failed_status = AnalysisStatusData(
            jobId=job_id,
            status=JobStatus.FAILED,
            error={
                "code": processing_error.code,
                "message": processing_error.message,
            },
        )
        repository.upsert_job_status(failed_status)

        body = error_response(
            code=processing_error.code,
            message=processing_error.message,
            request_id=request_id,
        )
        headers: dict[str, str] = {}
        if (
            processing_error.code == "ANALYSIS_RATE_LIMITED"
            and processing_error.retry_after_seconds is not None
        ):
            headers["Retry-After"] = str(processing_error.retry_after_seconds)

        log_analysis_event(
            event="analysis_processing_failed",
            request_id=request_id,
            job_id=job_id,
            video_id=video_id,
            analysis_version=DEFAULT_ANALYSIS_VERSION,
            cache_hit=False,
            error_code=processing_error.code,
            retry_after=processing_error.retry_after_seconds,
        )

        return JSONResponse(status_code=503, content=body, headers=headers)

    repository.upsert_job_status(completed_or_failed_status)

    if completed_or_failed_status.result is not None:
        completed_or_failed_status.result.meta.cache_hit = False
        repository.save_result(
            cache_key=cache_key,
            result=completed_or_failed_status.result.model_copy(deep=True),
        )

    repository.clear_inflight_job(cache_key=cache_key, job_id=job_id)
    log_analysis_event(
        event="analysis_processing_completed",
        request_id=request_id,
        job_id=job_id,
        video_id=video_id,
        analysis_version=DEFAULT_ANALYSIS_VERSION,
        cache_hit=False,
    )

    return success_response(
        data=completed_or_failed_status.model_dump(by_alias=True, exclude_none=True),
        request_id=request_id,
    )


@router.get(
    "/jobs/{job_id}",
    response_model=AnalysisCreateSuccessResponse,
    responses={404: {"model": AnalysisErrorResponse}},
)
def get_analysis_job_status(job_id: str = Path(..., min_length=1)):
    request_id = f"req_{uuid4().hex[:12]}"
    current = repository.get_job_status(job_id)
    if current is None:
        body = error_response(
            code="ANALYSIS_JOB_NOT_FOUND",
            message="분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요.",
            request_id=request_id,
        )
        log_analysis_event(
            event="analysis_job_not_found",
            request_id=request_id,
            job_id=job_id,
            error_code="ANALYSIS_JOB_NOT_FOUND",
        )
        return JSONResponse(status_code=404, content=body)

    log_analysis_event(
        event="analysis_status_fetched",
        request_id=request_id,
        job_id=job_id,
        cache_hit=current.result.meta.cache_hit if current.result is not None else None,
    )
    return success_response(data=current.model_dump(by_alias=True, exclude_none=True), request_id=request_id)
