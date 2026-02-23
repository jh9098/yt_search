from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.app.domains.analysis.repository import DEFAULT_ANALYSIS_VERSION


@dataclass(frozen=True)
class ExternalAnalysisTimeoutError(Exception):
    message: str = "upstream timeout"


@dataclass(frozen=True)
class ExternalAnalysisUpstreamUnavailableError(Exception):
    message: str = "upstream unavailable"


@dataclass(frozen=True)
class ExternalAnalysisRateLimitedError(Exception):
    message: str = "upstream rate limited"


class ExternalAnalysisClient:
    """외부 AI 분석 호출 래퍼(얇은 인터페이스).

    실제 외부 API 연동 전까지는 video_id 접미사 기반으로 예외를 시뮬레이션한다.
    - *_timeout -> timeout
    - *_upstream_unavailable -> upstream unavailable
    - *_rate_limited -> rate limited
    """

    def fetch_analysis_result(self, video_id: str) -> dict[str, Any]:
        normalized_video_id = video_id.strip().lower()

        if normalized_video_id.endswith("_timeout"):
            raise ExternalAnalysisTimeoutError()

        if normalized_video_id.endswith("_upstream_unavailable"):
            raise ExternalAnalysisUpstreamUnavailableError()

        if normalized_video_id.endswith("_rate_limited"):
            raise ExternalAnalysisRateLimitedError()

        return self._build_stub_raw_result()

    @staticmethod
    def _build_stub_raw_result() -> dict[str, Any]:
        return {
            "summary": {
                "majorReactions": "영상 내용에 공감하며 자신의 경험과 연결짓는 댓글이 많습니다.",
                "positivePoints": "뇌과학/심리학적 설명이 이해에 도움 되었다는 평가가 있습니다.",
                "weakPoints": "해결책의 구체 사례가 부족하다는 반응이 일부 있습니다.",
            },
            "contentIdeas": [
                {
                    "title": "갈등 완화를 위한 대화 3단계",
                    "description": "감정 고조 구간에서 사용할 수 있는 짧은 문장 전환법을 제안합니다.",
                }
            ],
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
