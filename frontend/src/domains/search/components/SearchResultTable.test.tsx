import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getSearchUiText } from "../i18n/searchUiText";
import { SearchResultTable } from "./SearchResultTable";
import { SEARCH_RESULT_CARD_SAMPLE } from "./searchResultCard.fixture";

describe("SearchResultTable", () => {
  it("영문 locale 테이블 aria-label/컬럼명을 렌더링한다", () => {
    const text = getSearchUiText("en");
    const markup = renderToStaticMarkup(
      <SearchResultTable cards={[SEARCH_RESULT_CARD_SAMPLE]} searchUiText={text} />,
    );

    expect(markup).toContain(`aria-label="${text.searchResultTable.tableAriaLabel}"`);
    expect(markup).toContain(text.searchResultTable.columns.title);
    expect(markup).toContain(text.searchResultTable.columns.subscriberCount);
    expect(markup).toContain(text.searchResultTable.columns.performanceScore);
  });
});
