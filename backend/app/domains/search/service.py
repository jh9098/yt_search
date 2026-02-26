from __future__ import annotations

from datetime import datetime, timezone

from .client import YouTubeSearchClient
from .scoring import (
    classify_contribution_grade,
    compute_contribution,
    compute_engagement_rate,
    compute_exposure_score,
    compute_performance_score,
    is_hot_video,
)
from .schemas import (
    SearchCorePreset,
    SearchDurationBucket,
    SearchPeriodOption,
    SearchScriptType,
    SearchShortFormType,
    SearchSortOption,
    SearchTopicOption,
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


def _normalize_scores(records: list[SearchVideoRecord], accessor: str) -> dict[str, float]:
    values = [getattr(record, accessor) for record in records]
    minimum = min(values)
    maximum = max(values)

    if minimum == maximum:
        return {record.video_id: 100.0 for record in records}

    result: dict[str, float] = {}
    for record in records:
        value = getattr(record, accessor)
        normalized = ((value - minimum) / (maximum - minimum)) * 100.0
        result[record.video_id] = normalized
    return result


def _sort_records(records: list[SearchVideoRecord], sort: SearchSortOption) -> list[SearchVideoRecord]:
    if len(records) == 0:
        return records

    if sort == SearchSortOption.SUBSCRIBER_ASC:
        return sorted(records, key=lambda record: (record.subscriber_count, -record.view_count, -record.published_at.timestamp()))
    if sort == SearchSortOption.VIEWS:
        return sorted(records, key=lambda record: (record.view_count, record.published_at), reverse=True)
    if sort == SearchSortOption.LATEST:
        return sorted(records, key=lambda record: record.published_at, reverse=True)
    if sort == SearchSortOption.PERFORMANCE_ONLY:
        return sorted(records, key=lambda record: (record.performance_score, record.published_at), reverse=True)
    if sort == SearchSortOption.OPPORTUNITY_ONLY:
        return sorted(records, key=lambda record: (record.exposure_score, record.published_at), reverse=True)
    if sort == SearchSortOption.RECOMMENDED:
        normalized_performance = _normalize_scores(records, "performance_score")
        normalized_exposure = _normalize_scores(records, "exposure_score")

        def _hot_score(record: SearchVideoRecord) -> float:
            return (0.45 * normalized_performance[record.video_id]) + (0.55 * normalized_exposure[record.video_id])

        return sorted(records, key=lambda record: (_hot_score(record), record.published_at), reverse=True)

    return records


def _match_duration(duration_seconds: int, duration_bucket: SearchDurationBucket) -> bool:
    if duration_bucket == SearchDurationBucket.UNDER_4M:
        return duration_seconds < 240
    if duration_bucket == SearchDurationBucket.BETWEEN_4M_AND_20M:
        return 240 <= duration_seconds <= 1200
    if duration_bucket == SearchDurationBucket.OVER_20M:
        return duration_seconds > 1200
    return True


def _match_short_form(title: str, short_form_type: SearchShortFormType) -> bool:
    if short_form_type == SearchShortFormType.ALL:
        return True

    lowered = title.lower()
    keyword_map: dict[SearchShortFormType, tuple[str, ...]] = {
        SearchShortFormType.SHOPPING: ("공구", "꿀템", "추천템", "리뷰"),
        SearchShortFormType.CLIP: ("짤", "명장면", "하이라이트"),
        SearchShortFormType.GAME: ("게임", "플레이", "공략"),
        SearchShortFormType.FOOD: ("요리", "먹방", "asmr", "레시피"),
        SearchShortFormType.ANIMAL: ("동물", "강아지", "고양이", "귀요미"),
        SearchShortFormType.KNOWLEDGE: ("지식", "상식", "1분", "공부"),
        SearchShortFormType.BEAUTY: ("뷰티", "패션", "ootd", "메이크업"),
        SearchShortFormType.SPORTS: ("스포츠", "운동", "헬스", "축구"),
        SearchShortFormType.ENTERTAINMENT: ("연예", "아이돌", "k-pop", "예능"),
        SearchShortFormType.OTHER: (),
        SearchShortFormType.ALL: (),
    }

    if short_form_type == SearchShortFormType.OTHER:
        known = [word for option, words in keyword_map.items() if option not in {SearchShortFormType.ALL, SearchShortFormType.OTHER} for word in words]
        return not any(word in lowered for word in known)

    return any(word in lowered for word in keyword_map.get(short_form_type, ()))


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


def _match_topic(topic: SearchTopicOption, title: str) -> bool:
    if topic == SearchTopicOption.ALL:
        return True

    lowered = title.lower()
    topic_keywords: dict[SearchTopicOption, tuple[str, ...]] = {
        SearchTopicOption.SHOPPING: ("공구", "꿀템", "추천템", "리뷰"),
        SearchTopicOption.CLIP: ("짤", "명장면", "하이라이트"),
        SearchTopicOption.GAME: ("게임", "플레이", "공략"),
        SearchTopicOption.FOOD: ("먹방", "요리", "asmr", "레시피"),
        SearchTopicOption.ANIMAL: ("동물", "강아지", "고양이", "귀요미"),
        SearchTopicOption.KNOWLEDGE: ("지식", "상식", "1분", "공부"),
        SearchTopicOption.BEAUTY: ("뷰티", "패션", "ootd", "메이크업"),
        SearchTopicOption.SPORTS: ("스포츠", "운동", "헬스", "축구"),
        SearchTopicOption.ENTERTAINMENT: ("아이돌", "k-pop", "연예", "예능"),
        SearchTopicOption.OTHER: (),
        SearchTopicOption.ALL: (),
    }

    keywords = topic_keywords.get(topic, ())
    if topic == SearchTopicOption.OTHER:
        every_known = [word for words in topic_keywords.values() for word in words]
        return not any(word in lowered for word in every_known)

    return any(word in lowered for word in keywords)


def _build_recommendation_reason(record: SearchVideoRecord) -> str:
    contribution_text = "N/A" if record.contribution is None else f"{record.contribution / 100.0:.2f}배"
    engagement_text = "반응 데이터 비공개" if record.engagement_rate is None else f"반응 {record.engagement_rate:.2f}%"
    return f"구독자 대비 조회수 {contribution_text} + {engagement_text} + 채널 경쟁도 낮음"


def search_videos(
    *,
    keyword: str,
    channel: str,
    sort: SearchSortOption,
    period: SearchPeriodOption,
    topic: SearchTopicOption,
    result_limit: int,
    min_views: int,
    country: str,
    max_subscribers: int,
    subscriber_public_only: bool,
    duration_bucket: SearchDurationBucket,
    short_form_type: SearchShortFormType,
    script_type: SearchScriptType,
    min_performance: int,
    core_preset: SearchCorePreset,
    user_api_keys: list[str] | None = None,
) -> list[SearchVideoRecord]:
    client = YouTubeSearchClient()
    youtube_rows = client.fetch_videos(
        keyword=keyword,
        channel=channel,
        sort=sort,
        period=period,
        result_limit=result_limit,
        api_keys=user_api_keys or [],
    )

    normalized_country = country.strip().upper()

    records: list[SearchVideoRecord] = []
    now = datetime.now(timezone.utc)

    for row in youtube_rows:
        if row.view_count < min_views:
            continue

        if not _match_topic(topic, row.title):
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

        if not _match_short_form(row.title, short_form_type):
            continue

        if not _match_script(has_script, script_type):
            continue

        channel_age_days = max((now - row.channel_published_at).days, 1)
        channel_age_years = max(channel_age_days / 365.0, 0.01)
        subscription_rate = (row.subscriber_count / row.channel_view_count * 100) if row.channel_view_count > 0 else 0.0
        annual_subscriber_growth = int(row.subscriber_count / channel_age_years)
        uploads_per_week = row.total_video_count / (channel_age_days / 7)
        grade = _compute_channel_grade(row.subscriber_count)

        contribution = compute_contribution(row.view_count, row.subscriber_count, row.is_subscriber_public)
        contribution_grade = classify_contribution_grade(contribution)
        engagement_rate = compute_engagement_rate(row.view_count, row.like_count, row.comment_count)
        performance_score = compute_performance_score(contribution, engagement_rate, row.view_count)
        exposure_score = compute_exposure_score(
            keyword=keyword,
            title=row.title,
            subscriber_count=row.subscriber_count,
            engagement_rate=engagement_rate,
            total_video_count=row.total_video_count,
            published_at=row.published_at,
            now=now,
        )
        hot_video = is_hot_video(contribution, exposure_score)

        if performance_score < min_performance:
            continue

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
                like_count=row.like_count,
                comment_count=row.comment_count,
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
                contribution=contribution,
                contribution_grade=contribution_grade,
                engagement_rate=engagement_rate,
                performance_score=performance_score,
                exposure_score=exposure_score,
                is_hot_video=hot_video,
                recommendation_reason="",
                estimated_revenue_total_text=f"CPM {1 + (row.view_count % 3):,}원 기준 약 {int(row.view_count * ((1 + (row.view_count % 3)) / 1000)):,}원",
                vph_text=f"{performance_score:.1f}",
                badge_label="🔥 HOT" if hot_video else ("SHORTS" if is_short_form else None),
            )
        )

    for record in records:
        record.recommendation_reason = _build_recommendation_reason(record)

    sorted_records = _sort_records(records, sort)
    return sorted_records[:result_limit]
