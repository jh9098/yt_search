import { SearchApiError } from "../api/client";

const DEFAULT_ERROR_MESSAGE = "검색 중 문제가 발생했습니다. 필터를 조정한 뒤 검색 버튼으로 다시 시도해 주세요.";

const ERROR_POLICY_BY_CODE: Record<string, { message: string; retryable: boolean }> = {
  COMMON_INVALID_REQUEST: {
    message: "요청값이 올바르지 않습니다. 입력값을 확인해 주세요.",
    retryable: false,
  },
  SEARCH_QUOTA_EXCEEDED: {
    message: "검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
    retryable: true,
  },
  SEARCH_RATE_LIMITED: {
    message: "검색 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
    retryable: true,
  },
  SEARCH_UPSTREAM_UNAVAILABLE: {
    message: "검색 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
    retryable: true,
  },
  SEARCH_UPSTREAM_ERROR: {
    message: "검색 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    retryable: true,
  },
};

export interface SearchErrorPresentation {
  message: string;
  retryable: boolean;
  code: string;
}

export function mapSearchError(caughtError: unknown): SearchErrorPresentation {
  if (!(caughtError instanceof SearchApiError)) {
    return {
      code: "COMMON_UNKNOWN",
      message: DEFAULT_ERROR_MESSAGE,
      retryable: true,
    };
  }

  const policy = ERROR_POLICY_BY_CODE[caughtError.code];

  if (policy) {
    return {
      code: caughtError.code,
      message: policy.message,
      retryable: policy.retryable,
    };
  }

  return {
    code: caughtError.code,
    message: caughtError.message ?? DEFAULT_ERROR_MESSAGE,
    retryable: true,
  };
}
