import type {
  SearchApiErrorResponse,
  SearchApiRequestParams,
  SearchApiResponseData,
  SearchApiSuccessResponse,
} from "../types";
import { API_BASE_URL } from "../../../shared-api-base-url";

const SEARCH_PATH = import.meta.env.VITE_SEARCH_API_PATH ?? "/search/videos";
const API_SEGMENT = "/api";

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

  searchParams.set("topic", params.topic);
  searchParams.set("resultLimit", String(params.resultLimit));
  searchParams.set("sort", params.sort);
  searchParams.set("period", params.period);
  searchParams.set("minViews", String(params.minViews));
  if (params.country.trim().length > 0) {
    searchParams.set("country", params.country.trim().toUpperCase());
  }
  searchParams.set("maxSubscribers", String(params.maxSubscribers));
  searchParams.set("subscriberPublicOnly", String(params.subscriberPublicOnly));
  searchParams.set("durationBucket", params.durationBucket);
  searchParams.set("shortFormType", params.shortFormType);
  searchParams.set("scriptType", params.scriptType);
  searchParams.set("hoverMetric", params.hoverMetric);
  searchParams.set("minPerformance", String(params.minPerformance));
  searchParams.set("corePreset", params.corePreset);

  return searchParams.toString();
}

function toLegacySearchQueryString(params: SearchApiRequestParams): string {
  const searchParams = new URLSearchParams();

  const trimmedKeyword = params.q.trim();
  const trimmedChannel = params.channel.trim();

  if (trimmedKeyword.length > 0) {
    searchParams.set("q", trimmedKeyword);
  }

  if (trimmedChannel.length > 0) {
    searchParams.set("channel", trimmedChannel);
  }

  // 레거시 백엔드와의 호환을 위해 enum 충돌 가능성이 있는 옵션은 제외한다.
  // (일부 배포본은 sort/period 허용값이 달라 422를 반환함)
  searchParams.set("minViews", String(params.minViews));

  if (params.country.trim().length > 0) {
    searchParams.set("country", params.country.trim().toUpperCase());
  }

  searchParams.set("resultLimit", String(Math.min(params.resultLimit, 50)));

  return searchParams.toString();
}

export function buildSearchRequestPath(params: SearchApiRequestParams): string {
  const queryString = toSearchQueryString(params);
  return queryString.length > 0 ? `${SEARCH_PATH}?${queryString}` : SEARCH_PATH;
}

export function buildLegacySearchRequestPath(params: SearchApiRequestParams): string {
  const queryString = toLegacySearchQueryString(params);
  return queryString.length > 0 ? `${SEARCH_PATH}?${queryString}` : SEARCH_PATH;
}

export function buildPrimarySearchUrl(requestPath: string): string {
  return `${API_BASE_URL}${requestPath}`;
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}


function toRequestHeaders(apiKeys?: string[]): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKeys && apiKeys.length > 0) {
    headers["X-YouTube-Api-Keys"] = apiKeys.join(",");
  }

  return headers;
}

function removeApiSuffix(baseUrl: string): string {
  if (baseUrl.endsWith(API_SEGMENT)) {
    return baseUrl.slice(0, -API_SEGMENT.length);
  }

  return baseUrl;
}

async function fetchSearchResponse(requestPath: string, apiKeys?: string[]): Promise<Response> {
  const primaryResponse = await fetch(buildPrimarySearchUrl(requestPath), {
    method: "GET",
    headers: toRequestHeaders(apiKeys),
  });

  if (primaryResponse.status !== 404) {
    return primaryResponse;
  }

  const fallbackBaseUrl = removeApiSuffix(API_BASE_URL);

  if (fallbackBaseUrl === API_BASE_URL) {
    return primaryResponse;
  }

  return fetch(`${fallbackBaseUrl}${requestPath}`, {
    method: "GET",
    headers: toRequestHeaders(apiKeys),
  });
}

export async function searchVideos(params: SearchApiRequestParams): Promise<SearchApiResponseData> {
  const requestPath = buildSearchRequestPath(params);
  let response = await fetchSearchResponse(requestPath, params.apiKeys);

  if (response.status === 422) {
    const legacyRequestPath = buildLegacySearchRequestPath(params);
    response = await fetchSearchResponse(legacyRequestPath, params.apiKeys);
  }

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
