import type {
  AnalysisStatusData,
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api";

interface CreateAnalysisJobParams {
  videoId: string;
  forceRefresh?: boolean;
}

export class AnalysisApiError extends Error {
  readonly code: string;
  readonly retryAfterSeconds?: number;

  constructor(params: { code: string; message: string; retryAfterSeconds?: number }) {
    super(params.message);
    this.code = params.code;
    this.retryAfterSeconds = params.retryAfterSeconds;
  }
}

function parseRetryAfterSeconds(response: Response): number | undefined {
  const retryAfterHeader = response.headers.get("Retry-After");
  if (!retryAfterHeader) {
    return undefined;
  }

  const parsed = Number.parseInt(retryAfterHeader, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function requestAnalysis<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    let errorMessage = "분석 요청 중 오류가 발생했습니다.";
    let errorCode = "ANALYSIS_TIMEOUT";

    try {
      const body = await parseJson<ApiErrorResponse>(response);
      if (body.success === false) {
        errorCode = body.error.code;
        errorMessage = body.error.message;
      }
    } catch {
      // JSON 파싱 실패 시 fallback 메시지 유지
    }

    throw new AnalysisApiError({
      code: errorCode,
      message: errorMessage,
      retryAfterSeconds: parseRetryAfterSeconds(response),
    });
  }

  const body = await parseJson<ApiSuccessResponse<T>>(response);
  return body.data;
}

export async function createAnalysisJob(
  params: CreateAnalysisJobParams,
): Promise<AnalysisStatusData> {
  return requestAnalysis<AnalysisStatusData>("/analysis/jobs", {
    method: "POST",
    body: JSON.stringify({
      videoId: params.videoId,
      forceRefresh: params.forceRefresh ?? false,
    }),
  });
}

export async function getAnalysisJobStatus(jobId: string): Promise<AnalysisStatusData> {
  return requestAnalysis<AnalysisStatusData>(`/analysis/jobs/${jobId}`, {
    method: "GET",
  });
}
