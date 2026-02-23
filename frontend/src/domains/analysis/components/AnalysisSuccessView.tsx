import type { AnalysisResult } from "../types";
import { AnalysisKeywordChips } from "./AnalysisKeywordChips";

interface AnalysisSuccessViewProps {
  result: AnalysisResult;
  onClose: () => void;
  onKeywordClick: (keyword: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "분석 시간 정보 없음";
  }

  return date.toLocaleString("ko-KR", { hour12: false });
}

export function AnalysisSuccessView({
  result,
  onClose,
  onKeywordClick,
}: AnalysisSuccessViewProps) {
  const contentIdeas = result.contentIdeas ?? [];
  const keywords = result.recommendedKeywords ?? [];
  const warnings = result.meta.warnings ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">분석 완료</h2>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <article>
          <h3 className="font-semibold text-slate-900">주요 반응 요약</h3>
          <p className="mt-1">{result.summary.majorReactions}</p>
        </article>
        <article>
          <h3 className="font-semibold text-slate-900">긍정 포인트</h3>
          <p className="mt-1">{result.summary.positivePoints}</p>
        </article>
        <article>
          <h3 className="font-semibold text-slate-900">아쉬운 점</h3>
          <p className="mt-1">{result.summary.weakPoints}</p>
        </article>
      </div>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">콘텐츠 아이디어</h3>
        {contentIdeas.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">추천 아이디어가 없습니다.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {contentIdeas.map((idea) => (
              <li key={idea.title} className="rounded-md bg-slate-50 p-3">
                <p className="font-medium text-slate-900">{idea.title}</p>
                <p className="mt-1 text-sm text-slate-600">{idea.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">추천 키워드</h3>
        <AnalysisKeywordChips keywords={keywords} onKeywordClick={onKeywordClick} />
      </section>

      <section className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>모델: {result.meta.model}</p>
        <p>분석 시각: {formatDate(result.meta.analyzedAt)}</p>
        <p>분석 기준: {result.meta.analysisBasis.join(", ") || "정보 없음"}</p>
        <p>analysisVersion: {result.meta.analysisVersion}</p>
        <p>schemaVersion: {result.meta.schemaVersion}</p>
        {warnings.length > 0 && (
          <p className="mt-1 text-amber-700">경고: {warnings.join(" / ")}</p>
        )}
      </section>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
      >
        닫기
      </button>
    </section>
  );
}
