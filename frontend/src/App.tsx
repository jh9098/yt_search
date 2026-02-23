import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisModal } from "./domains/analysis/components/AnalysisModal";
import {
  AnalysisApiError,
  createAnalysisJob,
  getAnalysisJobStatus,
} from "./domains/analysis/api/client";
import {
  analysisErrorMock,
} from "./domains/analysis/mocks/analysisResult.mock";
import { mapAnalysisError } from "./domains/analysis/utils/errorMapper";
import { toLoadingState } from "./domains/analysis/utils/loadingFallback";
import type {
  AnalysisErrorState,
  AnalysisLoadingState,
  AnalysisModalStatus,
  AnalysisStatusData,
  AnalysisResult,
} from "./domains/analysis/types";

interface SearchResultCard {
  videoId: string;
  title: string;
  channelName: string;
}

const SEARCH_RESULT_CARDS: SearchResultCard[] = [
  {
    videoId: "video_family_talk_001",
    title: "가족과 대화가 자꾸 꼬일 때 감정 다루는 법",
    channelName: "마음연구소",
  },
  {
    videoId: "video_conflict_case_002",
    title: "부부 갈등 대화, 왜 반복될까?",
    channelName: "관계코치TV",
  },
];

const POLLING_INTERVAL_MS = 1200;

export function App() {
  const [searchKeyword, setSearchKeyword] = useState("가족 대화법");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<AnalysisModalStatus>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalysisErrorState | null>(null);
  const [loadingState, setLoadingState] = useState<AnalysisLoadingState>({
    message: "분석을 준비 중입니다.",
  });
  const pollTimerRef = useRef<number | null>(null);
  const activeSessionRef = useRef(0);
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  const selectedCard = useMemo(
    () => SEARCH_RESULT_CARDS.find((card) => card.videoId === selectedVideoId) ?? null,
    [selectedVideoId],
  );

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    activeSessionRef.current += 1;
    clearPollTimer();
  }, [clearPollTimer]);

  const applyStatusData = useCallback((data: AnalysisStatusData) => {
    if (data.status === "completed" && data.result) {
      setResult(data.result);
      setStatus("success");
      return;
    }

    if (data.status === "failed") {
      const mappedError = mapAnalysisError({
        code: data.error?.code,
        message: data.error?.message,
      });
      setError(mappedError);
      setStatus("error");
      return;
    }

    setLoadingState(
      toLoadingState({
        status: data.status,
        progress: data.progress,
        step: data.step,
        message: data.message,
      }),
    );
    setStatus("loading");
  }, []);

  const pollJobStatus = useCallback(
    async (jobId: string, sessionId: number) => {
      if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
        return;
      }

      try {
        const statusData = await getAnalysisJobStatus(jobId);
        if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
          return;
        }

        applyStatusData(statusData);
        const isCompleted = statusData.status === "completed" && Boolean(statusData.result);
        const isFailed = statusData.status === "failed";

        if (isCompleted || isFailed) {
          clearPollTimer();
          return;
        }

        clearPollTimer();
        pollTimerRef.current = window.setTimeout(() => {
          void pollJobStatus(jobId, sessionId);
        }, POLLING_INTERVAL_MS);
      } catch (caughtError) {
        if (!isModalOpenRef.current || activeSessionRef.current !== sessionId) {
          return;
        }

        const fallbackError =
          caughtError instanceof AnalysisApiError
            ? mapAnalysisError({
                code: caughtError.code,
                message: caughtError.message,
                retryAfterSeconds: caughtError.retryAfterSeconds,
              })
            : mapAnalysisError({ code: "ANALYSIS_TIMEOUT" });

        setError(fallbackError);
        setStatus("error");
        clearPollTimer();
      }
    },
    [applyStatusData, clearPollTimer],
  );

  const startAnalysis = useCallback(
    async (card: SearchResultCard, forceRefresh: boolean) => {
      stopPolling();
      setSelectedVideoId(card.videoId);
      setIsModalOpen(true);
      setStatus("loading");
      setResult(null);
      setError(null);
      setLoadingState({ message: "분석을 준비 중입니다." });

      const sessionId = activeSessionRef.current;

      try {
        const created = await createAnalysisJob({
          videoId: card.videoId,
          forceRefresh,
        });

        if (activeSessionRef.current !== sessionId) {
          return;
        }

        applyStatusData(created);

        const needsPolling = created.status === "queued" || created.status === "processing";
        if (needsPolling) {
          clearPollTimer();
          pollTimerRef.current = window.setTimeout(() => {
            void pollJobStatus(created.jobId, sessionId);
          }, POLLING_INTERVAL_MS);
        }
      } catch (caughtError) {
        const mappedError =
          caughtError instanceof AnalysisApiError
            ? mapAnalysisError({
                code: caughtError.code,
                message: caughtError.message,
                retryAfterSeconds: caughtError.retryAfterSeconds,
              })
            : mapAnalysisError({ code: "ANALYSIS_TIMEOUT" });

        setError(mappedError);
        setStatus("error");
      }
    },
    [applyStatusData, clearPollTimer, pollJobStatus, stopPolling],
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const openAnalysisModal = (card: SearchResultCard) => {
    if (isModalOpen && status === "loading") {
      return;
    }

    void startAnalysis(card, false);
  };

  const closeModal = () => {
    stopPolling();
    setIsModalOpen(false);
  };

  const retryAnalysis = () => {
    if (!selectedCard) {
      setError(analysisErrorMock);
      setStatus("error");
      return;
    }

    void startAnalysis(selectedCard, true);
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const isAnalyzeButtonDisabled = isModalOpen && status === "loading";

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>유튜브 소재 채굴기</h1>
        <p className="app-subtitle">검색 결과에서 바로 AI 소재 분석을 실행할 수 있습니다.</p>
      </header>

      <section className="search-section" aria-label="검색 결과">
        <div className="search-meta-row">
          <p className="search-keyword-label">
            현재 검색어: <strong>{searchKeyword}</strong>
          </p>
        </div>

        <div className="card-grid">
          {SEARCH_RESULT_CARDS.map((card) => (
            <article key={card.videoId} className="result-card">
              <p className="result-card-channel">채널: {card.channelName}</p>
              <h2 className="result-card-title">{card.title}</h2>
              <p className="result-card-video-id">videoId: {card.videoId}</p>

              <button
                type="button"
                className="analyze-button"
                disabled={isAnalyzeButtonDisabled}
                onClick={() => openAnalysisModal(card)}
              >
                AI 소재 분석
              </button>
            </article>
          ))}
        </div>
      </section>

      {isModalOpen ? (
        <AnalysisModal
          status={status}
          result={status === "success" ? result : null}
          error={status === "error" ? error ?? analysisErrorMock : null}
          loadingState={status === "loading" ? loadingState : undefined}
          isActionDisabled={status === "loading"}
          onClose={closeModal}
          onRetry={retryAnalysis}
          onKeywordClick={handleKeywordClick}
        />
      ) : null}
    </main>
  );
}