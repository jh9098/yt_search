from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisJobCreateRequest(BaseModel):
    video_id: str = Field(..., alias="videoId", min_length=1)
    force_refresh: bool = Field(default=False, alias="forceRefresh")


class ResponseMeta(BaseModel):
    request_id: str = Field(..., alias="requestId")
    timestamp: str


class ResponseError(BaseModel):
    code: str
    message: str


class AnalysisSummary(BaseModel):
    major_reactions: str = Field(..., alias="majorReactions")
    positive_points: str = Field(..., alias="positivePoints")
    weak_points: str = Field(..., alias="weakPoints")


class ContentIdea(BaseModel):
    title: str
    description: str


class AnalysisResultMeta(BaseModel):
    model: str
    analyzed_at: str = Field(..., alias="analyzedAt")
    comment_sample_count: int | None = Field(default=None, alias="commentSampleCount")
    analysis_basis: list[str] = Field(..., alias="analysisBasis")
    language_summary: list[str] | None = Field(default=None, alias="languageSummary")
    cache_hit: bool | None = Field(default=None, alias="cacheHit")
    analysis_version: str = Field(..., alias="analysisVersion")
    schema_version: str = Field(..., alias="schemaVersion")
    warnings: list[str] | None = None


class AnalysisResult(BaseModel):
    summary: AnalysisSummary
    content_ideas: list[ContentIdea] = Field(..., alias="contentIdeas")
    recommended_keywords: list[str] = Field(..., alias="recommendedKeywords")
    meta: AnalysisResultMeta


class AnalysisStatusData(BaseModel):
    job_id: str = Field(..., alias="jobId")
    status: JobStatus
    progress: int | None = Field(default=None, ge=0, le=100)
    step: str | None = None
    message: str | None = None
    result: AnalysisResult | None = None
    error: ResponseError | None = None


class AnalysisCreateSuccessResponse(BaseModel):
    success: Literal[True]
    data: AnalysisStatusData
    meta: ResponseMeta


class AnalysisErrorResponse(BaseModel):
    success: Literal[False]
    error: ResponseError
    meta: ResponseMeta
