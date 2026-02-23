import type { AnalysisErrorState, AnalysisResult } from "../types";

export const analysisResultMock: AnalysisResult = {
  summary: {
    majorReactions:
      "댓글에서는 가족 관계에서 반복되는 상처 주는 말에 대한 공감 반응이 많고, 자신의 경험을 공유하며 원인을 이해하려는 반응이 두드러집니다.",
    positivePoints:
      "뇌과학·심리 관점으로 문제를 설명해 '내 탓만이 아니라 이해 가능한 패턴'으로 받아들이게 해준 점에 긍정 반응이 많습니다.",
    weakPoints:
      "일부 댓글에서는 해결 방법이 다소 추상적이고, 상황별 대화 예시가 더 있었으면 좋겠다는 반응이 있습니다.",
  },
  contentIdeas: [
    {
      title: "가족에게 상처 주는 말을 줄이는 3단계 대화법 (뇌과학 기반)",
      description:
        "감정 폭발 직전 멈추는 신호-표현 전환-사후 회복 대화를 3단계로 정리하는 후속 콘텐츠 아이디어입니다.",
    },
    {
      title: "왜 가족에게만 예민해질까? 관계별 감정 트리거 분석",
      description:
        "부부/부모-자녀 관계별 감정 트리거를 분리해 설명하고 실전 대응 팁을 제공합니다.",
    },
  ],
  recommendedKeywords: [
    "가족관계",
    "가족 대화법",
    "감정조절",
    "부부 소통",
    "부모자녀 관계",
  ],
  meta: {
    model: "gemini-2.0-flash",
    analyzedAt: "2026-02-23T09:00:00Z",
    commentSampleCount: 320,
    analysisBasis: ["title", "description", "comments"],
    languageSummary: ["ko"],
    cacheHit: false,
    analysisVersion: "v1",
    schemaVersion: "analysis-result-v1",
    warnings: [],
  },
};

export const analysisErrorMock: AnalysisErrorState = {
  title: "분석 실패",
  message: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  code: "ANALYSIS_TIMEOUT",
  canRetry: true,
};
