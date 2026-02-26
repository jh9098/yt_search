from __future__ import annotations

from datetime import datetime, timedelta, timezone
import unittest

from backend.app.domains.search.scoring import (
    classify_contribution_grade,
    compute_contribution,
    compute_engagement_rate,
    compute_exposure_score,
    compute_performance_score,
    is_hot_video,
)


class ScoringTest(unittest.TestCase):
    def test_contribution_and_grade(self) -> None:
        self.assertIsNone(compute_contribution(1000, 0, True))
        contribution = compute_contribution(1000, 100, True)
        self.assertEqual(contribution, 1000.0)
        self.assertEqual(classify_contribution_grade(contribution), "Very Good")

    def test_engagement_rate_missing_rules(self) -> None:
        self.assertIsNone(compute_engagement_rate(0, 10, 1))
        self.assertIsNone(compute_engagement_rate(100, 0, 0))
        self.assertEqual(compute_engagement_rate(100, 5, 5), 10.0)

    def test_performance_score_reweights_when_engagement_missing(self) -> None:
        score_with_engagement = compute_performance_score(200.0, 1.2, 10000)
        score_without_engagement = compute_performance_score(200.0, None, 10000)
        self.assertGreaterEqual(score_with_engagement, 0.0)
        self.assertGreaterEqual(score_without_engagement, 0.0)

    def test_exposure_score_range(self) -> None:
        now = datetime.now(timezone.utc)
        score = compute_exposure_score(
            keyword="가족 대화",
            title="가족 갈등 대화법",
            subscriber_count=1000,
            engagement_rate=0.5,
            total_video_count=10,
            published_at=now - timedelta(days=180),
            now=now,
        )
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 100.0)

    def test_hot_video(self) -> None:
        self.assertTrue(is_hot_video(220.0, 70.0))
        self.assertFalse(is_hot_video(None, 70.0))


if __name__ == "__main__":
    unittest.main()
