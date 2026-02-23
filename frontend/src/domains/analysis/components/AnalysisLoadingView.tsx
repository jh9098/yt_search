import type { AnalysisLoadingState } from "../types";

interface AnalysisLoadingViewProps {
  isActionDisabled: boolean;
  onClose: () => void;
  loadingState?: AnalysisLoadingState;
}

export function AnalysisLoadingView({
  isActionDisabled,
  onClose,
  loadingState,
}: AnalysisLoadingViewProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">AI 소재 분석 중</h2>
      <p className="mt-2 text-sm text-slate-600">{loadingState?.message ?? "분석 진행 중입니다."}</p>
      {loadingState?.step ? (
        <p className="mt-1 text-xs text-slate-500">현재 단계: {loadingState.step}</p>
      ) : null}
      {typeof loadingState?.progress === "number" ? (
        <p className="mt-1 text-xs text-slate-500">진행률: {loadingState.progress}%</p>
      ) : null}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:120ms]" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:240ms]" />
      </div>
      <button
        type="button"
        disabled={isActionDisabled}
        onClick={onClose}
        className="mt-6 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        닫기
      </button>
    </section>
  );
}
