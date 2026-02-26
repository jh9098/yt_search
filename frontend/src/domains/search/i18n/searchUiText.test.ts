import { describe, expect, it } from "vitest";

import { DEFAULT_SEARCH_UI_LOCALE, getSearchUiText } from "./searchUiText";

describe("getSearchUiText", () => {
  it("기본 locale이 없으면 기본값(ko)을 반환한다", () => {
    const text = getSearchUiText();

    expect(DEFAULT_SEARCH_UI_LOCALE).toBe("ko");
    expect(text.keywordSearch.label).toBe("키워드 검색");
    expect(text.searchLayout.panelAriaLabel).toBe("탐색 검색 패널");
    expect(text.filterToolbar.labels.sort).toBe("정렬");
    expect(text.videoCard.watchVideoLabel).toBe("영상 보기");
  });

  it("지원 locale(en) 요청 시 해당 리소스를 반환한다", () => {
    const text = getSearchUiText("en");

    expect(text.keywordSearch.label).toBe("Keyword search");
    expect(text.resultSummary.statePrefix).toBe("State:");
    expect(text.viewMode.gridButtonLabel).toBe("Grid");
    expect(text.filterToolbar.labels.sort).toBe("Sort");
    expect(text.videoCard.watchVideoLabel).toBe("Watch video");
  });

  it("미지원 locale은 기본 locale로 fallback한다", () => {
    const text = getSearchUiText("ja");

    expect(text.keywordSearch.label).toBe("키워드 검색");
    expect(text.searchLayout.panelAriaLabel).toBe("탐색 검색 패널");
    expect(text.videoGrid.loadingTitle).toBe("데이터를 분석하고 있습니다...");
  });
});
