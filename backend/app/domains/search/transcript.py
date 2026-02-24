from __future__ import annotations

import os
import re
import tempfile
from html import unescape
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
from contextlib import contextmanager
from dataclasses import dataclass
from xml.etree import ElementTree

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
    yt_dlp_error: Exception | None = None

    try:
        import yt_dlp
    except Exception as exc:  # pragma: no cover - 의존성 미설치 환경 보호
        yt_dlp_error = exc
    else:
        options = _build_ydl_options(cookie_file_path)

        try:
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

                if url:
                    vtt_content = ydl.urlopen(url).read().decode("utf-8")
                    transcript_text = clean_vtt(vtt_content)

                    if transcript_text.strip() != "":
                        return TranscriptResult(
                            title=title,
                            transcript_text=transcript_text,
                            language=language or "unknown",
                            source=source,
                        )
        except Exception as exc:  # pragma: no cover - 네트워크/외부 요인 보호
            yt_dlp_error = exc

    fallback_result = _extract_transcript_without_yt_dlp(video_url)
    if fallback_result is not None:
        return fallback_result

    if yt_dlp_error is not None:
        raise TranscriptDependencyError("yt_dlp 없이도 대본을 가져오지 못했습니다.") from yt_dlp_error

    return None


def _extract_transcript_without_yt_dlp(video_url: str) -> TranscriptResult | None:
    video_id = _extract_video_id(video_url)
    if not video_id:
        return None

    for lang, source in (("ko", "subtitle"), ("en", "subtitle"), ("ko", "automatic"), ("en", "automatic")):
        transcript_text = _fetch_timedtext(video_id=video_id, lang=lang, automatic=(source == "automatic"))
        if transcript_text:
            return TranscriptResult(
                title=_fetch_video_title(video_id) or "video",
                transcript_text=transcript_text,
                language=lang,
                source=source,
            )

    return None


def _extract_video_id(video_url: str) -> str:
    parsed = urlparse(video_url.strip())
    if parsed.path == "/watch":
        return parse_qs(parsed.query).get("v", [""])[0].strip()

    if parsed.netloc in {"youtu.be", "www.youtu.be"}:
        return parsed.path.strip("/")

    if parsed.path.startswith("/shorts/"):
        return parsed.path.split("/", 2)[2].strip()

    return ""


def _fetch_timedtext(video_id: str, lang: str, automatic: bool) -> str | None:
    kind = "&kind=asr" if automatic else ""
    url = f"https://www.youtube.com/api/timedtext?v={video_id}&lang={lang}{kind}&fmt=srv3"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urlopen(req, timeout=10) as response:
            xml_content = response.read().decode("utf-8", errors="ignore")
    except Exception:
        return None

    if "<text" not in xml_content:
        return None

    try:
        root = ElementTree.fromstring(xml_content)
    except ElementTree.ParseError:
        return None

    chunks: list[str] = []
    for node in root.findall(".//text"):
        value = (node.text or "").strip()
        if value:
            chunks.append(unescape(value).replace("\n", " "))

    cleaned = "\n".join(chunks).strip()
    return cleaned or None


def _fetch_video_title(video_id: str) -> str | None:
    oembed_url = (
        "https://www.youtube.com/oembed"
        f"?url=https://www.youtube.com/watch?v={video_id}&format=json"
    )
    req = Request(oembed_url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urlopen(req, timeout=10) as response:
            payload = response.read().decode("utf-8", errors="ignore")
    except Exception:
        return None

    title_match = re.search(r'"title"\s*:\s*"([^"]+)"', payload)
    if not title_match:
        return None

    return unescape(title_match.group(1)).strip() or None
