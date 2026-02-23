from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.app.domains.analysis.schemas import AnalysisResult, AnalysisStatusData, JobStatus, ResponseError
from backend.app.domains.analysis.validator import AnalysisValidationError, validate_and_normalize_result


@dataclass
class ServiceOutcome:
    status_data: AnalysisStatusData


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
