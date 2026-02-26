from __future__ import annotations

import unittest
from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.domains.search.client import (
    SearchQuotaExceededError,
    SearchRateLimitedError,
    SearchUpstreamError,
    SearchUpstreamUnavailableError,
)
from backend.app.domains.search.schemas import SearchVideoRecord
from backend.app.main import app


class SearchApiContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_get_search_videos_success_contract(self) -> None:
        with patch("backend.app.domains.search.router.search_videos") as mocked_search:
            mocked_search.return_value = [
                SearchVideoRecord(
                    video_id="video_family_talk_001",
                    title="가족과 대화가 자꾸 꼬일 때 감정 다루는 법",
                    channel_name="마음연구소",
                    thumbnail_url="https://i.ytimg.com/sample.jpg",
                    duration_seconds=58,
                    duration_text="00:58",
                    published_at=datetime(2026, 3, 1, tzinfo=timezone.utc),
                    published_date_text="2026-03-01",
                    view_count=420000,
                    view_count_text="42만",
                    subscriber_count=173000,
                    subscriber_count_text="17.3만",
                    like_count=1200,
                    comment_count=230,
                    channel_published_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
                    channel_published_date_text="2025-01-01",
                    country_code="KR",
                    total_video_count=11,
                    total_video_count_text="11",
                    subscription_rate=1.3,
                    subscription_rate_text="1.30%",
                    annual_subscriber_growth=84000,
                    annual_subscriber_growth_text="연 84,000명",
                    uploads_per_week=1.2,
                    uploads_per_week_text="주 1.20개",
                    channel_grade="C1",
                    is_short_form=True,
                    has_script=False,
                    is_subscriber_public=True,
                    keyword_matched_terms=["가족", "대화"],
                    contribution=242.7,
                    contribution_grade="Good",
                    engagement_rate=0.34,
                    performance_score=74.2,
                    exposure_score=62.1,
                    is_hot_video=False,
                    recommendation_reason="구독자 대비 조회수 2.43배 + 반응 0.34% + 채널 경쟁도 낮음",
                    estimated_revenue_total_text=None,
                    vph_text=None,
                    badge_label="SHORTS",
                )
            ]

            response = self.client.get(
                "/api/search/videos",
                params={
                    "q": "가족",
                    "sort": "subscriberAsc",
                    "period": "7d",
                    "minViews": 0,
                    "country": "KR",
                    "maxSubscribers": 500000,
                    "subscriberPublicOnly": True,
                    "durationBucket": "all",
                    "shortFormType": "all",
                    "scriptType": "all",
                    "hoverMetric": "estimatedRevenue",
                    "minPerformance": 0,
                    "corePreset": "none",
                },
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertIn("items", body["data"])
        self.assertGreaterEqual(len(body["data"]["items"]), 1)
        first_item = body["data"]["items"][0]
        self.assertIn("videoId", first_item)
        self.assertIn("title", first_item)
        self.assertIn("channelName", first_item)
        self.assertIn("thumbnailUrl", first_item)
        self.assertIn("durationText", first_item)
        self.assertIn("publishedDateText", first_item)
        self.assertIn("viewCount", first_item)
        self.assertIn("viewCountText", first_item)
        self.assertIn("subscriberCount", first_item)
        self.assertIn("subscriberCountText", first_item)
        self.assertIn("countryCode", first_item)
        self.assertIn("channelPublishedDateText", first_item)
        self.assertIn("totalVideoCountText", first_item)
        self.assertIn("subscriptionRateText", first_item)
        self.assertIn("isShortForm", first_item)
        self.assertIn("hasScript", first_item)
        self.assertIn("isSubscriberPublic", first_item)
        self.assertIn("keywordMatchedTerms", first_item)
        self.assertIn("recommendationReason", first_item)
        self.assertIn("isHotVideo", first_item)
        self.assertIn("exposureScore", first_item)
        self.assertIn("performanceScore", first_item)
        self.assertIn("contributionGrade", first_item)
        self.assertIn("commentCount", first_item)
        self.assertIn("likeCount", first_item)

    def test_get_search_videos_returns_contract_error_when_query_missing(self) -> None:
        response = self.client.get(
            "/api/search/videos",
            params={"q": "", "channel": "", "sort": "subscriberAsc", "period": "7d", "minViews": 0, "durationBucket": "all", "corePreset": "none"},
        )

        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "SEARCH_QUERY_REQUIRED")

    def test_get_search_videos_is_not_404_for_existing_endpoint(self) -> None:
        with patch("backend.app.domains.search.router.search_videos") as mocked_search:
            mocked_search.return_value = []
            response = self.client.get(
                "/api/search/videos",
                params={"q": "없는검색어", "sort": "subscriberAsc", "period": "7d", "minViews": 0, "durationBucket": "all", "corePreset": "none"},
            )

        self.assertNotEqual(response.status_code, 404)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["items"], [])

    def test_get_search_videos_returns_quota_exceeded_contract(self) -> None:
        with patch("backend.app.domains.search.router.search_videos") as mocked_search:
            mocked_search.side_effect = SearchQuotaExceededError()

            response = self.client.get(
                "/api/search/videos",
                params={"q": "가족", "sort": "subscriberAsc", "period": "7d", "minViews": 0, "durationBucket": "all", "corePreset": "none"},
            )

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "SEARCH_QUOTA_EXCEEDED")
        self.assertEqual(body["error"]["message"], "검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.")

    def test_get_search_videos_returns_rate_limited_contract(self) -> None:
        with patch("backend.app.domains.search.router.search_videos") as mocked_search:
            mocked_search.side_effect = SearchRateLimitedError()

            response = self.client.get(
                "/api/search/videos",
                params={"q": "가족", "sort": "subscriberAsc", "period": "7d", "minViews": 0, "durationBucket": "all", "corePreset": "none"},
            )

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "SEARCH_RATE_LIMITED")
        self.assertEqual(body["error"]["message"], "검색 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요.")

    def test_get_search_videos_returns_upstream_unavailable_contract(self) -> None:
        with patch("backend.app.domains.search.router.search_videos") as mocked_search:
            mocked_search.side_effect = SearchUpstreamUnavailableError()

            response = self.client.get(
                "/api/search/videos",
                params={"q": "가족", "sort": "subscriberAsc", "period": "7d", "minViews": 0, "durationBucket": "all", "corePreset": "none"},
            )

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "SEARCH_UPSTREAM_UNAVAILABLE")
        self.assertEqual(body["error"]["message"], "검색 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.")

    def test_get_search_videos_returns_upstream_error_contract(self) -> None:
        with patch("backend.app.domains.search.router.search_videos") as mocked_search:
            mocked_search.side_effect = SearchUpstreamError(message="bad gateway")

            response = self.client.get(
                "/api/search/videos",
                params={"q": "가족", "sort": "subscriberAsc", "period": "7d", "minViews": 0, "durationBucket": "all", "corePreset": "none"},
            )

        self.assertEqual(response.status_code, 502)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "SEARCH_UPSTREAM_ERROR")
        self.assertEqual(body["error"]["message"], "검색 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")


if __name__ == "__main__":
    unittest.main()
