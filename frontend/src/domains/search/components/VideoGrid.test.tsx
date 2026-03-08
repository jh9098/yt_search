import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import type { SearchResultCard } from "../types";
import { VideoGrid } from "./VideoGrid";
import { SEARCH_RESULT_CARD_SAMPLE } from "./searchResultCard.fixture";

function renderVideoGrid(viewMode: "grid" | "list", cards: SearchResultCard[] = [SEARCH_RESULT_CARD_SAMPLE]) {
  const text = getSearchUiText("en");

  return {
    text,
    markup: renderToStaticMarkup(
      <VideoGrid
        searchUiText={text}
        cards={cards}
        resultsState="success"
        viewMode={viewMode}
        errorMessage={null}
        isErrorRetryable={true}
        keyword="family"
        isAnalyzeDisabled={false}
        onRetrySearch={vi.fn()}
        onResetSearchConditions={vi.fn()}
        onAnalyze={vi.fn()}
        onExtractTranscript={vi.fn()}
        hoverMetric="vidiqTrend"
      />,
    ),
  };
}

describe("VideoGrid", () => {
  it("리스트 모드에서 locale 기반 SearchResultTable 렌더링으로 전환된다", () => {
    const { markup, text } = renderVideoGrid("list");

    expect(markup).toContain(`aria-label="${text.searchResultTable.tableAriaLabel}"`);
    expect(markup).toContain(text.searchResultTable.columns.title);
    expect(markup).toContain("table-sort-button");
    expect(markup).not.toContain("card-grid");
  });

  it("그리드 모드에서 VideoCard를 유지하고 리스트 테이블은 렌더링하지 않는다", () => {
    const { markup, text } = renderVideoGrid("grid");

    expect(markup).toContain("card-grid");
    expect(markup).toContain(text.videoCard.watchVideoLabel);
    expect(markup).not.toContain(`aria-label=\"${text.searchResultTable.tableAriaLabel}\"`);
  });
});
