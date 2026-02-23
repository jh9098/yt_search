from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from backend.app.domains.analysis.schemas import AnalysisResult, AnalysisStatusData

DEFAULT_ANALYSIS_VERSION = "v1"
DEFAULT_CACHE_TTL_HOURS = 24


@dataclass
class CacheEntry:
    cache_key: str
    result: AnalysisResult
    expires_at: datetime


class InMemoryAnalysisRepository:
    """MVP용 저장소.

    - job 상태: polling 시나리오/상태 조회를 위한 메모리 저장
    - 결과 캐시: videoId + analysisVersion 기준 재사용
    """

    def __init__(self, ttl_hours: int = DEFAULT_CACHE_TTL_HOURS) -> None:
        self._ttl_hours = ttl_hours
        self._job_statuses: dict[str, AnalysisStatusData] = {}
        self._cache_entries: dict[str, CacheEntry] = {}

    def upsert_job_status(self, status_data: AnalysisStatusData) -> None:
        self._job_statuses[status_data.job_id] = status_data

    def get_job_status(self, job_id: str) -> AnalysisStatusData | None:
        return self._job_statuses.get(job_id)

    def build_cache_key(self, video_id: str, analysis_version: str = DEFAULT_ANALYSIS_VERSION) -> str:
        return f"analysis:{video_id}:{analysis_version}"

    def get_cached_result(self, cache_key: str) -> AnalysisResult | None:
        entry = self._cache_entries.get(cache_key)
        if entry is None:
            return None

        if self.is_expired(entry):
            self._cache_entries.pop(cache_key, None)
            return None

        return entry.result

    def save_result(self, cache_key: str, result: AnalysisResult) -> None:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=self._ttl_hours)
        self._cache_entries[cache_key] = CacheEntry(
            cache_key=cache_key,
            result=result,
            expires_at=expires_at,
        )

    @staticmethod
    def is_expired(entry: CacheEntry) -> bool:
        return datetime.now(timezone.utc) >= entry.expires_at
