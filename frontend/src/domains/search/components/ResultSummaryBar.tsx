import type { SearchSummary } from "../types";

interface ResultSummaryBarProps {
  summary: SearchSummary;
  onReset: () => void;
  onCopyShareUrl: () => void;
  shareMessage: string | null;
}

const STATE_LABEL: Record<SearchSummary["resultsState"], string> = {
  idle: "검색어를 입력하고 검색 버튼을 눌러주세요",
  loading: "검색 중",
  success: "검색 완료",
  empty: "검색 결과 없음",
  error: "검색 오류",
};

export function ResultSummaryBar({
  summary,
  onReset,
  onCopyShareUrl,
  shareMessage,
}: ResultSummaryBarProps) {
  return (
    <section className="result-summary-bar" aria-label="검색 결과 요약">
      <p>
        전체 <strong>{summary.totalCount}</strong>개 중 <strong>{summary.shownCount}</strong>개 표시
      </p>
      <div className="result-summary-actions">
        <button type="button" onClick={onReset} aria-label="검색 조건 초기화">
          필터 초기화
        </button>
        <button type="button" onClick={onCopyShareUrl} aria-label="현재 검색 조건 URL 복사">
          URL 복사
        </button>
      </div>
      <p className="result-summary-state" aria-live="polite">
        상태: {STATE_LABEL[summary.resultsState]}
      </p>
      {shareMessage ? <p className="result-summary-share-message">{shareMessage}</p> : null}
    </section>
  );
}
