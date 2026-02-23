import type { SearchSummary } from "../types";

interface ResultSummaryBarProps {
  summary: SearchSummary;
}

const STATE_LABEL: Record<SearchSummary["resultsState"], string> = {
  idle: "검색 조건 입력 대기",
  loading: "검색 중",
  success: "검색 완료",
  empty: "검색 결과 없음",
  error: "검색 오류",
};

export function ResultSummaryBar({ summary }: ResultSummaryBarProps) {
  return (
    <section className="result-summary-bar" aria-label="검색 결과 요약">
      <p>
        전체 <strong>{summary.totalCount}</strong>개 중 <strong>{summary.shownCount}</strong>개 표시
      </p>
      <p className="result-summary-state" aria-live="polite">
        상태: {STATE_LABEL[summary.resultsState]}
      </p>
    </section>
  );
}
