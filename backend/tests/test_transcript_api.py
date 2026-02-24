from __future__ import annotations

import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.domains.search.transcript import TranscriptResult


class TranscriptApiContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_get_video_transcript_success_contract(self) -> None:
        with patch("backend.app.domains.search.router.extract_transcript_from_video_url") as mocked_extract:
            mocked_extract.return_value = TranscriptResult(
                title="테스트 영상",
                transcript_text="첫 줄\n둘째 줄",
                language="ko",
                source="subtitle",
            )

            response = self.client.get(
                "/api/search/transcript",
                params={"videoId": "abc123xyz"},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["videoId"], "abc123xyz")
        self.assertIn("transcriptText", body["data"])

    def test_get_video_transcript_returns_error_when_target_missing(self) -> None:
        response = self.client.get("/api/search/transcript")

        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "TRANSCRIPT_TARGET_REQUIRED")


    def test_get_video_transcript_uses_cookie_content_when_provided(self) -> None:
        captured_cookie_path: dict[str, str | None] = {"value": None}

        def fake_extract(video_url: str, cookie_file_path: str | None):
            captured_cookie_path["value"] = cookie_file_path
            return TranscriptResult(
                title="쿠키 테스트",
                transcript_text="텍스트",
                language="ko",
                source="subtitle",
            )

        with patch("backend.app.domains.search.router.extract_transcript_from_video_url", side_effect=fake_extract):
            response = self.client.get(
                "/api/search/transcript",
                params={
                    "videoId": "abc123xyz",
                    "cookieContent": "# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tFALSE\t0\tSID\tvalue",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(captured_cookie_path["value"])

    def test_get_video_transcript_returns_not_found_when_no_caption(self) -> None:
        with patch("backend.app.domains.search.router.extract_transcript_from_video_url") as mocked_extract:
            mocked_extract.return_value = None
            response = self.client.get(
                "/api/search/transcript",
                params={"videoId": "no_caption_id"},
            )

        self.assertEqual(response.status_code, 404)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "TRANSCRIPT_NOT_FOUND")


if __name__ == "__main__":
    unittest.main()
