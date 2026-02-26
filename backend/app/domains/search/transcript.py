from __future__ import annotations

import os
import logging
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

from youtube_transcript_api import (
    CouldNotRetrieveTranscript,
    NoTranscriptFound,
    RequestBlocked,
    TranscriptsDisabled,
    YouTubeTranscriptApi,
)
from youtube_transcript_api.proxies import WebshareProxyConfig


logger = logging.getLogger(__name__)


class TranscriptDependencyError(RuntimeError):
    """자막 추출 라이브러리 의존성 문제가 발생했을 때 사용합니다."""


@dataclass
class TranscriptSegment:
    text: str
    start: float
    duration: float


@dataclass
class TranscriptResult:
    title: str
    transcript_text: str
    language: str
    source: str
    segments: list[TranscriptSegment]


YTDLP_IMPORT_ERROR = ""


def parse_language_priority(languages: str | list[str] | None) -> list[str]:
    if isinstance(languages, list):
        raw_languages = [str(lang).strip() for lang in languages]
    else:
        raw_languages = [lang.strip() for lang in (languages or "").split(",")]

    valid_languages = [lang for lang in raw_languages if lang]
    return valid_languages or ["ko", "en"]


def extract_video_id(target: str) -> str:
    cleaned_target = target.strip()
    if cleaned_target == "":
        return ""

    if len(cleaned_target) == 11 and "/" not in cleaned_target and "?" not in cleaned_target:
        return cleaned_target

    parsed = urlparse(cleaned_target)

    if parsed.path == "/watch":
        return parse_qs(parsed.query).get("v", [""])[0].strip()

    if parsed.netloc in {"youtu.be", "www.youtu.be"}:
        return parsed.path.strip("/")

    if parsed.path.startswith("/shorts/"):
        return parsed.path.split("/", 2)[2].strip()

    return ""


def _build_transcript_api() -> YouTubeTranscriptApi:
    username = os.getenv("WEBSHARE_USERNAME", "").strip()
    password = os.getenv("WEBSHARE_PASSWORD", "").strip()

    if username and password:
        logger.info("Webshare proxy configured for transcript API")
        proxy_config = WebshareProxyConfig(
            proxy_username=username,
            proxy_password=password,
        )
        return YouTubeTranscriptApi(proxy_config=proxy_config)

    logger.warning("Webshare proxy is not configured; transcript requests may be blocked")
    return YouTubeTranscriptApi()


def build_transcript_health() -> dict:
    has_proxy_config = bool(os.getenv("WEBSHARE_USERNAME", "").strip() and os.getenv("WEBSHARE_PASSWORD", "").strip())
    return {
        "ok": True,
        "proxy": "enabled" if has_proxy_config else "disabled",
        "proxy_configured": has_proxy_config,
    }


def extract_transcript_from_video(video_target: str, languages: list[str]) -> TranscriptResult | None:
    video_id = extract_video_id(video_target)
    if video_id == "":
        return None

    transcript_api = _build_transcript_api()

    transcript = transcript_api.fetch(video_id, languages=languages)
    raw_segments = transcript.to_raw_data()

    segments = [
        TranscriptSegment(
            text=str(item.get("text") or "").strip(),
            start=float(item.get("start") or 0.0),
            duration=float(item.get("duration") or 0.0),
        )
        for item in raw_segments
        if str(item.get("text") or "").strip()
    ]

    transcript_text = " ".join(segment.text for segment in segments).strip()

    if transcript_text == "":
        return None

    return TranscriptResult(
        title="video",
        transcript_text=transcript_text,
        language=transcript.language_code,
        source="youtube_transcript_api",
        segments=segments,
    )


__all__ = [
    "CouldNotRetrieveTranscript",
    "NoTranscriptFound",
    "RequestBlocked",
    "TranscriptDependencyError",
    "TranscriptResult",
    "TranscriptsDisabled",
    "YTDLP_IMPORT_ERROR",
    "build_transcript_health",
    "extract_transcript_from_video",
    "parse_language_priority",
]
