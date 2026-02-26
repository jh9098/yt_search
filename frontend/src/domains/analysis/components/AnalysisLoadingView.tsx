import type { AnalysisLoadingState } from "../types";
import type { AnalysisUiText } from "../i18n/analysisUiText.types";

interface AnalysisLoadingViewProps {
  isActionDisabled: boolean;
  onClose: () => void;
  loadingState?: AnalysisLoadingState;
  text: AnalysisUiText;
}

export function AnalysisLoadingView({
  isActionDisabled,
  onClose,
  loadingState,
  text,
}: AnalysisLoadingViewProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{text.loadingTitle}</h2>
      <p className="mt-2 text-sm text-slate-600">{loadingState?.message ?? text.loadingFallbackMessage}</p>
      {loadingState?.step ? (
        <p className="mt-1 text-xs text-slate-500">{text.loadingCurrentStepLabel}: {loadingState.step}</p>
      ) : null}
      {typeof loadingState?.progress === "number" ? (
        <p className="mt-1 text-xs text-slate-500">{text.loadingProgressLabel}: {loadingState.progress}%</p>
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
        {text.closeButtonLabel}
      </button>
    </section>
  );
}
