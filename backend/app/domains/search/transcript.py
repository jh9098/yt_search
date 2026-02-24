from __future__ import annotations

import json
import os
import re
import tempfile
import traceback
from contextlib import contextmanager
from dataclasses import dataclass
from html import unescape
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree

_CUE_RE = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}")

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_COOKIE_PATH = BASE_DIR / "cookies.txt"
YTDLP_IMPORT_ERROR: str | None = None

try:
    import yt_dlp  # type: ignore
except Exception as error:  # pragma: no cover - 의존성 미설치 환경 보호
    yt_dlp = None
    YTDLP_IMPORT_ERROR = repr(error)


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
        print("[yt-dlp]", message)


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


def resolve_default_cookie_path() -> Path | None:
    env_cookie_path = os.getenv("YTDLP_COOKIEFILE", "").strip()
    if env_cookie_path:
        env_path = Path(env_cookie_path)
        if env_path.exists():
            return env_path

    if DEFAULT_COOKIE_PATH.exists():
        return DEFAULT_COOKIE_PATH

    return None


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
        "cachedir": False,
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


def build_transcript_health() -> dict:
    cookie_path = resolve_default_cookie_path()
    return {
        "ok": True,
        "yt_dlp_import_ok": yt_dlp is not None,
        "yt_dlp_import_error": YTDLP_IMPORT_ERROR,
        "cookie_found": bool(cookie_path),
        "cookie_path": str(cookie_path) if cookie_path else "",
        "cwd": os.getcwd(),
        "base_dir": str(BASE_DIR),
    }


@contextmanager
def resolve_cookie_file_path(cookie_file_path: str | None, cookie_content: str | None):
    cleaned_path = (cookie_file_path or "").strip()
    if cleaned_path:
        yield cleaned_path
        return

    default_cookie_path = resolve_default_cookie_path()
    if default_cookie_path is not None:
        yield str(default_cookie_path)
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


def extract_text_and_title(video_url: str, cookie_file_path: str | None = None) -> tuple[str | None, str, dict]:
    if yt_dlp is None:
        raise TranscriptDependencyError(f"YT_DLP_IMPORT_FAILED: {YTDLP_IMPORT_ERROR}")

    options = _build_ydl_options(cookie_file_path)
    debug_meta: dict[str, object] = {
        "using_cookie": bool(cookie_file_path),
        "cookie_path": cookie_file_path or "",
        "ydl_opts_keys": sorted(list(options.keys())),
    }

    with yt_dlp.YoutubeDL(options) as ydl:  # type: ignore[union-attr]
        info = ydl.extract_info(video_url, download=False)
        title = (info.get("title") or "video").strip() or "video"
        subtitles = info.get("subtitles") or {}
        auto_captions = info.get("automatic_captions") or {}

        debug_meta["has_subtitles_keys"] = sorted(list(subtitles.keys()))[:20]
        debug_meta["has_auto_captions_keys"] = sorted(list(auto_captions.keys()))[:20]

        url, language = _pick_vtt_track(subtitles, ("ko", "ko-KR", "ko_KR", "en"))
        source = "subtitle"

        if not url:
            url, language = _pick_vtt_track(auto_captions, ("ko", "ko-KR", "ko_KR", "en"))
            source = "automatic"

        if not url:
            return None, title, debug_meta

        vtt_content = ydl.urlopen(url).read().decode("utf-8", "ignore")
        transcript_text = clean_vtt(vtt_content)

        debug_meta["source"] = source
        debug_meta["language"] = language or "unknown"

        if transcript_text.strip() == "":
            return None, title, debug_meta

        return transcript_text, title, debug_meta


