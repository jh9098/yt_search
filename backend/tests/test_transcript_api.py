from __future__ import annotations

import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.domains.search.transcript import TranscriptResult, TranscriptSegment


class TranscriptApiContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_get_video_transcript_success_contract(self) -> None:
        with patch("backend.app.domains.search.router.extract_transcript_from_video") as mocked_extract:
            mocked_extract.return_value = TranscriptResult(
                title="테스트 영상",
                transcript_text="첫 줄\n둘째 줄",
                language="ko",
                source="subtitle",
                segments=[TranscriptSegment(text="첫 줄", start=0.0, duration=1.0)],
            )

            response = self.client.get("/api/search/transcript", params={"videoId": "abc123xyz"})

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

    def test_get_video_transcript_allows_request_without_cookie(self) -> None:
        with patch("backend.app.domains.search.router.extract_transcript_from_video") as mocked_extract:
            mocked_extract.return_value = TranscriptResult(
                title="테스트 영상",
                transcript_text="텍스트",
                language="ko",
                source="subtitle",
                segments=[TranscriptSegment(text="텍스트", start=0.0, duration=1.0)],
            )
            response = self.client.get("/api/search/transcript", params={"videoId": "abc123xyz"})

        self.assertEqual(response.status_code, 200)

    def test_get_video_transcript_passes_languages_priority(self) -> None:
        captured_languages: dict[str, list[str]] = {"value": []}

        def fake_extract(video_target: str, languages: list[str]):
            captured_languages["value"] = languages
            return TranscriptResult(
                title="언어 테스트",
                transcript_text="텍스트",
                language="ko",
                source="subtitle",
                segments=[TranscriptSegment(text="텍스트", start=0.0, duration=1.0)],
            )

        with patch("backend.app.domains.search.router.extract_transcript_from_video", side_effect=fake_extract):
            response = self.client.get(
                "/api/search/transcript",
                params={"videoId": "abc123xyz", "languages": "ko,en"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(captured_languages["value"], ["ko", "en"])

    def test_post_video_transcript_uses_body_payload_contract(self) -> None:
        with patch("backend.app.domains.search.router.extract_transcript_from_video") as mocked_extract:
            mocked_extract.return_value = TranscriptResult(
                title="POST 테스트",
                transcript_text="첫 줄",
                language="ko",
                source="subtitle",
                segments=[TranscriptSegment(text="첫 줄", start=0.0, duration=1.0)],
            )

            response = self.client.post(
                "/api/search/transcript",
                json={"videoId": "post123xyz", "languages": "ko,en"},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["videoId"], "post123xyz")

    def test_get_video_transcript_returns_not_found_when_no_caption(self) -> None:
        with patch("backend.app.domains.search.router.extract_transcript_from_video") as mocked_extract:
            mocked_extract.return_value = None
            response = self.client.get("/api/search/transcript", params={"videoId": "no_caption_id"})

        self.assertEqual(response.status_code, 404)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "TRANSCRIPT_NOT_FOUND")

    def test_transcript_health_contract(self) -> None:
        response = self.client.get("/api/search/transcript/health")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["ok"])
        self.assertIn("proxy", body)
        self.assertIn("proxy_configured", body)


if __name__ == "__main__":
    unittest.main()
