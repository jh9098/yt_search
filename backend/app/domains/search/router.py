from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from ...core.response import error_response, success_response
from .client import (
    SearchQuotaExceededError,
    SearchRateLimitedError,
    SearchUpstreamError,
    SearchUpstreamUnavailableError,
)
from .schemas import (
    SearchErrorResponse,
    SearchPeriodOption,
    SearchResultData,
    SearchResultItem,
    SearchSortOption,
    SearchSuccessResponse,
)
from .service import search_videos

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get(
    "/videos",
    response_model=SearchSuccessResponse,
    responses={400: {"model": SearchErrorResponse}},
)
def get_search_videos(
    q: str = Query(default=""),
    channel: str = Query(default=""),
    sort: SearchSortOption = Query(default=SearchSortOption.RELEVANCE),
    period: SearchPeriodOption = Query(default=SearchPeriodOption.LAST_7_DAYS),
    min_views: int = Query(default=0, alias="minViews", ge=0),
):
    request_id = f"req_{uuid4().hex[:12]}"

    if q.strip() == "" and channel.strip() == "":
        body = error_response(
            code="SEARCH_QUERY_REQUIRED",
            message="키워드 또는 채널명을 하나 이상 입력해 주세요.",
            request_id=request_id,
        )
        return JSONResponse(status_code=400, content=body)

    try:
        records = search_videos(
            keyword=q,
            channel=channel,
            sort=sort,
            period=period,
            min_views=min_views,
        )
    except SearchQuotaExceededError:
        body = error_response(
            code="SEARCH_QUOTA_EXCEEDED",
            message="검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
            request_id=request_id,
        )
        return JSONResponse(status_code=503, content=body)
    except SearchRateLimitedError:
        body = error_response(
            code="SEARCH_RATE_LIMITED",
            message="검색 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
            request_id=request_id,
        )
        return JSONResponse(status_code=503, content=body)
    except SearchUpstreamUnavailableError:
        body = error_response(
            code="SEARCH_UPSTREAM_UNAVAILABLE",
            message="검색 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
            request_id=request_id,
        )
        return JSONResponse(status_code=503, content=body)
    except SearchUpstreamError:
        body = error_response(
            code="SEARCH_UPSTREAM_ERROR",
            message="검색 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
            request_id=request_id,
        )
        return JSONResponse(status_code=502, content=body)

    items = [
        SearchResultItem(
            videoId=record.video_id,
            title=record.title,
            channelName=record.channel_name,
            thumbnailUrl=record.thumbnail_url,
            durationText=record.duration_text,
            publishedDateText=record.published_date_text,
            viewCountText=record.view_count_text,
            subscriberCountText=record.subscriber_count_text,
            countryCode=record.country_code,
            isShortForm=record.is_short_form,
            hasScript=record.has_script,
            isSubscriberPublic=record.is_subscriber_public,
            keywordMatchedTerms=record.keyword_matched_terms,
            estimatedRevenueTotalText=record.estimated_revenue_total_text,
            vphText=record.vph_text,
            badgeLabel=record.badge_label,
        )
        for record in records
    ]

    data = SearchResultData(items=items)
    return success_response(data=data.model_dump(by_alias=True), request_id=request_id)
