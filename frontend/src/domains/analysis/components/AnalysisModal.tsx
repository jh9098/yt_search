import { AnalysisErrorView } from "./AnalysisErrorView";
import { AnalysisLoadingView } from "./AnalysisLoadingView";
import { AnalysisSuccessView } from "./AnalysisSuccessView";
import type { AnalysisModalProps } from "../types";

export function AnalysisModal({
  status,
  result,
  error,
  onClose,
  onRetry,
  isActionDisabled,
}: AnalysisModalProps) {
  const disabled = isActionDisabled ?? status === "loading";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4">
        {status === "loading" ? (
          <AnalysisLoadingView isActionDisabled={disabled} onClose={onClose} />
        ) : null}

        {status === "success" ? (
          result ? (
            <AnalysisSuccessView result={result} onClose={onClose} />
          ) : (
            <AnalysisErrorView
              error={{
                title: "결과 누락",
                message: "분석 결과를 표시할 수 없습니다. 다시 시도해 주세요.",
                code: "ANALYSIS_OUTPUT_INVALID",
                canRetry: true,
              }}
              isActionDisabled={false}
              onClose={onClose}
              onRetry={onRetry}
            />
          )
        ) : null}

        {status === "error" ? (
          <AnalysisErrorView
            error={
              error ?? {
                title: "분석 실패",
                message: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                code: "ANALYSIS_TIMEOUT",
                canRetry: true,
              }
            }
            isActionDisabled={disabled}
            onClose={onClose}
            onRetry={onRetry}
          />
        ) : null}
      </div>
    </div>
  );
}
