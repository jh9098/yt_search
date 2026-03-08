import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import { VideoCard } from "./VideoCard";
import { SEARCH_RESULT_CARD_SAMPLE } from "./searchResultCard.fixture";

describe("VideoCard", () => {
  it("영문 locale 텍스트를 액션 라벨/aria-label에 반영한다", () => {
    const text = getSearchUiText("en");

    const markup = renderToStaticMarkup(
      <VideoCard
        card={SEARCH_RESULT_CARD_SAMPLE}
        keyword="family"
        isAnalyzeDisabled={false}
        onAnalyze={vi.fn()}
        onExtractTranscript={vi.fn()}
        hoverMetric="vidiqTrend"
        searchUiText={text}
      />,
    );

    expect(markup).toContain(text.videoCard.watchVideoLabel);
    expect(markup).toContain(text.videoCard.extractTranscriptLabel);
    expect(markup).toContain(text.videoCard.analyzeLabel);
    expect(markup).toContain(`${SEARCH_RESULT_CARD_SAMPLE.title} ${text.videoCard.watchVideoAriaLabelSuffix}`);
    expect(markup).toContain(
      `${SEARCH_RESULT_CARD_SAMPLE.title} ${text.videoCard.extractTranscriptAriaLabelSuffix}`,
    );
    expect(markup).toContain(`${SEARCH_RESULT_CARD_SAMPLE.title} ${text.videoCard.analyzeAriaLabelSuffix}`);
  });
});
