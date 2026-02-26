import type { AppUiText } from "../appUiText.types";

export const APP_UI_TEXT_KO: AppUiText = {
  appHeader: {
    title: "유튜브 소재 채굴기 v2.0",
    subtitle: "검색 결과에서 바로 AI 소재 분석을 실행할 수 있습니다.",
    quotaAriaLabel: "추정 할당량 잔량",
    quotaTitle: "추정 할당량 잔량",
  },
  common: {
    analysisPreparing: "분석을 준비 중입니다.",
    copyUrlSuccess: "URL이 복사되었습니다.",
    copyUrlFailure: "URL 복사에 실패했습니다.",
    transcriptUnknownError: "대본 추출 중 알 수 없는 오류가 발생했습니다.",
  },
  transcriptModal: {
    dialogAriaLabel: "영상 대본 추출 결과",
    loadingTitle: "대본 추출 중",
    defaultTitle: "영상 대본",
    closeButton: "닫기",
    loadingMessage: "대본을 가져오는 중입니다...",
    defaultErrorMessage: "대본 추출에 실패했습니다.",
    titleLabel: "제목",
    languageLabel: "언어",
    sourceLabel: "출처",
  },
};
