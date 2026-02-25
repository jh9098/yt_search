from __future__ import annotations

import threading
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app


class AnalysisApiContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_create_job_success_contract(self) -> None:
        response = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_normal", "forceRefresh": False},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["status"], "completed")
        self.assertIn("jobId", body["data"])
        self.assertIn("result", body["data"])
        self.assertIn("cacheHit", body["data"]["result"]["meta"])

    def test_create_job_cache_hit_contract(self) -> None:
        self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_cached", "forceRefresh": False},
        )

        response = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_cached", "forceRefresh": False},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["status"], "completed")
        self.assertTrue(body["data"]["result"]["meta"]["cacheHit"])

    def test_create_job_timeout_error_contract(self) -> None:
        response = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_timeout", "forceRefresh": False},
        )

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "ANALYSIS_TIMEOUT")
        self.assertEqual(
            body["error"]["message"],
            "분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
        )

    def test_create_job_rate_limited_error_contract(self) -> None:
        response = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_rate_limited", "forceRefresh": False},
        )

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "ANALYSIS_RATE_LIMITED")
        self.assertEqual(
            body["error"]["message"],
            "분석 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
        )
        self.assertEqual(response.headers.get("Retry-After"), "3")

    def test_create_job_invalid_output_returns_failed_status_with_error_code(self) -> None:
        invalid_result = {
            "summary": {
                "positivePoints": "긍정 포인트만 존재",
                "weakPoints": "아쉬운 점",
            },
            "contentIdeas": [],
            "recommendedKeywords": [],
            "meta": {
                "model": "gemini-2.0-flash",
                "analyzedAt": "2026-02-22T12:00:08Z",
                "analysisBasis": ["title", "description", "comments"],
                "analysisVersion": "v1",
                "schemaVersion": "analysis-result-v1",
            },
        }

        with patch(
            "backend.app.domains.analysis.router.external_analysis_client.fetch_analysis_result",
            return_value=invalid_result,
        ):
            response = self.client.post(
                "/api/analysis/jobs",
                json={"videoId": "video_invalid_output", "forceRefresh": True},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["status"], "failed")
        self.assertEqual(body["data"]["error"]["code"], "ANALYSIS_OUTPUT_INVALID")
        self.assertEqual(
            body["data"]["error"]["message"],
            "분석 결과 검증에 실패했습니다. 다시 시도해 주세요.",
        )

    def test_create_job_partial_success_applies_allowed_fallback_fields(self) -> None:
        partial_result = {
            "summary": {
                "majorReactions": "핵심 반응",
                "positivePoints": "긍정 포인트",
            },
            "contentIdeas": None,
            "recommendedKeywords": None,
            "meta": {
                "model": "gemini-2.0-flash",
                "analyzedAt": "2026-02-22T12:00:08Z",
                "analysisBasis": ["title", "description", "comments"],
                "analysisVersion": "v1",
                "schemaVersion": "analysis-result-v1",
            },
        }

        with patch(
            "backend.app.domains.analysis.router.external_analysis_client.fetch_analysis_result",
            return_value=partial_result,
        ):
            response = self.client.post(
                "/api/analysis/jobs",
                json={"videoId": "video_partial_success", "forceRefresh": True},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["status"], "completed")
        result = body["data"]["result"]
        self.assertEqual(
            result["summary"]["weakPoints"],
            "충분한 데이터가 없어 아쉬운 점을 특정하기 어렵습니다.",
        )
        self.assertEqual(result["contentIdeas"], [])
        self.assertEqual(result["recommendedKeywords"], [])
        self.assertIn("meta", result)
        self.assertIn("warnings", result["meta"])
        self.assertGreaterEqual(len(result["meta"]["warnings"]), 1)

    def test_rate_limited_retry_after_header_not_exposed_for_non_rate_limited_errors(self) -> None:
        response = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_timeout", "forceRefresh": True},
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["error"]["code"], "ANALYSIS_TIMEOUT")
        self.assertIsNone(response.headers.get("Retry-After"))

    def test_create_job_upstream_unavailable_error_contract(self) -> None:
        response = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_upstream_unavailable", "forceRefresh": False},
        )

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertEqual(body["error"]["code"], "ANALYSIS_UPSTREAM_UNAVAILABLE")
        self.assertEqual(
            body["error"]["message"],
            "분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
        )

    def test_create_job_dedupe_reuses_processing_job(self) -> None:
        responses: list[dict] = []

        def request_once() -> None:
            response = self.client.post(
                "/api/analysis/jobs",
                json={"videoId": "video_dedupe_slow", "forceRefresh": False},
            )
            self.assertEqual(response.status_code, 200)
            responses.append(response.json())

        first_thread = threading.Thread(target=request_once)
        second_thread = threading.Thread(target=request_once)

        first_thread.start()
        second_thread.start()
        first_thread.join()
        second_thread.join()

        self.assertEqual(len(responses), 2)
        first_job_id = responses[0]["data"]["jobId"]
        second_job_id = responses[1]["data"]["jobId"]
        self.assertEqual(first_job_id, second_job_id)


    def test_cors_preflight_includes_access_control_allow_origin(self) -> None:
        response = self.client.options(
            "/api/analysis/jobs",
            headers={
                "Origin": "https://ytitemsearch.netlify.app",
                "Access-Control-Request-Method": "POST",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "*",
        )

    def test_force_refresh_bypasses_cache(self) -> None:
        first = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_force_refresh", "forceRefresh": False},
        )
        self.assertEqual(first.status_code, 200)
        self.assertFalse(first.json()["data"]["result"]["meta"]["cacheHit"])

        second = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_force_refresh", "forceRefresh": False},
        )
        self.assertEqual(second.status_code, 200)
        self.assertTrue(second.json()["data"]["result"]["meta"]["cacheHit"])

        third = self.client.post(
            "/api/analysis/jobs",
            json={"videoId": "video_force_refresh", "forceRefresh": True},
        )
        self.assertEqual(third.status_code, 200)
        self.assertFalse(third.json()["data"]["result"]["meta"]["cacheHit"])


if __name__ == "__main__":
    unittest.main()
