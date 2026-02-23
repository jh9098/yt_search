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


def _format_subscriber_count_text(subscriber_count: int, is_public: bool) -> str:
    if not is_public:
        return "비공개"
    return _format_view_count_text(subscriber_count)


def _format_duration_text(duration_seconds: int) -> str:
    if duration_seconds <= 0:
        return "00:00"

    hours = duration_seconds // 3600
    minutes = (duration_seconds % 3600) // 60
    seconds = duration_seconds % 60

    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    return f"{minutes:02d}:{seconds:02d}"


def _format_published_date_text(published_at: datetime) -> str:
    return published_at.astimezone(timezone.utc).strftime("%Y-%m-%d")


def _collect_keyword_matches(keyword: str, title: str) -> list[str]:
    terms = [term.strip() for term in keyword.split() if term.strip()]
    lowered_title = title.lower()
    matched: list[str] = []

    for term in terms:
        if term.lower() in lowered_title and term not in matched:
            matched.append(term)

    return matched


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

        is_short_form = row.duration_seconds <= 60
        records.append(
            SearchVideoRecord(
                video_id=row.video_id,
                title=row.title,
                channel_name=row.channel_name,
                thumbnail_url=row.thumbnail_url,
                duration_seconds=row.duration_seconds,
                duration_text=_format_duration_text(row.duration_seconds),
                published_at=row.published_at,
                published_date_text=_format_published_date_text(row.published_at),
                view_count=row.view_count,
                view_count_text=_format_view_count_text(row.view_count),
                subscriber_count=row.subscriber_count,
                subscriber_count_text=_format_subscriber_count_text(
                    row.subscriber_count,
                    row.is_subscriber_public,
                ),
                country_code=row.country_code,
                is_short_form=is_short_form,
                has_script=False,
                is_subscriber_public=row.is_subscriber_public,
                keyword_matched_terms=_collect_keyword_matches(keyword, row.title),
                estimated_revenue_total_text=None,
                vph_text=None,
                badge_label="SHORTS" if is_short_form else None,
            )
        )

    return _sort_records(records, sort)
