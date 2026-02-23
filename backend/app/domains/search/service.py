from __future__ import annotations

from datetime import datetime, timedelta, timezone

from .schemas import SearchPeriodOption, SearchSortOption, SearchVideoRecord

NOW_UTC = datetime.now(timezone.utc)

SEARCH_VIDEO_RECORDS: tuple[SearchVideoRecord, ...] = (
    SearchVideoRecord(
        video_id="video_family_talk_001",
        title="가족과 대화가 자꾸 꼬일 때 감정 다루는 법",
        channel_name="마음연구소",
        view_count=420000,
        view_count_text="42만",
        published_at=NOW_UTC - timedelta(days=3),
        uploaded_at_text="3일 전",
    ),
    SearchVideoRecord(
        video_id="video_conflict_case_002",
        title="부부 갈등 대화, 왜 반복될까?",
        channel_name="관계코치TV",
        view_count=180000,
        view_count_text="18만",
        published_at=NOW_UTC - timedelta(days=6),
        uploaded_at_text="1주 전",
    ),
    SearchVideoRecord(
        video_id="video_work_life_003",
        title="퇴근 후 에너지 회복 루틴 5가지",
        channel_name="직장인회복실",
        view_count=97000,
        view_count_text="9.7만",
        published_at=NOW_UTC - timedelta(days=14),
        uploaded_at_text="2주 전",
    ),
)


def _contains_keyword(source: str, keyword: str) -> bool:
    if keyword == "":
        return True
    return keyword in source.lower()


def _is_in_period(record: SearchVideoRecord, period: SearchPeriodOption) -> bool:
    if period == SearchPeriodOption.ALL:
        return True

    delta = NOW_UTC - record.published_at
    if period == SearchPeriodOption.LAST_24_HOURS:
        return delta <= timedelta(hours=24)
    if period == SearchPeriodOption.LAST_7_DAYS:
        return delta <= timedelta(days=6)
    return delta <= timedelta(days=30)


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
    normalized_keyword = keyword.strip().lower()
    normalized_channel = channel.strip().lower()

    filtered_records = [
        record
        for record in SEARCH_VIDEO_RECORDS
        if _contains_keyword(record.title.lower(), normalized_keyword)
        and _contains_keyword(record.channel_name.lower(), normalized_channel)
        and _is_in_period(record, period)
        and record.view_count >= min_views
    ]

    return _sort_records(filtered_records, sort)
