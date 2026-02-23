from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .schemas import SearchPeriodOption, SearchSortOption

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
YOUTUBE_CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels"


@dataclass(frozen=True)
class SearchQuotaExceededError(Exception):
    message: str = "youtube quota exceeded"


@dataclass(frozen=True)
class SearchRateLimitedError(Exception):
    message: str = "youtube rate limited"


@dataclass(frozen=True)
class SearchUpstreamUnavailableError(Exception):
    message: str = "youtube upstream unavailable"


@dataclass(frozen=True)
class SearchUpstreamError(Exception):
    message: str = "youtube upstream error"


@dataclass(frozen=True)
class YoutubeVideoRaw:
    video_id: str
    title: str
    channel_id: str
    channel_name: str
    thumbnail_url: str
    published_at: datetime
    duration_seconds: int
    view_count: int
    subscriber_count: int
    is_subscriber_public: bool
    country_code: str
    channel_published_at: datetime
    total_video_count: int
    channel_view_count: int


class YouTubeSearchClient:
    def __init__(self) -> None:
        self._api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
        self._timeout_seconds = float(os.getenv("YOUTUBE_API_TIMEOUT_SECONDS", "10"))
        self._max_results = int(os.getenv("YOUTUBE_SEARCH_MAX_RESULTS", "50"))

    @property
    def is_configured(self) -> bool:
        return self._api_key != ""

    def fetch_videos(
        self,
        *,
        keyword: str,
        channel: str,
        sort: SearchSortOption,
        period: SearchPeriodOption,
        result_limit: int,
    ) -> list[YoutubeVideoRaw]:
        if not self.is_configured:
            raise SearchUpstreamUnavailableError(message="YOUTUBE_API_KEY is not configured")

        normalized_keyword = keyword.strip()
        normalized_channel = channel.strip()
        effective_query = normalized_keyword if normalized_keyword != "" else normalized_channel

        search_response = self._call_youtube_api(
            YOUTUBE_SEARCH_URL,
            self._build_search_params(keyword=effective_query, sort=sort, period=period, result_limit=result_limit),
        )
        video_ids = self._extract_video_ids(search_response)

        if len(video_ids) == 0:
            return []

        videos_response = self._call_youtube_api(
            YOUTUBE_VIDEOS_URL,
            {
                "part": "snippet,statistics,contentDetails",
                "id": ",".join(video_ids),
                "key": self._api_key,
            },
        )

        channel_ids = self._extract_channel_ids(videos_response)
        channel_map = self._fetch_channel_map(channel_ids)
        return self._to_video_rows(videos_response, channel=channel, channel_map=channel_map)

    def _fetch_channel_map(self, channel_ids: list[str]) -> dict[str, dict[str, Any]]:
        if len(channel_ids) == 0:
            return {}

        channels_response = self._call_youtube_api(
            YOUTUBE_CHANNELS_URL,
            {
                "part": "snippet,statistics",
                "id": ",".join(channel_ids),
                "key": self._api_key,
            },
        )

        items = channels_response.get("items")
        if not isinstance(items, list):
            return {}

        mapped: dict[str, dict[str, Any]] = {}
        for item in items:
            if not isinstance(item, dict):
                continue
            channel_id = item.get("id")
            if not isinstance(channel_id, str) or channel_id == "":
                continue
            mapped[channel_id] = item
        return mapped

    def _build_search_params(
        self,
        *,
        keyword: str,
        sort: SearchSortOption,
        period: SearchPeriodOption,
        result_limit: int,
    ) -> dict[str, str]:
        params: dict[str, str] = {
            "part": "snippet",
            "type": "video",
            "q": keyword,
            "maxResults": str(max(1, min(self._max_results, result_limit, 50))),
            "order": self._to_youtube_sort(sort),
            "key": self._api_key,
        }

        published_after = self._to_published_after(period)
        if published_after is not None:
            params["publishedAfter"] = published_after

        return params

    @staticmethod
    def _to_youtube_sort(sort: SearchSortOption) -> str:
        if sort == SearchSortOption.VIEWS:
            return "viewCount"
        if sort == SearchSortOption.LATEST:
            return "date"
        return "relevance"

    @staticmethod
    def _to_published_after(period: SearchPeriodOption) -> str | None:
        now = datetime.now(timezone.utc)
        if period == SearchPeriodOption.LAST_24_HOURS:
            return (now - timedelta(hours=24)).isoformat().replace("+00:00", "Z")
        if period == SearchPeriodOption.LAST_7_DAYS:
            return (now - timedelta(days=7)).isoformat().replace("+00:00", "Z")
        if period == SearchPeriodOption.LAST_30_DAYS:
            return (now - timedelta(days=30)).isoformat().replace("+00:00", "Z")
        if period == SearchPeriodOption.LAST_90_DAYS:
            return (now - timedelta(days=90)).isoformat().replace("+00:00", "Z")
        if period == SearchPeriodOption.LAST_180_DAYS:
            return (now - timedelta(days=180)).isoformat().replace("+00:00", "Z")
        if period == SearchPeriodOption.LAST_365_DAYS:
            return (now - timedelta(days=365)).isoformat().replace("+00:00", "Z")
        if period == SearchPeriodOption.LAST_730_DAYS:
            return (now - timedelta(days=730)).isoformat().replace("+00:00", "Z")
        return None

    def _call_youtube_api(self, url: str, params: dict[str, str]) -> dict[str, Any]:
        query_string = urlencode(params)
        request = Request(f"{url}?{query_string}", method="GET")

        try:
            with urlopen(request, timeout=self._timeout_seconds) as response:
                payload = response.read().decode("utf-8")
                parsed = json.loads(payload)
                if not isinstance(parsed, dict):
                    raise SearchUpstreamError(message="youtube response is not an object")
                return parsed
        except HTTPError as http_error:
            raise self._map_http_error(http_error) from http_error
        except URLError as url_error:
            raise SearchUpstreamUnavailableError(message=str(url_error.reason)) from url_error
        except TimeoutError as timeout_error:
            raise SearchUpstreamUnavailableError(message="youtube timeout") from timeout_error
        except json.JSONDecodeError as decode_error:
            raise SearchUpstreamError(message="youtube invalid json") from decode_error

    def _map_http_error(self, http_error: HTTPError) -> Exception:
        status = http_error.code
        try:
            payload = http_error.read().decode("utf-8")
            parsed = json.loads(payload)
        except Exception:
            parsed = {}

        message = json.dumps(parsed, ensure_ascii=False) if parsed else str(http_error)
        lowered_message = message.lower()

        if status == 400 and "api key not valid" in lowered_message:
            return SearchUpstreamUnavailableError(message="youtube api key is invalid")
        if status == 403 and "quota" in lowered_message:
            return SearchQuotaExceededError()
        if status == 429:
            return SearchRateLimitedError()
        if status in {500, 502, 503, 504}:
            return SearchUpstreamUnavailableError()
        return SearchUpstreamError(message=f"status={status}")

    @staticmethod
    def _extract_video_ids(search_response: dict[str, Any]) -> list[str]:
        items = search_response.get("items")
        if not isinstance(items, list):
            return []

        video_ids: list[str] = []
        for item in items:
            if not isinstance(item, dict):
                continue
            identifier = item.get("id")
            if not isinstance(identifier, dict):
                continue
            video_id = identifier.get("videoId")
            if isinstance(video_id, str) and video_id != "":
                video_ids.append(video_id)

        return video_ids

    @staticmethod
    def _extract_channel_ids(videos_response: dict[str, Any]) -> list[str]:
        items = videos_response.get("items")
        if not isinstance(items, list):
            return []

        deduped: list[str] = []
        seen: set[str] = set()
        for item in items:
            if not isinstance(item, dict):
                continue
            snippet = item.get("snippet")
            if not isinstance(snippet, dict):
                continue
            channel_id = snippet.get("channelId")
            if not isinstance(channel_id, str) or channel_id == "" or channel_id in seen:
                continue
            seen.add(channel_id)
            deduped.append(channel_id)

        return deduped

    @staticmethod
    def _to_video_rows(
        videos_response: dict[str, Any],
        channel: str,
        channel_map: dict[str, dict[str, Any]],
    ) -> list[YoutubeVideoRaw]:
        items = videos_response.get("items")
        if not isinstance(items, list):
            return []

        normalized_channel = channel.strip().lower()
        rows: list[YoutubeVideoRaw] = []

        for item in items:
            if not isinstance(item, dict):
                continue

            snippet = item.get("snippet")
            statistics = item.get("statistics")
            content_details = item.get("contentDetails")
            video_id = item.get("id")

            if (
                not isinstance(snippet, dict)
                or not isinstance(statistics, dict)
                or not isinstance(content_details, dict)
                or not isinstance(video_id, str)
            ):
                continue

            channel_id = str(snippet.get("channelId", "")).strip()
            channel_title = str(snippet.get("channelTitle", "")).strip()
            if normalized_channel and normalized_channel not in channel_title.lower():
                continue

            published_at = _parse_youtube_datetime(str(snippet.get("publishedAt", "")))
            if published_at is None:
                continue

            thumbnails = snippet.get("thumbnails")
            thumbnail_url = _extract_best_thumbnail_url(thumbnails)

            duration_seconds = _parse_iso8601_duration_to_seconds(str(content_details.get("duration", "")))
            view_count = _to_int(statistics.get("viewCount"))

            channel_item = channel_map.get(channel_id, {})
            channel_statistics = channel_item.get("statistics") if isinstance(channel_item, dict) else {}
            channel_snippet = channel_item.get("snippet") if isinstance(channel_item, dict) else {}
            if not isinstance(channel_statistics, dict):
                channel_statistics = {}
            if not isinstance(channel_snippet, dict):
                channel_snippet = {}

            hidden_subscriber_count = bool(channel_statistics.get("hiddenSubscriberCount", False))
            subscriber_count = _to_int(channel_statistics.get("subscriberCount"))
            total_video_count = _to_int(channel_statistics.get("videoCount"))
            channel_view_count = _to_int(channel_statistics.get("viewCount"))
            country_code = str(channel_snippet.get("country", "")).strip() or "N/A"
            channel_published_at = _parse_youtube_datetime(str(channel_snippet.get("publishedAt", "")))
            if channel_published_at is None:
                channel_published_at = published_at

            rows.append(
                YoutubeVideoRaw(
                    video_id=video_id,
                    title=str(snippet.get("title", "")).strip(),
                    channel_id=channel_id,
                    channel_name=channel_title,
                    thumbnail_url=thumbnail_url,
                    published_at=published_at,
                    duration_seconds=duration_seconds,
                    view_count=view_count,
                    subscriber_count=subscriber_count,
                    is_subscriber_public=not hidden_subscriber_count,
                    country_code=country_code,
                    channel_published_at=channel_published_at,
                    total_video_count=total_video_count,
                    channel_view_count=channel_view_count,
                )
            )

        return rows


def _parse_youtube_datetime(value: str) -> datetime | None:
    if value == "":
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _extract_best_thumbnail_url(thumbnails: Any) -> str:
    if not isinstance(thumbnails, dict):
        return ""

    for key in ("maxres", "standard", "high", "medium", "default"):
        candidate = thumbnails.get(key)
        if not isinstance(candidate, dict):
            continue
        url = candidate.get("url")
        if isinstance(url, str) and url.strip() != "":
            return url

    return ""


def _parse_iso8601_duration_to_seconds(raw: str) -> int:
    if raw == "":
        return 0

    pattern = re.compile(r"^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$")
    matched = pattern.match(raw)
    if not matched:
        return 0

    hours = int(matched.group(1) or 0)
    minutes = int(matched.group(2) or 0)
    seconds = int(matched.group(3) or 0)
    return (hours * 3600) + (minutes * 60) + seconds


def _to_int(value: Any) -> int:
    try:
        return int(value)
    except Exception:
        return 0
