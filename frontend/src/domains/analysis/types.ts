export type AnalysisModalStatus = "loading" | "success" | "error";

export type AnalysisBasis =
  | "title"
  | "description"
  | "comments"
  | "transcript"
  | "thumbnail_ocr"
  | "channel_meta";

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

export interface AnalysisErrorState {
  title: string;
  message: string;
  code?: string;
  canRetry: boolean;
}

export interface AnalysisModalProps {
  status: AnalysisModalStatus;
  result?: AnalysisResult | null;
  error?: AnalysisErrorState | null;
  onClose: () => void;
  onRetry: () => void;
  isActionDisabled?: boolean;
  onKeywordClick?: (keyword: string) => void;
}
