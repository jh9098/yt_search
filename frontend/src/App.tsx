import { useEffect, useMemo, useRef, useState } from "react";
import { AnalysisModal } from "./domains/analysis/components/AnalysisModal";
import {
  analysisErrorMock,
  analysisResultMock,
} from "./domains/analysis/mocks/analysisResult.mock";
import type {
  AnalysisErrorState,
  AnalysisModalStatus,
  AnalysisResult,
} from "./domains/analysis/types";

interface SearchResultCard {
  videoId: string;
  title: string;
  channelName: string;
  simulatedResult: "success" | "error";
}

const SEARCH_RESULT_CARDS: SearchResultCard[] = [
  {
    videoId: "video_family_talk_001",
    title: "가족과 대화가 자꾸 꼬일 때 감정 다루는 법",
    channelName: "마음연구소",
    simulatedResult: "success",
  },
  {
    videoId: "video_conflict_case_002",
    title: "부부 갈등 대화, 왜 반복될까?",
    channelName: "관계코치TV",
    simulatedResult: "error",
  },
];

function createErrorStateFromCode(code: string): AnalysisErrorState {
  if (code === "ANALYSIS_UPSTREAM_UNAVAILABLE") {
    return {
      title: "분석 서비스 지연",
      message: "분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.",
      code,
      canRetry: true,
    };
  }

  return {
    title: "분석 실패",
    message: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    code: "ANALYSIS_TIMEOUT",
    canRetry: true,
  };
}

export function App() {
  const [searchKeyword, setSearchKeyword] = useState("가족 대화법");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<AnalysisModalStatus>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AnalysisErrorState | null>(null);
  const loadingTimerRef = useRef<number | null>(null);

  const selectedCard = useMemo(
    () => SEARCH_RESULT_CARDS.find((card) => card.videoId === selectedVideoId) ?? null,
    [selectedVideoId],
  );

  const clearLoadingTimer = () => {
    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearLoadingTimer();
    };
  }, []);

  const openAnalysisModal = (card: SearchResultCard) => {
    if (isModalOpen && status === "loading") {
      return;
    }

    clearLoadingTimer();
    setSelectedVideoId(card.videoId);
    setStatus("loading");
    setResult(null);
    setError(null);
    setIsModalOpen(true);

    loadingTimerRef.current = window.setTimeout(() => {
      if (card.simulatedResult === "success") {
        setResult(analysisResultMock);
        setStatus("success");
        return;
      }

      setError(createErrorStateFromCode("ANALYSIS_UPSTREAM_UNAVAILABLE"));
      setStatus("error");
    }, 900);
  };

  const closeModal = () => {
    clearLoadingTimer();
    setIsModalOpen(false);
  };

  const retryAnalysis = () => {
    if (!selectedCard) {
      setError(createErrorStateFromCode("ANALYSIS_TIMEOUT"));
      setStatus("error");
      return;
    }

    openAnalysisModal(selectedCard);
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
          isActionDisabled={status === "loading"}
          onClose={closeModal}
          onRetry={retryAnalysis}
          onKeywordClick={handleKeywordClick}
        />
      ) : null}
    </main>
  );
}
