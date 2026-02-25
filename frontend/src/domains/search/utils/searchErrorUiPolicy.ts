interface SearchErrorUiPolicy {
  helperMessage: string;
  primaryActionLabel: string;
}

const RETRYABLE_POLICY: SearchErrorUiPolicy = {
  helperMessage: "일시적인 오류일 수 있습니다. 같은 조건으로 다시 검색해 보세요.",
  primaryActionLabel: "같은 조건으로 다시 검색",
};

const NON_RETRYABLE_POLICY: SearchErrorUiPolicy = {
  helperMessage: "입력값 또는 필터 조건을 수정한 뒤 다시 검색해 주세요.",
  primaryActionLabel: "검색 조건 초기화",
};

export function getSearchErrorUiPolicy(isRetryable: boolean): SearchErrorUiPolicy {
  return isRetryable ? RETRYABLE_POLICY : NON_RETRYABLE_POLICY;
}

