import { SearchApiError } from "../api/client";

const DEFAULT_ERROR_MESSAGE = "검색 중 문제가 발생했습니다. 필터를 조정한 뒤 검색 버튼으로 다시 시도해 주세요.";

const ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  SEARCH_QUOTA_EXCEEDED:
    "YouTube API 할당량이 소진되어 검색이 일시 중단되었습니다. 잠시 후 다시 시도하거나 운영자에게 API 할당량 상태를 확인해 주세요.",
  SEARCH_RATE_LIMITED:
    "요청이 짧은 시간에 집중되어 검색이 지연되고 있습니다. 1~2분 뒤 다시 시도해 주세요.",
  SEARCH_UPSTREAM_UNAVAILABLE:
    "검색 원본 서비스(YouTube API)에 연결할 수 없습니다. 서버의 YOUTUBE_API_KEY 설정 또는 일시 장애 여부를 확인해 주세요.",
  SEARCH_UPSTREAM_ERROR:
    "검색 서버가 원본 데이터 처리 중 오류를 반환했습니다. 잠시 후 다시 시도해 주세요.",
};

export function mapSearchErrorMessage(caughtError: unknown): string {
  if (!(caughtError instanceof SearchApiError)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  return ERROR_MESSAGE_BY_CODE[caughtError.code] ?? caughtError.message ?? DEFAULT_ERROR_MESSAGE;
}
