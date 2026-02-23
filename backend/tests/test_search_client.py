from __future__ import annotations

import unittest
from unittest.mock import Mock, patch

from backend.app.domains.search.client import SearchUpstreamUnavailableError, YouTubeSearchClient
from backend.app.domains.search.schemas import SearchPeriodOption, SearchSortOption


class SearchClientTest(unittest.TestCase):
    def test_fetch_videos_uses_channel_as_query_when_keyword_is_empty(self) -> None:
        with patch.dict("os.environ", {"YOUTUBE_API_KEY": "test-key"}, clear=False):
            client = YouTubeSearchClient()
            search_response = {"items": [{"id": {"videoId": "abc123"}}]}
            videos_response = {
                "items": [
                    {
                        "id": "abc123",
                        "snippet": {
                            "title": "가족 대화법",
                            "channelTitle": "연구소",
                            "publishedAt": "2026-01-01T00:00:00Z",
                        },
                        "statistics": {"viewCount": "100"},
                        "contentDetails": {"duration": "PT58S"},
                    }
                ]
            }
            channels_response = {"items": [{"id": "", "snippet": {}, "statistics": {}}]}

            with patch.object(
                client,
                "_call_youtube_api",
                side_effect=[search_response, videos_response, channels_response],
            ) as mocked_call:
                rows = client.fetch_videos(
                    keyword="",
                    channel="연구소",
                    sort=SearchSortOption.RELEVANCE,
                    period=SearchPeriodOption.LAST_7_DAYS,
                )

        first_call_params = mocked_call.call_args_list[0].args[1]
        self.assertEqual(first_call_params["q"], "연구소")
        self.assertEqual(len(rows), 1)

    def test_map_http_error_invalid_api_key_maps_to_unavailable(self) -> None:
        client = YouTubeSearchClient()
        http_error = Mock()
        http_error.code = 400
        http_error.read.return_value = (
            b'{"error":{"code":400,"message":"API key not valid. Please pass a valid API key."}}'
        )

        mapped = client._map_http_error(http_error)

        self.assertIsInstance(mapped, SearchUpstreamUnavailableError)


if __name__ == "__main__":
    unittest.main()
