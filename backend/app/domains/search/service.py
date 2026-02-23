from __future__ import annotations

from datetime import datetime, timezone

from .client import YouTubeSearchClient
from .schemas import (
    SearchCorePreset,
    SearchDurationBucket,
    SearchPeriodOption,
    SearchScriptType,
    SearchShortFormType,
    SearchSortOption,
    SearchVideoRecord,
)


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


def _format_percent_text(value: float) -> str:
    return f"{value:.2f}%"


def _format_uploads_per_week_text(value: float) -> str:
    return f"주 {value:.2f}개"


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


def _match_duration(duration_seconds: int, duration_bucket: SearchDurationBucket) -> bool:
    if duration_bucket == SearchDurationBucket.UNDER_4M:
        return duration_seconds < 240
    if duration_bucket == SearchDurationBucket.BETWEEN_4M_AND_20M:
        return 240 <= duration_seconds <= 1200
    if duration_bucket == SearchDurationBucket.OVER_20M:
        return duration_seconds > 1200
    return True


def _match_short_form(is_short_form: bool, short_form_type: SearchShortFormType) -> bool:
    if short_form_type == SearchShortFormType.SHORTS:
        return is_short_form
    if short_form_type == SearchShortFormType.LONGFORM:
        return not is_short_form
    return True


def _match_script(has_script: bool, script_type: SearchScriptType) -> bool:
    if script_type == SearchScriptType.SCRIPTED:
        return has_script
    if script_type == SearchScriptType.NO_SCRIPT:
        return not has_script
    return True


def _compute_channel_grade(subscribers: int) -> str:
    if subscribers >= 1_000_000:
        return "A1"
    if subscribers >= 300_000:
        return "B1"
    if subscribers >= 100_000:
        return "C1"
    if subscribers >= 30_000:
        return "C2"
    return "C3"


def _match_core_preset(
    core_preset: SearchCorePreset,
    *,
    channel_age_days: int,
    subscriber_count: int,
    total_video_count: int,
    subscription_rate: float,
    annual_subscriber_growth: int,
    country_code: str,
) -> bool:
    if core_preset == SearchCorePreset.NONE:
        return True

    if core_preset == SearchCorePreset.NEW_RAPID_GROWTH:
        return channel_age_days <= 730 and subscriber_count >= 15000

    if core_preset == SearchCorePreset.EFFICIENCY_MONSTER:
        return total_video_count > 0 and total_video_count <= 20 and subscription_rate >= 1.0

    if core_preset == SearchCorePreset.FAST_RISING:
        return annual_subscriber_growth >= 100000

    if core_preset == SearchCorePreset.KR_TREND:
        return country_code.upper() == "KR"

    if core_preset == SearchCorePreset.GLOBAL_TREND:
        return country_code.upper() != "KR"

    return True


def search_videos(
    *,
    keyword: str,
    channel: str,
    sort: SearchSortOption,
    period: SearchPeriodOption,
    min_views: int,
    country: str,
    max_subscribers: int,
    subscriber_public_only: bool,
    duration_bucket: SearchDurationBucket,
    short_form_type: SearchShortFormType,
    script_type: SearchScriptType,
    min_performance: int,
    core_preset: SearchCorePreset,
) -> list[SearchVideoRecord]:
    client = YouTubeSearchClient()
    youtube_rows = client.fetch_videos(
        keyword=keyword,
        channel=channel,
        sort=sort,
        period=period,
    )

    normalized_country = country.strip().upper()

    records: list[SearchVideoRecord] = []
    now = datetime.now(timezone.utc)

    for row in youtube_rows:
        if row.view_count < min_views:
            continue

        if normalized_country and row.country_code.upper() != normalized_country:
            continue

        if max_subscribers > 0:
            if not row.is_subscriber_public:
                continue
            if row.subscriber_count > max_subscribers:
                continue

        if subscriber_public_only and not row.is_subscriber_public:
            continue

        is_short_form = row.duration_seconds <= 60
        has_script = False

        if not _match_duration(row.duration_seconds, duration_bucket):
            continue

        if not _match_short_form(is_short_form, short_form_type):
            continue

        if not _match_script(has_script, script_type):
            continue

        channel_age_days = max((now - row.channel_published_at).days, 1)
        channel_age_years = max(channel_age_days / 365.0, 0.01)
        subscription_rate = (row.subscriber_count / row.channel_view_count * 100) if row.channel_view_count > 0 else 0.0
        annual_subscriber_growth = int(row.subscriber_count / channel_age_years)
        uploads_per_week = row.total_video_count / (channel_age_days / 7)
        grade = _compute_channel_grade(row.subscriber_count)

        if not _match_core_preset(
            core_preset,
            channel_age_days=channel_age_days,
            subscriber_count=row.subscriber_count,
            total_video_count=row.total_video_count,
            subscription_rate=subscription_rate,
            annual_subscriber_growth=annual_subscriber_growth,
            country_code=row.country_code,
        ):
            continue

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
                channel_published_at=row.channel_published_at,
                channel_published_date_text=_format_published_date_text(row.channel_published_at),
                country_code=row.country_code,
                total_video_count=row.total_video_count,
                total_video_count_text=f"{row.total_video_count:,}",
                subscription_rate=subscription_rate,
                subscription_rate_text=_format_percent_text(subscription_rate),
                annual_subscriber_growth=annual_subscriber_growth,
                annual_subscriber_growth_text=f"연 {annual_subscriber_growth:,}명",
                uploads_per_week=uploads_per_week,
                uploads_per_week_text=_format_uploads_per_week_text(uploads_per_week),
                channel_grade=grade,
                is_short_form=is_short_form,
                has_script=has_script,
                is_subscriber_public=row.is_subscriber_public,
                keyword_matched_terms=_collect_keyword_matches(keyword, row.title),
                estimated_revenue_total_text=None,
                vph_text=None,
                badge_label="SHORTS" if is_short_form else None,
            )
        )

    return _sort_records(records, sort)
