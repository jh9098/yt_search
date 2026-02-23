import type {
  SearchApiErrorResponse,
  SearchApiRequestParams,
  SearchApiResponseData,
  SearchApiSuccessResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api";

const SEARCH_PATH = import.meta.env.VITE_SEARCH_API_PATH ?? "/search/videos";

export class SearchApiError extends Error {
  readonly code: string;

  constructor(params: { code: string; message: string }) {
    super(params.message);
    this.code = params.code;
  }
}

function toSearchQueryString(params: SearchApiRequestParams): string {
  const searchParams = new URLSearchParams();

  const trimmedKeyword = params.q.trim();
  const trimmedChannel = params.channel.trim();

  if (trimmedKeyword.length > 0) {
    searchParams.set("q", trimmedKeyword);
  }

  if (trimmedChannel.length > 0) {
    searchParams.set("channel", trimmedChannel);
  }

  searchParams.set("sort", params.sort);
  searchParams.set("period", params.period);
  searchParams.set("minViews", String(params.minViews));

  return searchParams.toString();
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function searchVideos(params: SearchApiRequestParams): Promise<SearchApiResponseData> {
  const queryString = toSearchQueryString(params);
  const requestPath = queryString.length > 0 ? `${SEARCH_PATH}?${queryString}` : SEARCH_PATH;

  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let code = "COMMON_INVALID_REQUEST";
    let message = "검색 요청 중 오류가 발생했습니다.";

    try {
      const body = await parseJson<SearchApiErrorResponse>(response);
      if (body.success === false) {
        code = body.error.code;
        message = body.error.message;
      }
    } catch {
      // 파싱 실패 시 기본 메시지 유지
    }

    throw new SearchApiError({ code, message });
  }

  const body = await parseJson<SearchApiSuccessResponse<SearchApiResponseData>>(response);
  return body.data;
}

