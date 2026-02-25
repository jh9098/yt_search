import type { SearchUiText } from "../i18n/searchUiText.types";
import type { SearchSummary } from "../types";

interface ResultSummaryBarProps {
  searchUiText: SearchUiText;
  summary: SearchSummary;
  isSearchErrorRetryable: boolean;
  onReset: () => void;
  onCopyShareUrl: () => void;
  shareMessage: string | null;
  popStateNoticeMessage: string | null;
}

export function ResultSummaryBar({
  searchUiText,
  summary,
  isSearchErrorRetryable,
  onReset,
  onCopyShareUrl,
  shareMessage,
  popStateNoticeMessage,
}: ResultSummaryBarProps) {
  const stateLabel = searchUiText.resultSummary.stateLabel;

  return (
    <section className="result-summary-bar" aria-label={searchUiText.resultSummary.sectionAriaLabel}>
      <p>
        전체 <strong>{summary.totalCount}</strong>개 중 <strong>{summary.shownCount}</strong>개 표시
      </p>
      <div className="result-summary-actions">
        <button type="button" onClick={onReset} aria-label={searchUiText.resultSummary.resetButtonAriaLabel}>
          {searchUiText.resultSummary.resetButtonLabel}
        </button>
        <button type="button" onClick={onCopyShareUrl} aria-label={searchUiText.resultSummary.copyUrlButtonAriaLabel}>
          {searchUiText.resultSummary.copyUrlButtonLabel}
        </button>
      </div>
      <p className="result-summary-state" aria-live="polite">
        {searchUiText.resultSummary.statePrefix} {stateLabel[summary.resultsState]}
      </p>
      {summary.resultsState === "error" && !isSearchErrorRetryable ? (
        <p className="result-summary-error-guide" role="status" aria-live="polite">
          {searchUiText.resultSummary.nonRetryableGuide}
        </p>
      ) : null}
      {shareMessage ? <p className="result-summary-share-message">{shareMessage}</p> : null}
      {popStateNoticeMessage ? (
        <p className="result-summary-popstate-notice" role="status" aria-live="polite">
          {popStateNoticeMessage}
        </p>
      ) : null}
    </section>
  );
}