def extract_transcript_from_video_url(video_url: str, cookie_file_path: str | None = None) -> TranscriptResult | None:
    yt_dlp_error: Exception | None = None

    try:
        transcript_text, title, debug_meta = extract_text_and_title(video_url, cookie_file_path=cookie_file_path)
        if transcript_text:
            return TranscriptResult(
                title=title,
                transcript_text=transcript_text,
                language=str(debug_meta.get("language") or "unknown"),
                source=str(debug_meta.get("source") or "subtitle"),
            )
    except Exception as error:  # pragma: no cover - 네트워크/외부 요인 보호
        yt_dlp_error = error
        print("[TRANSCRIPT_ERROR]", repr(error))
        print(traceback.format_exc())

    fallback_result = _extract_transcript_without_yt_dlp(video_url)
    if fallback_result is not None:
        return fallback_result

    if yt_dlp_error is not None:
        raise TranscriptDependencyError("yt_dlp 없이도 대본을 가져오지 못했습니다.") from yt_dlp_error

    return None


def _extract_transcript_without_yt_dlp(video_url: str) -> TranscriptResult | None:
    player_response_result = _extract_transcript_from_player_response(video_url)
    if player_response_result is not None:
        return player_response_result

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


def _extract_transcript_from_player_response(video_url: str) -> TranscriptResult | None:
    req = Request(video_url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urlopen(req, timeout=10) as response:
            html = response.read().decode("utf-8", errors="ignore")
    except Exception:
        return None

    player_response_json = _extract_player_response_json_from_html(html)
    if not player_response_json:
        return None

    try:
        payload = json.loads(player_response_json)
    except json.JSONDecodeError:
        return None

    tracks = (
        payload.get("captions", {})
        .get("playerCaptionsTracklistRenderer", {})
        .get("captionTracks", [])
    )
    if not tracks:
        return None

    selected_track = _pick_caption_track_from_player_response(tracks)
    if selected_track is None:
        return None

    transcript_text = _fetch_caption_track_text(selected_track.get("baseUrl") or "")
    if not transcript_text:
        return None

    language = (selected_track.get("languageCode") or "unknown").strip() or "unknown"
    source = "automatic" if selected_track.get("kind") == "asr" else "subtitle"
    title = (
        payload.get("videoDetails", {}).get("title")
        or _fetch_video_title(_extract_video_id(video_url))
        or "video"
    )

    return TranscriptResult(
        title=title,
        transcript_text=transcript_text,
        language=language,
        source=source,
    )


def _extract_player_response_json_from_html(html: str) -> str | None:
    marker = "ytInitialPlayerResponse"
    marker_index = html.find(marker)
    if marker_index < 0:
        return None

    assignment_index = html.find("=", marker_index)
    if assignment_index < 0:
        return None

    start_index = html.find("{", assignment_index)
    if start_index < 0:
        return None

    depth = 0
    in_string = False
    escaped = False

    for idx in range(start_index, len(html)):
        char = html[idx]

        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
            continue

        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return html[start_index : idx + 1]

    return None


def _pick_caption_track_from_player_response(tracks: list[dict]) -> dict | None:
    if not tracks:
        return None

    preferred_languages = ("ko", "ko-KR", "ko_KR", "en")

    for lang in preferred_languages:
        for track in tracks:
            track_lang = (track.get("languageCode") or "").strip()
            if track_lang == lang:
                return track

    for lang in preferred_languages:
        for track in tracks:
            track_lang = (track.get("languageCode") or "").strip()
            if track_lang.startswith(f"{lang}-"):
                return track

    return tracks[0]


def _fetch_caption_track_text(base_url: str) -> str | None:
    clean_url = unescape(base_url.strip())
    if clean_url == "":
        return None

    if "fmt=" not in clean_url:
        separator = "&" if "?" in clean_url else "?"
        clean_url = f"{clean_url}{separator}fmt=srv3"

    req = Request(clean_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urlopen(req, timeout=10) as response:
            xml_content = response.read().decode("utf-8", errors="ignore")
    except Exception:
        return None

    return _parse_timedtext_xml(xml_content)


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

    return _parse_timedtext_xml(xml_content)


def _parse_timedtext_xml(xml_content: str) -> str | None:
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
