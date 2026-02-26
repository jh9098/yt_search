from __future__ import annotations

from datetime import datetime, timezone
import math
import re

CONTRIBUTION_WEIGHT = 0.4
ENGAGEMENT_WEIGHT = 0.35
VIEW_WEIGHT = 0.25

CHANNEL_WEAKNESS_SUBSCRIBER_SCALE = 100_000
ENGAGEMENT_WEAKNESS_RATE_SCALE = 5.0
CHANNEL_EXPERIENCE_VIDEO_SCALE = 300
VIDEO_AGE_DAY_SCALE = 365

EXPOSURE_KEYWORD_WEIGHT = 25
EXPOSURE_CHANNEL_WEAKNESS_WEIGHT = 30
EXPOSURE_ENGAGEMENT_WEAKNESS_WEIGHT = 20
EXPOSURE_CHANNEL_EXPERIENCE_WEIGHT = 15
EXPOSURE_VIDEO_AGE_WEIGHT = 10

VERY_GOOD_CONTRIBUTION_THRESHOLD = 300.0
GOOD_CONTRIBUTION_THRESHOLD = 150.0
NORMAL_CONTRIBUTION_THRESHOLD = 80.0
HOT_VIDEO_CONTRIBUTION_THRESHOLD = 180.0
HOT_VIDEO_EXPOSURE_THRESHOLD = 65.0


def _clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, value))


def _normalize_zero_to_one(value: float, scale: float) -> float:
    if scale <= 0:
        return 0.0
    return _clamp((value / scale) * 100.0) / 100.0


def _normalize_inverse_zero_to_one(value: float, scale: float) -> float:
    return 1.0 - _normalize_zero_to_one(value, scale)


def _safe_utc_now(now: datetime | None) -> datetime:
    if now is None:
        return datetime.now(timezone.utc)
    if now.tzinfo is None:
        return now.replace(tzinfo=timezone.utc)
    return now.astimezone(timezone.utc)


def _tokenize_text(text: str) -> list[str]:
    lowered = text.lower().strip()
    if lowered == "":
        return []
    return [token for token in re.split(r"\s+", lowered) if token]


def compute_contribution(view_count: int, subscriber_count: int, is_public: bool) -> float | None:
    if not is_public or subscriber_count <= 0:
        return None
    return (max(view_count, 0) / subscriber_count) * 100.0


def compute_engagement_rate(view_count: int, like_count: int, comment_count: int) -> float | None:
    if view_count <= 0:
        return None
    if like_count <= 0 and comment_count <= 0:
        return None
    total_reaction = max(like_count, 0) + max(comment_count, 0)
    return (total_reaction / view_count) * 100.0


def compute_performance_score(contribution: float | None, engagement_rate: float | None, view_count: int) -> float:
    weighted_values: list[tuple[float, float]] = []

    if contribution is not None:
        weighted_values.append((CONTRIBUTION_WEIGHT, _clamp(contribution)))
    if engagement_rate is not None:
        weighted_values.append((ENGAGEMENT_WEIGHT, _clamp(engagement_rate * 10.0)))

    view_component = _clamp(25.0 * math.log10(max(view_count, 0) + 1))
    weighted_values.append((VIEW_WEIGHT, view_component))

    total_weight = sum(weight for weight, _ in weighted_values)
    if total_weight <= 0:
        return 0.0

    score = sum((weight / total_weight) * value for weight, value in weighted_values)
    return _clamp(score)


def compute_exposure_score(
    keyword: str,
    title: str,
    subscriber_count: int,
    engagement_rate: float | None,
    total_video_count: int,
    published_at: datetime,
    now: datetime | None = None,
) -> float:
    keyword_tokens = _tokenize_text(keyword)
    title_tokens = _tokenize_text(title)

    if len(keyword_tokens) == 0:
        keyword_match_ratio = 0.0
    else:
        title_text = " ".join(title_tokens)
        matched_count = sum(1 for token in keyword_tokens if token in title_text)
        keyword_match_ratio = matched_count / len(keyword_tokens)

    keyword_score = _clamp(keyword_match_ratio * 100.0) * (EXPOSURE_KEYWORD_WEIGHT / 100.0)

    channel_weakness_score = (
        _normalize_inverse_zero_to_one(max(subscriber_count, 0), CHANNEL_WEAKNESS_SUBSCRIBER_SCALE)
        * 100.0
        * (EXPOSURE_CHANNEL_WEAKNESS_WEIGHT / 100.0)
    )

    engagement_base = 0.0 if engagement_rate is None else max(engagement_rate, 0.0)
    engagement_weakness_score = (
        _normalize_inverse_zero_to_one(engagement_base, ENGAGEMENT_WEAKNESS_RATE_SCALE)
        * 100.0
        * (EXPOSURE_ENGAGEMENT_WEAKNESS_WEIGHT / 100.0)
    )

    channel_experience_score = (
        _normalize_inverse_zero_to_one(max(total_video_count, 0), CHANNEL_EXPERIENCE_VIDEO_SCALE)
        * 100.0
        * (EXPOSURE_CHANNEL_EXPERIENCE_WEIGHT / 100.0)
    )

    now_utc = _safe_utc_now(now)
    published_utc = _safe_utc_now(published_at)
    age_days = max((now_utc - published_utc).days, 0)
    age_score = (
        _normalize_zero_to_one(float(age_days), VIDEO_AGE_DAY_SCALE)
        * 100.0
        * (EXPOSURE_VIDEO_AGE_WEIGHT / 100.0)
    )

    return _clamp(keyword_score + channel_weakness_score + engagement_weakness_score + channel_experience_score + age_score)


def classify_contribution_grade(contribution: float | None) -> str:
    if contribution is None:
        return "N/A"
    if contribution >= VERY_GOOD_CONTRIBUTION_THRESHOLD:
        return "Very Good"
    if contribution >= GOOD_CONTRIBUTION_THRESHOLD:
        return "Good"
    if contribution >= NORMAL_CONTRIBUTION_THRESHOLD:
        return "Normal"
    return "Bad"


def is_hot_video(contribution: float | None, exposure_score: float) -> bool:
    if contribution is None:
        return False
    return contribution >= HOT_VIDEO_CONTRIBUTION_THRESHOLD and exposure_score >= HOT_VIDEO_EXPOSURE_THRESHOLD
