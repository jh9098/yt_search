from __future__ import annotations

import unittest
from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient

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
                    view_count=420000,
                    view_count_text="42만",
                    published_at=datetime(2026, 3, 1, tzinfo=timezone.utc),
                    uploaded_at_text="3일 전",
                )
            ]

            response = self.client.get(
                "/api/search/videos",
                params={
                    "q": "가족",
                    "sort": "relevance",
                    "period": "7d",
                    "minViews": 0,
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
        self.assertIn("viewCountText", first_item)
        self.assertIn("uploadedAtText", first_item)

    def test_get_search_videos_returns_contract_error_when_query_missing(self) -> None:
        response = self.client.get(
            "/api/search/videos",
            params={"q": "", "channel": "", "sort": "relevance", "period": "7d", "minViews": 0},
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
                params={"q": "없는검색어", "sort": "relevance", "period": "7d", "minViews": 0},
            )

        self.assertNotEqual(response.status_code, 404)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["items"], [])


if __name__ == "__main__":
    unittest.main()
