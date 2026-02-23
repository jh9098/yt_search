from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

from .repository import DEFAULT_ANALYSIS_VERSION


@dataclass(frozen=True)
class ExternalAnalysisTimeoutError(Exception):
    message: str = "upstream timeout"


@dataclass(frozen=True)
class ExternalAnalysisUpstreamUnavailableError(Exception):
    message: str = "upstream unavailable"


@dataclass(frozen=True)
class ExternalAnalysisRateLimitedError(Exception):
    message: str = "upstream rate limited"


class GeminiSdkAdapter:
    """Gemini SDK 어댑터.

    - SDK 미설치/환경변수 미설정 시 None을 반환해 시뮬레이션 모드로 동작
    - SDK 예외를 도메인 예외로 변환해 service 계층 계약을 고정
    """

    def __init__(self) -> None:
        self._client = self._build_client()

    @staticmethod
    def _build_client() -> Any | None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None

        try:
            from google import genai  # type: ignore
        except Exception:
            return None

        return genai.Client(api_key=api_key)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    def generate_content(self, video_id: str) -> dict[str, Any]:
        if self._client is None:
            raise ExternalAnalysisUpstreamUnavailableError(message="gemini sdk not available")

        prompt = (
            "Return strict JSON for analysis result schema. "
            f"videoId={video_id} "
            "fields: summary/contentIdeas/recommendedKeywords/meta"
        )

        try:
            response = self._client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            text = getattr(response, "text", None)
            if not text:
                raise ExternalAnalysisUpstreamUnavailableError(message="empty response")

            import json

            parsed = json.loads(text)
            if not isinstance(parsed, dict):
                raise ExternalAnalysisUpstreamUnavailableError(message="response is not object")
            return parsed
        except Exception as sdk_error:
            mapped_error = self._map_sdk_error(sdk_error)
            raise mapped_error from sdk_error

    @staticmethod
    def _map_sdk_error(sdk_error: Exception) -> Exception:
        error_name = sdk_error.__class__.__name__.lower()
        message = str(sdk_error).lower()
        joined = f"{error_name} {message}"

        if "deadline" in joined or "timeout" in joined or "timed out" in joined:
            return ExternalAnalysisTimeoutError()

        if (
            "rate" in joined
            or "quota" in joined
            or "resource_exhausted" in joined
            or "429" in joined
            or "too many requests" in joined
        ):
            return ExternalAnalysisRateLimitedError()

        return ExternalAnalysisUpstreamUnavailableError()


class ExternalAnalysisClient:
    """외부 AI 분석 호출 래퍼(얇은 인터페이스).

    1) GEMINI_API_KEY + SDK 사용 가능 시 실제 SDK 호출
    2) 그 외 환경에서는 video_id 접미사 기반 시뮬레이션
       - *_timeout -> timeout
       - *_upstream_unavailable -> upstream unavailable
       - *_rate_limited -> rate limited
    """

    def __init__(self, sdk_adapter: GeminiSdkAdapter | None = None) -> None:
        self._sdk_adapter = sdk_adapter or GeminiSdkAdapter()

    def fetch_analysis_result(self, video_id: str) -> dict[str, Any]:
        if self._sdk_adapter.is_available:
            return self._sdk_adapter.generate_content(video_id=video_id)

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
