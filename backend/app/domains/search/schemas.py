from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class SearchSortOption(str, Enum):
    SUBSCRIBER_ASC = "subscriberAsc"
    RELEVANCE = "relevance"
    VIEWS = "views"
    LATEST = "latest"


class SearchPeriodOption(str, Enum):
    LAST_24_HOURS = "24h"
    LAST_7_DAYS = "7d"
    LAST_30_DAYS = "30d"
    LAST_90_DAYS = "90d"
    LAST_180_DAYS = "180d"
    LAST_365_DAYS = "365d"
    LAST_730_DAYS = "730d"
    ALL = "all"


class SearchDurationBucket(str, Enum):
    ALL = "all"
    UNDER_4M = "under4m"
    BETWEEN_4M_AND_20M = "4to20m"
    OVER_20M = "over20m"


class SearchShortFormType(str, Enum):
    ALL = "all"
    SHOPPING = "shopping"
    CLIP = "clip"
    GAME = "game"
    FOOD = "food"
    ANIMAL = "animal"
    KNOWLEDGE = "knowledge"
    BEAUTY = "beauty"
    SPORTS = "sports"
    ENTERTAINMENT = "entertainment"
    OTHER = "other"


class SearchScriptType(str, Enum):
    ALL = "all"
    SCRIPTED = "scripted"
    NO_SCRIPT = "noScript"


class SearchHoverMetric(str, Enum):
    VIDIQ_TREND = "vidiqTrend"
    ESTIMATED_REVENUE = "estimatedRevenue"




class SearchTopicOption(str, Enum):
    ALL = "all"
    SHOPPING = "shopping"
    CLIP = "clip"
    GAME = "game"
    FOOD = "food"
    ANIMAL = "animal"
    KNOWLEDGE = "knowledge"
    BEAUTY = "beauty"
    SPORTS = "sports"
    ENTERTAINMENT = "entertainment"
    OTHER = "other"

class SearchCorePreset(str, Enum):
    NONE = "none"
    NEW_RAPID_GROWTH = "newRapidGrowth"
    EFFICIENCY_MONSTER = "efficiencyMonster"
    FAST_RISING = "fastRising"
    KR_TREND = "krTrend"
    GLOBAL_TREND = "globalTrend"


class SearchResponseMeta(BaseModel):
    request_id: str = Field(..., alias="requestId")
    timestamp: str


class SearchResponseError(BaseModel):
    code: str
    message: str


class SearchResultItem(BaseModel):
    video_id: str = Field(..., alias="videoId")
    title: str
    channel_name: str = Field(..., alias="channelName")
    thumbnail_url: str = Field(..., alias="thumbnailUrl")
    duration_text: str = Field(..., alias="durationText")
    published_date_text: str = Field(..., alias="publishedDateText")
    view_count: int = Field(..., alias="viewCount")
    view_count_text: str = Field(..., alias="viewCountText")
    subscriber_count: int = Field(..., alias="subscriberCount")
    subscriber_count_text: str = Field(..., alias="subscriberCountText")
    channel_published_date_text: str = Field(..., alias="channelPublishedDateText")
    country_code: str = Field(..., alias="countryCode")
    total_video_count_text: str = Field(..., alias="totalVideoCountText")
    subscription_rate_text: str = Field(..., alias="subscriptionRateText")
    annual_subscriber_growth_text: str = Field(..., alias="annualSubscriberGrowthText")
    uploads_per_week_text: str = Field(..., alias="uploadsPerWeekText")
    channel_grade: str = Field(..., alias="channelGrade")
    is_short_form: bool = Field(..., alias="isShortForm")
    has_script: bool = Field(..., alias="hasScript")
    is_subscriber_public: bool = Field(..., alias="isSubscriberPublic")
    keyword_matched_terms: list[str] = Field(..., alias="keywordMatchedTerms")
    estimated_revenue_total_text: str | None = Field(default=None, alias="estimatedRevenueTotalText")
    vph_text: str | None = Field(default=None, alias="vphText")
    badge_label: str | None = Field(default=None, alias="badgeLabel")


class SearchResultData(BaseModel):
    items: list[SearchResultItem]


class SearchSuccessResponse(BaseModel):
    success: Literal[True]
    data: SearchResultData
    meta: SearchResponseMeta


class SearchErrorResponse(BaseModel):
    success: Literal[False]
    error: SearchResponseError
    meta: SearchResponseMeta


class SearchVideoRecord(BaseModel):
    video_id: str
    title: str
    channel_name: str
    thumbnail_url: str
    duration_seconds: int
    duration_text: str
    published_at: datetime
    published_date_text: str
    view_count: int
    view_count_text: str
    subscriber_count: int
    subscriber_count_text: str
    channel_published_at: datetime
    channel_published_date_text: str
    country_code: str
    total_video_count: int
    total_video_count_text: str
    subscription_rate: float
    subscription_rate_text: str
    annual_subscriber_growth: int
    annual_subscriber_growth_text: str
    uploads_per_week: float
    uploads_per_week_text: str
    channel_grade: str
    is_short_form: bool
    has_script: bool
    is_subscriber_public: bool
    keyword_matched_terms: list[str]
    estimated_revenue_total_text: str | None = None
    vph_text: str | None = None
    badge_label: str | None = None
