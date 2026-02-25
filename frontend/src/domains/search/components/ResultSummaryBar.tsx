import { SEARCH_UI_TEXT } from "../i18n/searchUiText";
import type { SearchSummary } from "../types";

interface ResultSummaryBarProps {
  summary: SearchSummary;
  isSearchErrorRetryable: boolean;
  onReset: () => void;
  onCopyShareUrl: () => void;
  shareMessage: string | null;
  popStateNoticeMessage: string | null;
}

const STATE_LABEL = SEARCH_UI_TEXT.resultSummary.stateLabel;

export function ResultSummaryBar({
  summary,
  isSearchErrorRetryable,
  onReset,
  onCopyShareUrl,
  shareMessage,
  popStateNoticeMessage,
}: ResultSummaryBarProps) {
  return (
    <section className="result-summary-bar" aria-label={SEARCH_UI_TEXT.resultSummary.sectionAriaLabel}>
      <p>
        전체 <strong>{summary.totalCount}</strong>개 중 <strong>{summary.shownCount}</strong>개 표시
      </p>
      <div className="result-summary-actions">
        <button type="button" onClick={onReset} aria-label={SEARCH_UI_TEXT.resultSummary.resetButtonAriaLabel}>
          {SEARCH_UI_TEXT.resultSummary.resetButtonLabel}
        </button>
        <button type="button" onClick={onCopyShareUrl} aria-label={SEARCH_UI_TEXT.resultSummary.copyUrlButtonAriaLabel}>
          {SEARCH_UI_TEXT.resultSummary.copyUrlButtonLabel}
        </button>
      </div>
      <p className="result-summary-state" aria-live="polite">
        {SEARCH_UI_TEXT.resultSummary.statePrefix} {STATE_LABEL[summary.resultsState]}
      </p>
      {summary.resultsState === "error" && !isSearchErrorRetryable ? (
        <p className="result-summary-error-guide" role="status" aria-live="polite">
          {SEARCH_UI_TEXT.resultSummary.nonRetryableGuide}
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
