from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import Lock

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
        self._inflight_job_by_cache_key: dict[str, str] = {}
        self._job_sequence_by_video_id: dict[str, int] = {}
        self._lock = Lock()

    def create_job_id(self, video_id: str) -> str:
        with self._lock:
            next_sequence = self._job_sequence_by_video_id.get(video_id, 0) + 1
            self._job_sequence_by_video_id[video_id] = next_sequence
        return f"job_{video_id}_{next_sequence:03d}"

    def upsert_job_status(self, status_data: AnalysisStatusData) -> None:
        self._job_statuses[status_data.job_id] = status_data

    def get_job_status(self, job_id: str) -> AnalysisStatusData | None:
        return self._job_statuses.get(job_id)

    def build_cache_key(self, video_id: str, analysis_version: str = DEFAULT_ANALYSIS_VERSION) -> str:
        return f"analysis:{video_id}:{analysis_version}"

    def get_inflight_job_id(self, cache_key: str) -> str | None:
        with self._lock:
            return self._inflight_job_by_cache_key.get(cache_key)

    def mark_job_inflight(self, cache_key: str, job_id: str) -> bool:
        with self._lock:
            existing = self._inflight_job_by_cache_key.get(cache_key)
            if existing is not None:
                return False

            self._inflight_job_by_cache_key[cache_key] = job_id
            return True

    def clear_inflight_job(self, cache_key: str, job_id: str) -> None:
        with self._lock:
            existing = self._inflight_job_by_cache_key.get(cache_key)
            if existing == job_id:
                self._inflight_job_by_cache_key.pop(cache_key, None)

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
