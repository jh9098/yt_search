from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class SearchSortOption(str, Enum):
    RELEVANCE = "relevance"
    VIEWS = "views"
    LATEST = "latest"


class SearchPeriodOption(str, Enum):
    LAST_24_HOURS = "24h"
    LAST_7_DAYS = "7d"
    LAST_30_DAYS = "30d"
    ALL = "all"


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
    view_count_text: str = Field(..., alias="viewCountText")
    uploaded_at_text: str = Field(..., alias="uploadedAtText")


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
    view_count: int
    view_count_text: str
    published_at: datetime
    uploaded_at_text: str
