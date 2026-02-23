from __future__ import annotations

import unittest

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


if __name__ == "__main__":
    unittest.main()
