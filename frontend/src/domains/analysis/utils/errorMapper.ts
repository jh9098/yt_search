import type { AnalysisErrorCode, AnalysisErrorState } from "../types";

const DEFAULT_ERROR: AnalysisErrorState = {
  title: "분석 실패",
  message: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  code: "ANALYSIS_TIMEOUT",
  canRetry: true,
};

export function mapAnalysisError(params: {
  code?: string;
  message?: string;
  retryAfterSeconds?: number;
}): AnalysisErrorState {
  const code = params.code as AnalysisErrorCode | undefined;

  if (code === "COMMON_INVALID_REQUEST") {
    return {
      title: "요청값 오류",
      message: "요청값이 올바르지 않습니다. 입력값을 확인해 주세요.",
      code,
      canRetry: false,
    };
  }

  if (code === "ANALYSIS_JOB_NOT_FOUND") {
    return {
      title: "작업 정보 없음",
      message: "분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요.",
      code,
      canRetry: false,
    };
  }

  if (code === "ANALYSIS_RATE_LIMITED") {
    const delayText =
      params.retryAfterSeconds !== undefined
        ? `${params.retryAfterSeconds}초 후 다시 시도해 주세요.`
        : "잠시 후 다시 시도해 주세요.";

    return {
      title: "요청 지연",
      message: `분석 요청이 많아 잠시 지연되고 있습니다. ${delayText}`,
      code,
      canRetry: true,
    };
  }

  if (code === "ANALYSIS_UPSTREAM_UNAVAILABLE") {
    return {
      title: "분석 서비스 지연",
      message: "분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
      code,
      canRetry: true,
    };
  }

  if (code === "ANALYSIS_OUTPUT_INVALID") {
    return {
      title: "결과 검증 실패",
      message: "분석 결과 검증에 실패했습니다. 다시 시도해 주세요.",
      code,
      canRetry: true,
    };
  }

  if (code === "ANALYSIS_TIMEOUT") {
    return {
      title: "분석 시간 초과",
      message: "분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
      code,
      canRetry: true,
    };
  }

  if (params.message) {
    return {
      ...DEFAULT_ERROR,
      message: params.message,
      code: params.code,
    };
  }

  return {
    ...DEFAULT_ERROR,
    code: params.code ?? DEFAULT_ERROR.code,
  };
}
