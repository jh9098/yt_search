import type { AnalysisJobStatus, AnalysisLoadingState } from "../types";

function fallbackMessageByStatus(status?: AnalysisJobStatus): string {
  if (status === "queued") {
    return "분석을 준비 중입니다.";
  }

  return "분석 진행 중입니다.";
}

export function toLoadingState(params: {
  status?: AnalysisJobStatus;
  progress?: number;
  step?: string;
  message?: string;
}): AnalysisLoadingState {
  return {
    progress: params.progress,
    step: params.step,
    message: params.message?.trim() || fallbackMessageByStatus(params.status),
  };
}
