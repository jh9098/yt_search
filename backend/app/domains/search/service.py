from __future__ import annotations

from datetime import datetime, timezone

from .client import YouTubeSearchClient
from .schemas import SearchPeriodOption, SearchSortOption, SearchVideoRecord


def _format_view_count_text(view_count: int) -> str:
    if view_count >= 100000000:
        normalized = f"{view_count / 100000000:.1f}".rstrip("0").rstrip(".")
        return f"{normalized}억"
    if view_count >= 10000:
        normalized = f"{view_count / 10000:.1f}".rstrip("0").rstrip(".")
        return f"{normalized}만"
    return f"{view_count:,}"


def _format_uploaded_at_text(published_at: datetime) -> str:
    now = datetime.now(timezone.utc)
    delta_seconds = int((now - published_at).total_seconds())

    if delta_seconds < 60:
        return "방금 전"

    delta_minutes = delta_seconds // 60
    if delta_minutes < 60:
        return f"{delta_minutes}분 전"

    delta_hours = delta_minutes // 60
    if delta_hours < 24:
        return f"{delta_hours}시간 전"

    delta_days = delta_hours // 24
    if delta_days < 7:
        return f"{delta_days}일 전"

    if delta_days < 30:
        return f"{max(1, delta_days // 7)}주 전"

    if delta_days < 365:
        return f"{max(1, delta_days // 30)}개월 전"

    return f"{max(1, delta_days // 365)}년 전"


def _sort_records(records: list[SearchVideoRecord], sort: SearchSortOption) -> list[SearchVideoRecord]:
    if sort == SearchSortOption.VIEWS:
        return sorted(records, key=lambda record: record.view_count, reverse=True)
    if sort == SearchSortOption.LATEST:
        return sorted(records, key=lambda record: record.published_at, reverse=True)
    return records


def search_videos(
    *,
    keyword: str,
    channel: str,
    sort: SearchSortOption,
    period: SearchPeriodOption,
    min_views: int,
) -> list[SearchVideoRecord]:
    client = YouTubeSearchClient()
    youtube_rows = client.fetch_videos(
        keyword=keyword,
        channel=channel,
        sort=sort,
        period=period,
    )

    records: list[SearchVideoRecord] = []
    for row in youtube_rows:
        if row.view_count < min_views:
            continue

        records.append(
            SearchVideoRecord(
                video_id=row.video_id,
                title=row.title,
                channel_name=row.channel_name,
                view_count=row.view_count,
                view_count_text=_format_view_count_text(row.view_count),
                published_at=row.published_at,
                uploaded_at_text=_format_uploaded_at_text(row.published_at),
            )
        )

    return _sort_records(records, sort)
