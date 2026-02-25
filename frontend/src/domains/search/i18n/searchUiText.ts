export const SEARCH_UI_TEXT = {
  resultSummary: {
    sectionAriaLabel: "검색 결과 요약",
    resetButtonAriaLabel: "검색 조건 초기화",
    resetButtonLabel: "필터 초기화",
    copyUrlButtonAriaLabel: "현재 검색 조건 URL 복사",
    copyUrlButtonLabel: "URL 복사",
    statePrefix: "상태:",
    stateLabel: {
      idle: "검색어를 입력하고 검색 버튼을 눌러주세요",
      loading: "검색 중",
      success: "검색 완료",
      empty: "검색 결과 없음",
      error: "검색 오류",
    },
    nonRetryableGuide:
      "재시도보다 검색어/필터 수정이 우선입니다. 조건을 조정한 뒤 다시 검색해 주세요.",
    popStateRestoredNotice: "히스토리 상태를 복구해 검색 결과를 다시 불러왔습니다.",
  },
  errorPanel: {
    fallbackErrorMessage:
      "검색 중 문제가 발생했습니다. 필터를 조정한 뒤 검색 버튼으로 다시 시도해 주세요.",
    emptyResultMessage: "조건에 맞는 영상이 없습니다. 필터를 완화하고 다시 검색해 보세요.",
    retryableHelperMessage: "일시적인 오류일 수 있습니다. 같은 조건으로 다시 검색해 보세요.",
    retryablePrimaryActionLabel: "같은 조건으로 다시 검색",
    nonRetryableHelperMessage: "입력값 또는 필터 조건을 수정한 뒤 다시 검색해 주세요.",
    nonRetryablePrimaryActionLabel: "검색 조건 초기화",
  },
  keywordSearch: {
    sectionAriaLabel: "키워드 검색 영역",
    label: "키워드 검색",
    inputPlaceholder: "예: 가족 사연",
    inputAriaLabel: "키워드 입력",
    submitButtonAriaLabel: "키워드 검색 실행",
    submitButtonLabel: "키워드 검색",
    resultLimitAriaLabel: "검색 개수 제한",
    resultLimitOptions: {
      light: "50개 (라이트)",
      standard: "150개 (표준)",
      precise: "250개 (정밀)",
    },
  },
} as const;
