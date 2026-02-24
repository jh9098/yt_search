from __future__ import annotations

import unittest
from unittest.mock import patch

from backend.app.domains.search.transcript import (
    _extract_player_response_json_from_html,
    _extract_transcript_without_yt_dlp,
)


class TranscriptFallbackTest(unittest.TestCase):
    def test_extract_player_response_json_from_html_parses_multiline_json(self) -> None:
        html = '''
        <html><script>
        var ytInitialPlayerResponse = {
          "videoDetails": {"title": "제목"},
          "captions": {
            "playerCaptionsTracklistRenderer": {
              "captionTracks": [
                {"baseUrl": "https://example.com/caption?lang=ko", "languageCode": "ko"}
              ]
            }
          }
        };
        </script></html>
        '''

        extracted = _extract_player_response_json_from_html(html)

        self.assertIsNotNone(extracted)
        self.assertIn('"videoDetails"', extracted or "")

    def test_extract_transcript_without_yt_dlp_prefers_player_response_tracks(self) -> None:
        with patch(
            "backend.app.domains.search.transcript._extract_transcript_from_player_response",
            return_value=None,
        ), patch(
            "backend.app.domains.search.transcript._fetch_timedtext",
            side_effect=[None, "hello\nworld", None, None],
        ), patch(
            "backend.app.domains.search.transcript._fetch_video_title",
            return_value="테스트 제목",
        ):
            result = _extract_transcript_without_yt_dlp("https://www.youtube.com/watch?v=abc123xyz")

        self.assertIsNotNone(result)
        self.assertEqual(result.language, "en")
        self.assertEqual(result.source, "subtitle")
        self.assertEqual(result.title, "테스트 제목")
        self.assertIn("hello", result.transcript_text)


if __name__ == "__main__":
    unittest.main()
