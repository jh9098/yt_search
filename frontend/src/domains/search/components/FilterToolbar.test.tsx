import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import type { SearchFilterState } from "../types";
import { FilterToolbar } from "./FilterToolbar";

const BASE_FILTERS: SearchFilterState = {
  sort: "relevance",
  period: "7d",
  minViews: 0,
  country: "KR",
  maxSubscribers: 1_000_000,
  subscriberPublicOnly: false,
  durationBucket: "all",
  shortFormType: "all",
  scriptType: "all",
  hoverMetric: "vidiqTrend",
  minPerformance: 0,
  corePreset: "none",
};

describe("FilterToolbar", () => {
  it("영문 locale 텍스트로 라벨/옵션을 렌더링한다", () => {
    const text = getSearchUiText("en");

    const markup = renderToStaticMarkup(
      <FilterToolbar
        filters={BASE_FILTERS}
        isDisabled={false}
        onChange={vi.fn()}
        onReset={vi.fn()}
        searchUiText={text}
      />,
    );

    expect(markup).toContain(text.filterToolbar.labels.sort);
    expect(markup).toContain(text.filterToolbar.labels.period);
    expect(markup).toContain(text.filterToolbar.options.sort.views);
    expect(markup).toContain(text.filterToolbar.options.corePreset.krTrend);
    expect(markup).toContain(text.filterToolbar.options.clearPreset);
  });
});
