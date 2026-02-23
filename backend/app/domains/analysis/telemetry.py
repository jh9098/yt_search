from __future__ import annotations

import logging

logger = logging.getLogger("analysis")


def log_analysis_event(
    *,
    event: str,
    request_id: str,
    job_id: str | None = None,
    video_id: str | None = None,
    analysis_version: str | None = None,
    error_code: str | None = None,
    retry_after: int | None = None,
    cache_hit: bool | None = None,
) -> None:
    """분석 도메인 공통 구조 로그.

    민감정보(API 키, 토큰, 원문 프롬프트)는 받지 않는다.
    """

    logger.info(
        "analysis_event=%s requestId=%s jobId=%s videoId=%s analysisVersion=%s errorCode=%s retryAfter=%s cacheHit=%s",
        event,
        request_id,
        job_id,
        video_id,
        analysis_version,
        error_code,
        retry_after,
        cache_hit,
    )
