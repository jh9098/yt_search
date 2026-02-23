from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any

from pydantic import ValidationError

from backend.app.domains.analysis.schemas import AnalysisResult

DEFAULT_WEAK_POINTS = "충분한 데이터가 없어 아쉬운 점을 특정하기 어렵습니다."


class AnalysisValidationError(Exception):
    """분석 결과를 failed 처리해야 하는 경우 발생시키는 예외."""


@dataclass
class ValidationOutcome:
    normalized_result: AnalysisResult
    warnings: list[str]


REQUIRED_TOP_LEVEL_FIELDS = {
    "summary",
    "contentIdeas",
    "recommendedKeywords",
    "meta",
}

REQUIRED_SUMMARY_FIELDS = {
    "majorReactions",
    "positivePoints",
}

REQUIRED_META_FIELDS = {
    "model",
    "analyzedAt",
    "analysisBasis",
    "analysisVersion",
    "schemaVersion",
}


# 1차 검증: 필수 필드(보정 불가 항목) 존재 체크
# 2차 검증: Pydantic 모델 구조 검증

def validate_and_normalize_result(raw_result: Any) -> ValidationOutcome:
    if not isinstance(raw_result, dict):
        raise AnalysisValidationError("analysis result must be a JSON object")

    _validate_required_fields(raw_result)
    patched = _apply_allowed_fallbacks(raw_result)
    return _validate_with_schema(patched)


def _validate_required_fields(raw_result: dict[str, Any]) -> None:
    missing_top_fields = [field for field in REQUIRED_TOP_LEVEL_FIELDS if field not in raw_result]
    if missing_top_fields:
        raise AnalysisValidationError(
            f"missing required top-level fields: {', '.join(sorted(missing_top_fields))}"
        )

    summary = raw_result.get("summary")
    if not isinstance(summary, dict):
        raise AnalysisValidationError("summary must be an object")

    missing_summary_fields = [
        field for field in REQUIRED_SUMMARY_FIELDS if field not in summary
    ]
    if missing_summary_fields:
        raise AnalysisValidationError(
            f"missing required summary fields: {', '.join(sorted(missing_summary_fields))}"
        )

    meta = raw_result.get("meta")
    if not isinstance(meta, dict):
        raise AnalysisValidationError("meta must be an object")

    missing_meta_fields = [field for field in REQUIRED_META_FIELDS if field not in meta]
    if missing_meta_fields:
        raise AnalysisValidationError(
            f"missing required meta fields: {', '.join(sorted(missing_meta_fields))}"
        )


def _apply_allowed_fallbacks(raw_result: dict[str, Any]) -> dict[str, Any]:
    patched = deepcopy(raw_result)
    warnings: list[str] = []

    summary = patched.get("summary")
    if isinstance(summary, dict) and not summary.get("weakPoints"):
        summary["weakPoints"] = DEFAULT_WEAK_POINTS
        warnings.append("summary.weakPoints 누락으로 기본 문구를 적용했습니다.")

    if "contentIdeas" not in patched or patched.get("contentIdeas") is None:
        patched["contentIdeas"] = []
        warnings.append("contentIdeas 누락으로 빈 배열([])을 적용했습니다.")

    if "recommendedKeywords" not in patched or patched.get("recommendedKeywords") is None:
        patched["recommendedKeywords"] = []
        warnings.append("recommendedKeywords 누락으로 빈 배열([])을 적용했습니다.")

    meta = patched.get("meta")
    if isinstance(meta, dict):
        existing_warnings = meta.get("warnings")
        if existing_warnings is None:
            existing_warnings = []
            warnings.append("meta.warnings 누락으로 빈 배열([])을 초기화했습니다.")

        if not isinstance(existing_warnings, list):
            raise AnalysisValidationError("meta.warnings must be an array when provided")

        meta["warnings"] = [*existing_warnings, *warnings]

    return patched


def _validate_with_schema(patched: dict[str, Any]) -> ValidationOutcome:
    try:
        normalized = AnalysisResult.model_validate(patched)
    except ValidationError as error:
        raise AnalysisValidationError(f"schema validation failed after fallback: {error}") from error

    warnings = normalized.meta.warnings or []
    return ValidationOutcome(normalized_result=normalized, warnings=warnings)
