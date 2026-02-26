import { getAnalysisUiText } from "../i18n/analysisUiText";
import { AnalysisErrorView } from "./AnalysisErrorView";
import { AnalysisLoadingView } from "./AnalysisLoadingView";
import { AnalysisSuccessView } from "./AnalysisSuccessView";
import type { AnalysisModalProps } from "../types";

export function AnalysisModal({
  status,
  result,
  error,
  loadingState,
  onClose,
  onRetry,
  isActionDisabled,
  onKeywordClick,
  locale,
}: AnalysisModalProps) {
  const disabled = isActionDisabled ?? status === "loading";
  const analysisUiText = getAnalysisUiText(locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4">
        {status === "loading" ? (
          <AnalysisLoadingView
            isActionDisabled={disabled}
            onClose={onClose}
            loadingState={loadingState}
            text={analysisUiText}
          />
        ) : null}

        {status === "success" ? (
          result ? (
            <AnalysisSuccessView
              result={result}
              onClose={onClose}
              onKeywordClick={onKeywordClick ?? (() => undefined)}
              text={analysisUiText}
              locale={locale ?? "ko-KR"}
            />
          ) : (
            <AnalysisErrorView
              error={{
                title: analysisUiText.missingResultTitle,
                message: analysisUiText.missingResultMessage,
                canRetry: true,
                code: "ANALYSIS_OUTPUT_INVALID",
              }}
              isActionDisabled={disabled}
              onClose={onClose}
              onRetry={onRetry}
              text={analysisUiText}
            />
          )
        ) : null}

        {status === "error" ? (
          <AnalysisErrorView
            error={
              error ?? {
                title: analysisUiText.failedTitle,
                message: analysisUiText.failedMessage,
                canRetry: true,
              }
            }
            isActionDisabled={disabled}
            onClose={onClose}
            onRetry={onRetry}
            text={analysisUiText}
          />
        ) : null}
      </div>
    </div>
  );
}
