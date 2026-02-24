from __future__ import annotations

import os
import re
import tempfile
from contextlib import contextmanager
from dataclasses import dataclass

_CUE_RE = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}")


class TranscriptDependencyError(RuntimeError):
    """자막 추출 라이브러리(yt_dlp) 사용이 불가능할 때 발생."""


@dataclass(slots=True)
class TranscriptResult:
    title: str
    transcript_text: str
    language: str
    source: str


class _QuietLogger:
    def debug(self, message: str) -> None:
        return None

    def info(self, message: str) -> None:
        return None

    def warning(self, message: str) -> None:
        return None

    def error(self, message: str) -> None:
        print(message)


def clean_vtt(vtt_text: str) -> str:
    lines = vtt_text.splitlines()
    result: list[str] = []
    previous = ""

    for line in lines:
        if _CUE_RE.match(line):
            continue

        stripped = line.strip()
        if stripped.startswith(("WEBVTT", "Kind:", "Language:", "NOTE", "align:", "position:")):
            continue

        cleaned = re.sub(r"<[^>]+>", "", line).strip()
        if cleaned and cleaned != previous:
            result.append(cleaned)
            previous = cleaned

    return "\n".join(result)


def _build_ydl_options(cookie_file_path: str | None) -> dict:
    options: dict = {
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "quiet": True,
        "no_warnings": True,
        "logger": _QuietLogger(),
        "forcejson": True,
        "simulate": True,
        "http_headers": {"User-Agent": "Mozilla/5.0"},
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "ios"],
                "skip": ["dash", "hls"],
            }
        },
    }

    if cookie_file_path and os.path.exists(cookie_file_path):
        options["cookiefile"] = cookie_file_path

    proxy_url = os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY")
    if proxy_url:
        options["proxy"] = proxy_url

    return options


@contextmanager
def resolve_cookie_file_path(cookie_file_path: str | None, cookie_content: str | None):
    cleaned_path = (cookie_file_path or "").strip()
    if cleaned_path:
        yield cleaned_path
        return

    cleaned_content = (cookie_content or "").strip()
    if not cleaned_content:
        yield None
        return

    temp_cookie_file: str | None = None
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as temp_file:
            temp_file.write(cleaned_content)
            temp_cookie_file = temp_file.name

        yield temp_cookie_file
    finally:
        if temp_cookie_file and os.path.exists(temp_cookie_file):
            os.remove(temp_cookie_file)


def _pick_vtt_track(subtitles_by_language: dict, preferred_languages: tuple[str, ...]) -> tuple[str | None, str | None]:
    for language in preferred_languages:
        language_formats = subtitles_by_language.get(language) or []
        for subtitle_format in language_formats:
            if subtitle_format.get("ext") == "vtt" and subtitle_format.get("url"):
                return subtitle_format["url"], language

    for language, language_formats in subtitles_by_language.items():
        for subtitle_format in language_formats:
            if subtitle_format.get("ext") == "vtt" and subtitle_format.get("url"):
                return subtitle_format["url"], language

    return None, None


def extract_transcript_from_video_url(video_url: str, cookie_file_path: str | None = None) -> TranscriptResult | None:
    try:
        import yt_dlp
    except Exception as exc:  # pragma: no cover - 의존성 미설치 환경 보호
        raise TranscriptDependencyError("yt_dlp 패키지가 필요합니다.") from exc

    options = _build_ydl_options(cookie_file_path)

    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(video_url, download=False)
        title = (info.get("title") or "video").strip() or "video"
        subtitles = info.get("subtitles") or {}
        auto_captions = info.get("automatic_captions") or {}

        url, language = _pick_vtt_track(subtitles, ("ko", "ko-KR", "ko_KR", "en"))
        source = "subtitle"

        if not url:
            url, language = _pick_vtt_track(auto_captions, ("ko", "ko-KR", "ko_KR", "en"))
            source = "automatic"

        if not url:
            return None

        vtt_content = ydl.urlopen(url).read().decode("utf-8")
        transcript_text = clean_vtt(vtt_content)

        if transcript_text.strip() == "":
            return None

        return TranscriptResult(
            title=title,
            transcript_text=transcript_text,
            language=language or "unknown",
            source=source,
        )
