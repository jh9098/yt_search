from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from backend.app.main import app


class SearchApiContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_get_search_videos_success_contract(self) -> None:
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
