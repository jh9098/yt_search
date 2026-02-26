import type { AnalysisErrorState } from "../types";
import type { AnalysisUiText } from "../i18n/analysisUiText.types";

interface AnalysisErrorViewProps {
  error: AnalysisErrorState;
  isActionDisabled: boolean;
  onClose: () => void;
  onRetry: () => void;
  text: AnalysisUiText;
}

export function AnalysisErrorView({
  error,
  isActionDisabled,
  onClose,
  onRetry,
  text,
}: AnalysisErrorViewProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-red-800">{error.title}</h2>
      <p className="mt-2 text-sm text-red-700">{error.message}</p>
      {error.code ? <p className="mt-1 text-xs text-red-600">{text.errorCodeLabel}: {error.code}</p> : null}

      <div className="mt-5 flex gap-2">
        {error.canRetry ? (
          <button
            type="button"
            disabled={isActionDisabled}
            onClick={onRetry}
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {text.retryButtonLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={isActionDisabled}
          onClick={onClose}
          className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {text.closeButtonLabel}
        </button>
      </div>
    </section>
  );
}
