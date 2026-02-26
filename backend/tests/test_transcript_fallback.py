from __future__ import annotations

import unittest

from backend.app.domains.search.transcript import extract_video_id, parse_language_priority


class TranscriptHelpersTest(unittest.TestCase):
    def test_parse_language_priority_returns_default_when_empty(self) -> None:
        self.assertEqual(parse_language_priority(""), ["ko", "en"])

    def test_parse_language_priority_trims_values(self) -> None:
        self.assertEqual(parse_language_priority(" ko, en , "), ["ko", "en"])

    def test_extract_video_id_handles_watch_url(self) -> None:
        self.assertEqual(
            extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
            "dQw4w9WgXcQ",
        )

    def test_extract_video_id_handles_raw_video_id(self) -> None:
        self.assertEqual(extract_video_id("dQw4w9WgXcQ"), "dQw4w9WgXcQ")


if __name__ == "__main__":
    unittest.main()
