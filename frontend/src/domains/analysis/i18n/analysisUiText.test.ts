import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANALYSIS_UI_LOCALE,
  getAnalysisUiText,
} from "./analysisUiText";

describe("getAnalysisUiText", () => {
  it("locale 미입력 시 기본 locale 문구를 반환한다", () => {
    const text = getAnalysisUiText();

    expect(text.loadingTitle).toBe("AI 소재 분석 중");
    expect(DEFAULT_ANALYSIS_UI_LOCALE).toBe("ko");
  });

  it("지원 locale(en)를 입력하면 영어 문구를 반환한다", () => {
    const text = getAnalysisUiText("en");

    expect(text.loadingTitle).toBe("AI material analysis in progress");
    expect(text.retryButtonLabel).toBe("Retry");
  });

  it("미지원 locale 입력 시 기본 locale로 fallback한다", () => {
    const text = getAnalysisUiText("ja");

    expect(text.loadingTitle).toBe("AI 소재 분석 중");
  });
});
