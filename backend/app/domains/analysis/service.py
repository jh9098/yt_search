from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.app.domains.analysis.schemas import AnalysisResult, AnalysisStatusData, JobStatus, ResponseError
from backend.app.domains.analysis.validator import AnalysisValidationError, validate_and_normalize_result


@dataclass
class ServiceOutcome:
    status_data: AnalysisStatusData


@dataclass(frozen=True)
class AnalysisProcessingError(Exception):
    code: str
    message: str


def raise_if_simulated_processing_error(video_id: str) -> None:
    """외부 API 연동 전 단계에서 timeout/upstream 예외 분기를 검증하기 위한 시뮬레이터.

    실제 연동이 들어오면 외부 호출 레이어 예외를 동일 코드/메시지로 매핑하면 된다.
    """

    normalized_video_id = video_id.strip().lower()

    if normalized_video_id.endswith("_timeout"):
        raise AnalysisProcessingError(
            code="ANALYSIS_TIMEOUT",
            message="분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
        )

    if normalized_video_id.endswith("_upstream_unavailable"):
        raise AnalysisProcessingError(
            code="ANALYSIS_UPSTREAM_UNAVAILABLE",
            message="분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
        )


def build_completed_or_failed_status(job_id: str, raw_result: Any) -> ServiceOutcome:
    try:
        validation_outcome = validate_and_normalize_result(raw_result)
    except AnalysisValidationError:
        failed_status = AnalysisStatusData(
            jobId=job_id,
            status=JobStatus.FAILED,
            error=ResponseError(
                code="ANALYSIS_OUTPUT_INVALID",
                message="AI 분석 결과 형식 검증에 실패했습니다. 다시 시도해 주세요.",
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
