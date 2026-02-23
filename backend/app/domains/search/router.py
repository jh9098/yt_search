from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from ...core.response import error_response, success_response
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

    records = search_videos(
        keyword=q,
        channel=channel,
        sort=sort,
        period=period,
        min_views=min_views,
    )

    items = [
        SearchResultItem(
            videoId=record.video_id,
            title=record.title,
            channelName=record.channel_name,
            viewCountText=record.view_count_text,
            uploadedAtText=record.uploaded_at_text,
        )
        for record in records
    ]

    data = SearchResultData(items=items)
    return success_response(data=data.model_dump(by_alias=True), request_id=request_id)
