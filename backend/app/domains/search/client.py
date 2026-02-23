from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .schemas import SearchPeriodOption, SearchSortOption

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


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
    channel_name: str
    published_at: datetime
    view_count: int


class YouTubeSearchClient:
    def __init__(self) -> None:
        self._api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
        self._timeout_seconds = float(os.getenv("YOUTUBE_API_TIMEOUT_SECONDS", "10"))
        self._max_results = int(os.getenv("YOUTUBE_SEARCH_MAX_RESULTS", "12"))

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
    ) -> list[YoutubeVideoRaw]:
        if not self.is_configured:
            raise SearchUpstreamUnavailableError(message="YOUTUBE_API_KEY is not configured")

        search_response = self._call_youtube_api(
            YOUTUBE_SEARCH_URL,
            self._build_search_params(keyword=keyword, sort=sort, period=period),
        )
        video_ids = self._extract_video_ids(search_response)

        if len(video_ids) == 0:
            return []

        videos_response = self._call_youtube_api(
            YOUTUBE_VIDEOS_URL,
            {
                "part": "snippet,statistics",
                "id": ",".join(video_ids),
                "key": self._api_key,
            },
        )

        return self._to_video_rows(videos_response, channel=channel)

    def _build_search_params(
        self,
        *,
        keyword: str,
        sort: SearchSortOption,
        period: SearchPeriodOption,
    ) -> dict[str, str]:
        params: dict[str, str] = {
            "part": "snippet",
            "type": "video",
            "q": keyword,
            "maxResults": str(max(1, min(self._max_results, 25))),
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

        if status == 403 and "quota" in message.lower():
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
    def _to_video_rows(videos_response: dict[str, Any], channel: str) -> list[YoutubeVideoRaw]:
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
            video_id = item.get("id")

            if not isinstance(snippet, dict) or not isinstance(statistics, dict) or not isinstance(video_id, str):
                continue

            channel_title = str(snippet.get("channelTitle", "")).strip()
            if normalized_channel and normalized_channel not in channel_title.lower():
                continue

            published_at = _parse_youtube_datetime(str(snippet.get("publishedAt", "")))
            if published_at is None:
                continue

            view_count = _to_int(statistics.get("viewCount"))
            rows.append(
                YoutubeVideoRaw(
                    video_id=video_id,
                    title=str(snippet.get("title", "")).strip(),
                    channel_name=channel_title,
                    published_at=published_at,
                    view_count=view_count,
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


def _to_int(value: Any) -> int:
    try:
        return int(value)
    except Exception:
        return 0
