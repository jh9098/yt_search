export type AnalysisModalStatus = "loading" | "success" | "error";

export type AnalysisBasis =
  | "title"
  | "description"
  | "comments"
  | "transcript"
  | "thumbnail_ocr"
  | "channel_meta";

export type AnalysisJobStatus = "queued" | "processing" | "completed" | "failed";

export type AnalysisErrorCode =
  | "COMMON_INVALID_REQUEST"
  | "ANALYSIS_TIMEOUT"
  | "ANALYSIS_OUTPUT_INVALID"
  | "ANALYSIS_JOB_NOT_FOUND"
  | "ANALYSIS_RATE_LIMITED"
  | "ANALYSIS_UPSTREAM_UNAVAILABLE";

export interface AnalysisSummary {
  majorReactions: string;
  positivePoints: string;
  weakPoints: string;
}

export interface AnalysisContentIdea {
  title: string;
  description: string;
}

export interface AnalysisMeta {
  model: string;
  analyzedAt: string;
  commentSampleCount?: number;
  analysisBasis: AnalysisBasis[];
  languageSummary?: string[];
  cacheHit?: boolean;
  analysisVersion: string;
  schemaVersion: string;
  warnings?: string[];
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  contentIdeas: AnalysisContentIdea[];
  recommendedKeywords: string[];
  meta: AnalysisMeta;
}

export interface AnalysisStatusData {
  jobId: string;
  status: AnalysisJobStatus;
  progress?: number;
  step?: string;
  message?: string;
  result?: AnalysisResult;
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface AnalysisErrorState {
  title: string;
  message: string;
  code?: string;
  canRetry: boolean;
}

export interface AnalysisLoadingState {
  progress?: number;
  step?: string;
  message: string;
}

export interface AnalysisModalProps {
  status: AnalysisModalStatus;
  result?: AnalysisResult | null;
  error?: AnalysisErrorState | null;
  loadingState?: AnalysisLoadingState;
  onClose: () => void;
  onRetry: () => void;
  isActionDisabled?: boolean;
  onKeywordClick?: (keyword: string) => void;
  locale?: string;
}
