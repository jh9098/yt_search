from __future__ import annotations

import time
from dataclasses import dataclass

from backend.app.domains.analysis.client import (
    ExternalAnalysisClient,
    ExternalAnalysisRateLimitedError,
    ExternalAnalysisTimeoutError,
    ExternalAnalysisUpstreamUnavailableError,
)
from backend.app.domains.analysis.schemas import AnalysisResult, AnalysisStatusData, JobStatus, ResponseError
from backend.app.domains.analysis.validator import AnalysisValidationError, validate_and_normalize_result


@dataclass
class ServiceOutcome:
    status_data: AnalysisStatusData


@dataclass(frozen=True)
class AnalysisProcessingError(Exception):
    code: str
    message: str


def process_analysis_job(
    job_id: str,
    video_id: str,
    client: ExternalAnalysisClient,
    max_rate_limited_retry: int = 1,
    base_backoff_seconds: float = 0.2,
) -> ServiceOutcome:
    """외부 호출 + 검증 파이프라인.

    - timeout/upstream/rate-limited 예외를 API 계약 코드로 매핑
    - rate-limited는 최소 백오프 재시도(기본 1회)만 수행
    """

    raw_result = _fetch_with_minimal_retry(
        client=client,
        video_id=video_id,
        max_rate_limited_retry=max_rate_limited_retry,
        base_backoff_seconds=base_backoff_seconds,
    )

    return build_completed_or_failed_status(job_id=job_id, raw_result=raw_result)


def _fetch_with_minimal_retry(
    client: ExternalAnalysisClient,
    video_id: str,
    max_rate_limited_retry: int,
    base_backoff_seconds: float,
):
    attempt = 0

    while True:
        try:
            return client.fetch_analysis_result(video_id=video_id)
        except ExternalAnalysisTimeoutError as timeout_error:
            raise AnalysisProcessingError(
                code="ANALYSIS_TIMEOUT",
                message="분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
            ) from timeout_error
        except ExternalAnalysisUpstreamUnavailableError as upstream_error:
            raise AnalysisProcessingError(
                code="ANALYSIS_UPSTREAM_UNAVAILABLE",
                message="분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
            ) from upstream_error
        except ExternalAnalysisRateLimitedError as rate_limited_error:
            if attempt >= max_rate_limited_retry:
                raise AnalysisProcessingError(
                    code="ANALYSIS_RATE_LIMITED",
                    message="분석 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
                ) from rate_limited_error

            backoff_seconds = base_backoff_seconds * (2**attempt)
            time.sleep(backoff_seconds)
            attempt += 1


def build_completed_or_failed_status(job_id: str, raw_result: dict) -> ServiceOutcome:
    try:
        validation_outcome = validate_and_normalize_result(raw_result)
    except AnalysisValidationError:
        failed_status = AnalysisStatusData(
            jobId=job_id,
            status=JobStatus.FAILED,
            error=ResponseError(
                code="ANALYSIS_OUTPUT_INVALID",
                message="분석 결과 검증에 실패했습니다. 다시 시도해 주세요.",
            ),
        )
        return ServiceOutcome(status_data=failed_status)

    completed_status = AnalysisStatusData(
        jobId=job_id,
        status=JobStatus.COMPLETED,
        result=_with_cache_hint(validation_outcome.normalized_result),
    )
    return ServiceOutcome(status_data=completed_status)


def _with_cache_hint(result: AnalysisResult) -> AnalysisResult:
    if result.meta.cache_hit is None:
        result.meta.cache_hit = False
    return result
