## 2026-03-13 (DOC-BATCH: YouTube API v3 + Render 연동 정책 확정)
### 오늘 목표
- 문서 배치 작업으로 YouTube API v3 백엔드 경유 정책, 검색 API 에러 계약, 보안 가드레일을 확정

### 진행 내용 (완료)
- [x] `docs/01_manuals/backend.md`에 Render 백엔드 경유 원칙, `YOUTUBE_API_KEY` 환경변수 규칙, timeout/dedupe/캐시 정책 추가
- [x] `docs/01_manuals/api-contracts.md`에 `GET /api/search/videos` 계약 및 `SEARCH_QUOTA_EXCEEDED`/`SEARCH_RATE_LIMITED`/`SEARCH_UPSTREAM_*` 에러 매핑 추가
- [x] `docs/01_manuals/security.md`에 Render 키관리 규칙(프론트 키 노출 금지), 운영 체크, 검색 dedupe/자동 재조회 제한 원칙 보강
- [x] `docs/00_project/CHECKLIST.md` Blocked 항목(유튜브 수집 전략)을 정책 확정 상태로 업데이트

### 진행 내용 (미완료)
- [ ] popstate(브라우저 뒤로가기/앞으로가기) 시 검색 결과 자동 재조회 동기화

### 변경/생성 파일
- `docs/01_manuals/backend.md`
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/security.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. FE-4 범위: popstate 시 URL 상태(`q/channel/view`) 복구 + 조건부 검색 재조회 동기화

### 메모
- YouTube API 키를 서버 환경변수로만 관리해 프론트 노출 리스크를 차단했다.
- 검색/분석 모두 dedupe + 캐시 우선 + 명시적 트리거 정책을 유지해 불필요 네트워크 호출 및 추후 Firestore read 소모 증가 위험을 낮췄다.

---

## 2026-03-12 (FE-2 URL 쿼리 동기화 + 공유/초기화 정합화)
### 오늘 목표
- FRONTEND_UI_MVP_V2의 FE-2 범위에서 `q/channel/view` URL 동기화와 초기 복구, 공유 URL 액션을 연결

### 진행 내용 (완료)
- [x] `frontend/src/domains/search/hooks/useSearchQueryState.ts` 생성 (`q`, `channel`, `view` 파싱/직렬화 + `replaceState` 반영)
- [x] `frontend/src/App.tsx`에서 query/view 상태를 훅으로 이관하고 마운트 시 URL 기준 검색 복구
- [x] `frontend/src/domains/search/components/ResultSummaryBar.tsx`에 `필터 초기화`, `URL 복사` 액션 추가
- [x] `frontend/src/styles.css`에 요약 바 액션/복사 메시지 스타일 추가
- [x] `docs/00_project/CHECKLIST.md`, `docs/00_project/CHANGELOG_WORKING.md` 업데이트

### 진행 내용 (미완료)
- [ ] popstate(브라우저 뒤로가기/앞으로가기) 시 결과 목록 자동 재조회 동기화
- [ ] 검색 API 클라이언트/훅(`useVideoSearch`) 연결

### 변경/생성 파일
- `frontend/src/domains/search/hooks/useSearchQueryState.ts`
- `frontend/src/App.tsx`
- `frontend/src/domains/search/components/ResultSummaryBar.tsx`
- `frontend/src/styles.css`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `useVideoSearch` + `search/api/client.ts` 최소 연결로 버튼 트리거 검색을 실제 API 기반으로 전환
2. popstate 시점에 검색 결과 상태까지 동기화하는 경량 보강(범위 제한)

### 메모
- 현재는 로컬 데이터 필터 기반이라 Firestore read는 0회다.
- URL 동기화는 브라우저 history 조작만 수행하므로 read를 유발하지 않는다.
- 검색은 여전히 버튼 트리거 방식이라 추후 Firestore 연동 시 자동 재조회로 인한 read 급증 위험을 낮춘다.

---

## 2026-03-12 (FE-1 탐색 화면 뼈대 완성: 필터/보기전환)
### 오늘 목표
- FRONTEND_UI_MVP_V2의 FE-1 범위 내에서 FilterToolbar + Grid/List 토글 + 결과 상태 렌더를 실제 화면에 연결

### 진행 내용 (완료)
- [x] `frontend/src/domains/search/components/FilterToolbar.tsx` 생성 (필터 UI + 변경 이벤트 emit)
- [x] `frontend/src/domains/search/components/ViewModeToggle.tsx` 생성 (grid/list 전환)
- [x] `frontend/src/domains/search/types.ts` 확장 (`SearchFilterState`, `SearchViewMode`)
- [x] `frontend/src/App.tsx`에 검색영역-필터-결과상태 연결 및 기존 analysis 모달 폴링/에러 흐름 유지
- [x] `frontend/src/domains/search/components/VideoGrid.tsx`에 view mode 반영 (`card-grid`/`card-list`)
- [x] `frontend/src/styles.css` 다크 테마/필터 툴바/보기 모드 스타일 최소 보강
- [x] `docs/00_project/CHECKLIST.md`, `docs/00_project/CHANGELOG_WORKING.md`, `docs/00_project/FRONTEND_UI_MVP_V2.md` 업데이트

### 진행 내용 (미완료)
- [ ] URL query 동기화(`q`, `channel`, `view`) 연결
- [ ] 검색 API 클라이언트/훅(`useVideoSearch`) 연결
- [ ] `VideoCard` 정보 밀도(썸네일/배지/VPH) 보강

### 변경/생성 파일
- `frontend/src/domains/search/components/FilterToolbar.tsx`
- `frontend/src/domains/search/components/ViewModeToggle.tsx`
- `frontend/src/domains/search/types.ts`
- `frontend/src/domains/search/components/VideoGrid.tsx`
- `frontend/src/App.tsx`
- `frontend/src/styles.css`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`
- `docs/00_project/FRONTEND_UI_MVP_V2.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `useSearchQueryState` 훅을 추가해 `q`, `channel`, `view` URL 동기화
2. 검색 API 클라이언트/훅을 붙이고 로컬 필터를 실제 API 호출로 교체

### 메모
- 현재 구현은 Firestore 미연동 상태라 read는 0회다.
- 검색은 버튼 트리거 + 300ms 지연 처리로 즉시 연타 호출을 줄였고, 분석 폴링은 종료 조건에서 즉시 중단해 추후 Firestore 연동 시 read 폭증 위험을 낮췄다.

---

## 2026-03-12 (MVP-A 탐색 화면 기초 골격 분리)
### 오늘 목표
- FRONTEND_UI_MVP_V2 기준으로 search 도메인 타입/컴포넌트 분리와 App 조립을 완료하고, 분석 모달 기존 흐름을 유지

### 진행 내용 (완료)
- [x] `frontend/src/domains/search/types.ts` 생성 (검색 질의/결과 카드/결과 상태 타입)
- [x] `frontend/src/domains/search/components/KeywordSearchBar.tsx` 생성
- [x] `frontend/src/domains/search/components/ChannelSearchBar.tsx` 생성
- [x] `frontend/src/domains/search/components/ResultSummaryBar.tsx` 생성
- [x] `frontend/src/domains/search/components/VideoCard.tsx` 생성
- [x] `frontend/src/domains/search/components/VideoGrid.tsx` 생성 (loading/empty/error placeholder 분기)
- [x] `frontend/src/App.tsx`를 search 컴포넌트 조합 구조로 개편하고 analysis 모달 API 폴링/중단/재시도 흐름 유지
- [x] `frontend/src/styles.css`에 search 패널/요약바/placeholder 스타일 추가
- [x] `docs/00_project/CHECKLIST.md`, `docs/00_project/CHANGELOG_WORKING.md` 업데이트

### 진행 내용 (미완료)
- [ ] URL query 동기화(`q`, `channel`) 연결
- [ ] 키워드 칩 클릭 시 실제 검색 API 재호출 연결

### 변경/생성 파일
- `frontend/src/domains/search/types.ts`
- `frontend/src/domains/search/components/KeywordSearchBar.tsx`
- `frontend/src/domains/search/components/ChannelSearchBar.tsx`
- `frontend/src/domains/search/components/ResultSummaryBar.tsx`
- `frontend/src/domains/search/components/VideoCard.tsx`
- `frontend/src/domains/search/components/VideoGrid.tsx`
- `frontend/src/App.tsx`
- `frontend/src/styles.css`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. search 상태를 URL query(`q`, `channel`)와 동기화해 화면 공유/복구 가능 상태로 전환
2. 키워드 칩 클릭 → search API 재호출(현재는 로컬 필터)로 연결

### 메모
- 현재 구현은 Firestore 미사용(in-memory local filter + backend API)으로 read는 0회다.
- 검색을 입력 즉시 자동호출하지 않고 버튼 트리거 기반으로 유지해, Firestore 연동 시 불필요 read 급증을 방지할 수 있다.
- analysis 모달 폴링은 기존처럼 `queued/processing`에서만 동작하고 종료 조건에서 즉시 중단되어 상태 조회 read 절감에 유리하다.

---

## 2026-03-11 (analysis 프론트 API 연결 + 폴링/중단 + Retry-After 안내)
### 오늘 목표
- analysis 모달을 실제 API(`POST /api/analysis/jobs`, `GET /api/analysis/jobs/{jobId}`)와 연결하고, 폴링/중단/에러 안내를 계약대로 반영

### 진행 내용 (완료)
- [x] `frontend/src/domains/analysis/api/client.ts` 생성 (create/status 호출 + `Retry-After` 파싱)
- [x] `frontend/src/domains/analysis/utils/errorMapper.ts` 생성 (에러코드별 사용자 메시지/재시도 가능 여부 매핑)
- [x] `frontend/src/domains/analysis/utils/loadingFallback.ts` 생성 (`progress/step/message` 누락 fallback 처리)
- [x] `frontend/src/App.tsx`를 mock 타이머 방식에서 API 기반 상태 전환 + 폴링(1.2초) + 중단 조건(완료/실패/모달 닫힘)으로 전환
- [x] `frontend/src/domains/analysis/components/AnalysisLoadingView.tsx`에 진행 메시지/단계/진행률 표시 연결
- [x] `frontend/src/domains/analysis/components/AnalysisModal.tsx`, `types.ts`에 로딩 상태 전달 타입 확장 반영
- [x] `docs/00_project/CHECKLIST.md`, `docs/00_project/CHANGELOG_WORKING.md` 업데이트

### 진행 내용 (미완료)
- [ ] 키워드 칩 클릭 시 실제 검색 API 재호출 연결

### 변경/생성 파일
- `frontend/src/App.tsx`
- `frontend/src/domains/analysis/types.ts`
- `frontend/src/domains/analysis/api/client.ts`
- `frontend/src/domains/analysis/utils/errorMapper.ts`
- `frontend/src/domains/analysis/utils/loadingFallback.ts`
- `frontend/src/domains/analysis/components/AnalysisModal.tsx`
- `frontend/src/domains/analysis/components/AnalysisLoadingView.tsx`
- `frontend/src/vite-env.d.ts`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 분석 모달 에러코드별 토스트/인라인 분기 UI를 계약표와 1:1로 정교화
2. 키워드 칩 클릭 시 검색 API 재호출과 검색 결과 갱신 연결

### 메모
- 현재 구현은 Firestore 미사용(in-memory API)으로 read는 0회다.
- 폴링은 `queued/processing`에서만 동작하고 완료/실패/모달 닫힘에서 즉시 중단되어, Firestore 연동 시 불필요한 상태 조회 read를 줄일 수 있다.
- 로딩 중 버튼 비활성화 + forceRefresh 재시도 분리로 중복 요청에 의한 read 증가를 완화한다.

---

## 2026-03-10 (analysis dedupe + 공통 로깅 필드 표준화)
### 오늘 목표
- 동일 `videoId+analysisVersion` 요청의 진행 중 job 재사용(dedupe)과 공통 로깅 필드 표준화를 반영

### 진행 내용 (완료)
- [x] `backend/app/domains/analysis/repository.py`에 inflight 인덱스/원자적 mark/clear 로직 추가
- [x] `backend/app/domains/analysis/router.py`에서 `forceRefresh=false` dedupe 재사용 분기 반영
- [x] `backend/app/domains/analysis/telemetry.py` 생성 및 공통 로그 필드(`requestId/jobId/videoId/errorCode/retryAfter/cacheHit`) 적용
- [x] rate-limited `Retry-After` 헤더 계약 유지
- [x] `backend/tests/test_analysis_api.py`에 dedupe 재사용/forceRefresh 우회 검증 추가
- [x] `docs/01_manuals/backend.md`, `docs/01_manuals/api-contracts.md` 문구 동기화

### 진행 내용 (미완료)
- [ ] 실제 비동기 큐 환경(멀티 프로세스/멀티 인스턴스)에서의 분산 dedupe

### 변경/생성 파일
- `backend/app/domains/analysis/repository.py`
- `backend/app/domains/analysis/router.py`
- `backend/app/domains/analysis/service.py`
- `backend/app/domains/analysis/telemetry.py`
- `backend/tests/test_analysis_api.py`
- `docs/01_manuals/backend.md`
- `docs/01_manuals/api-contracts.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 프론트 분석 모달의 실제 API 어댑터 연결 (`POST /api/analysis/jobs` 상태 매핑)
2. dedupe 정책을 GET status polling 흐름까지 확장 검토

### 메모
- 현재 구현은 Firestore 미사용(in-memory)으로 read는 0회다.
- dedupe + cache 우선 흐름으로 동일 요청의 중복 분석/중복 조회를 줄여, Firestore 연동 시 read 소모 증가를 완화할 수 있다.

---

## 2026-02-23 (검색 카드 + 분석 모달 트리거 + 키워드 칩 분리)
### 오늘 목표
- 검색 결과 카드(초안)에서 분석 모달을 실사용 흐름으로 열고, 추천 키워드 클릭까지 최소 연결한다.

### 진행 내용 (완료)
- [x] `frontend/src/App.tsx`를 검색 카드 중심 구조로 개편하고 카드별 "AI 소재 분석" 버튼 연결
- [x] 로딩 상태에서 분석 버튼/모달 액션 비활성화로 중복 클릭 방지
- [x] `frontend/src/domains/analysis/components/AnalysisKeywordChips.tsx` 생성 및 success 화면 분리 적용
- [x] 추천 키워드 클릭 시 현재 검색어를 갱신하는 임시 핸들러 연결
- [x] `docs/00_project/CHECKLIST.md` E 섹션 완료 반영

### 진행 내용 (미완료)
- [ ] 실제 API 호출 기반 분석 요청/응답 매핑 연결
- [ ] 키워드 클릭 시 실제 검색 API 재호출 연결

### 변경/생성 파일
- `frontend/src/App.tsx`
- `frontend/src/domains/analysis/components/AnalysisModal.tsx`
- `frontend/src/domains/analysis/components/AnalysisSuccessView.tsx`
- `frontend/src/domains/analysis/components/AnalysisKeywordChips.tsx`
- `frontend/src/domains/analysis/types.ts`
- `frontend/src/styles.css`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `POST /api/analysis/jobs` 응답을 모달 상태(`loading/success/error`)로 매핑하는 프론트 API 어댑터 추가
2. `ANALYSIS_RATE_LIMITED` + `Retry-After` 안내 문구를 모달 에러 상태에 반영

### 메모
- 이번 작업은 mock 상태 전환만 사용하므로 Firestore read는 0회다.
- 로딩 중 중복 클릭을 UI 단에서 차단해, 추후 Firestore 연동 시 동일 요청 재발행으로 인한 불필요 read 증가를 예방한다.

---

## 2026-03-09 (analysis 프론트 기초 연결: 타입/mock/모달 3상태)
### 오늘 목표
- analysis 도메인의 프론트 최소 골격을 생성해 loading/success/error 상태 분기를 mock 데이터로 확인 가능한 상태로 만든다.

### 진행 내용 (완료)
- [x] `frontend/src/domains/analysis/types.ts` 생성 (API 계약 기반 타입)
- [x] `frontend/src/domains/analysis/mocks/analysisResult.mock.ts` 생성 (샘플 JSON 반영)
- [x] `AnalysisModal/AnalysisLoadingView/AnalysisSuccessView/AnalysisErrorView` 컴포넌트 생성
- [x] success 화면에서 `summary/contentIdeas/recommendedKeywords/meta` 렌더링 구현
- [x] loading 상태에서 액션 버튼 disabled 처리
- [x] null/빈 배열 안전 처리(결과 누락 시 error fallback, 아이디어/키워드 empty 안내)
- [x] `docs/00_project/CHECKLIST.md` E 섹션 일부 완료 반영

### 진행 내용 (미완료)
- [ ] 프론트 앱 엔트리 구성 및 실제 화면 라우팅 연결
- [ ] 검색 카드 UI + 분석 모달 트리거 연결
- [ ] 키워드 칩 클릭의 재검색 동작 연결

### 변경/생성 파일
- `frontend/src/domains/analysis/types.ts`
- `frontend/src/domains/analysis/mocks/analysisResult.mock.ts`
- `frontend/src/domains/analysis/components/AnalysisModal.tsx`
- `frontend/src/domains/analysis/components/AnalysisLoadingView.tsx`
- `frontend/src/domains/analysis/components/AnalysisSuccessView.tsx`
- `frontend/src/domains/analysis/components/AnalysisErrorView.tsx`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 검색 카드 목록 UI를 만들고 "AI 소재 분석" 버튼 클릭 시 `AnalysisModal`을 열도록 연결
2. 추천 키워드 칩 전용 컴포넌트를 분리해 클릭 이벤트(임시 핸들러) 연결

### 메모
- 현재 작업은 프론트 mock 렌더링만 포함하며 Firestore를 직접 읽지 않는다.
- 추후 Firestore 연동 시에는 `jobId/videoId` 단위 캐시 결과를 우선 사용해 동일 모달 재오픈마다 재조회(read)하지 않도록 해야 한다.
- 폴링 도입 시에도 지수 백오프/중단 조건을 넣어 불필요한 반복 read 소모를 제한해야 한다.

---

## 2026-03-08 (Gemini SDK 예외 매핑 연결 + Retry-After 계약 반영)
### 오늘 목표
- 외부 SDK 예외를 도메인 예외로 연결하고, rate-limited 응답의 Retry-After 계약을 코드/문서/테스트로 동기화

### 진행 내용 (완료)
- [x] `backend/app/domains/analysis/client.py`에 Gemini SDK 어댑터 추가 (SDK 예외 → timeout/upstream/rate-limited 도메인 예외 변환)
- [x] SDK 미가용 시 기존 suffix 기반 시뮬레이션으로 폴백하도록 유지
- [x] `backend/app/domains/analysis/service.py`에 `AnalysisProcessingError.retry_after_seconds` 필드 추가
- [x] rate-limited 최종 실패 시 `retry_after_seconds=3` 설정
- [x] `backend/app/domains/analysis/router.py`에서 `ANALYSIS_RATE_LIMITED` 발생 시 `Retry-After` 헤더 반환
- [x] `backend/tests/test_analysis_api.py`에 `Retry-After=3` 헤더 검증 추가
- [x] `docs/01_manuals/api-contracts.md`에 `Retry-After` 초 단위 계약 정책 명시
- [x] `docs/00_project/CHECKLIST.md` 완료 로그 업데이트

### 진행 내용 (미완료)
- [ ] 실제 Gemini 응답 텍스트가 비JSON일 때 프롬프트/응답 포맷 강제 전략 고도화

### 변경/생성 파일
- `backend/app/domains/analysis/client.py`
- `backend/app/domains/analysis/service.py`
- `backend/app/domains/analysis/router.py`
- `backend/tests/test_analysis_api.py`
- `docs/01_manuals/api-contracts.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. rate-limited/timeout 시 공통 로깅 필드(requestId, jobId, retryAfter) 표준화
2. 동일 `videoId` 처리 중 dedupe(진행 중 job 재사용) 최소 구현

### 메모
- Firestore 도입 시에도 rate-limited 응답에 명시된 재시도 시각을 따르게 하면 짧은 간격 재호출/재조회(read) 루프를 줄여 읽기 소모를 완화할 수 있다.

---

# CHANGELOG_WORKING.md

## 2026-03-07 (외부 AI 호출 래퍼 도입 + 예외 매핑 확장)
### 오늘 목표
- 시뮬레이션 기반 예외 분기를 외부 호출 래퍼 + 서비스 매핑 구조로 치환하고 `ANALYSIS_RATE_LIMITED`까지 계약 테스트를 확장

### 진행 내용 (완료)
- [x] `backend/app/domains/analysis/client.py` 생성 (외부 호출 얇은 인터페이스 + 예외 타입 정의)
- [x] `backend/app/domains/analysis/service.py`에서 timeout/upstream/rate-limited를 계약 코드로 매핑
- [x] rate-limited 최소 백오프 재시도(1회) 후 실패 시 `ANALYSIS_RATE_LIMITED` 반환
- [x] `backend/app/domains/analysis/router.py`에서 캐시 선조회 후 외부 호출하도록 순서 조정
- [x] `backend/tests/test_analysis_api.py`에 rate-limited 실패 케이스 추가(총 5케이스)
- [x] `docs/00_project/CHECKLIST.md` 완료 로그 업데이트

### 진행 내용 (미완료)
- [ ] 실제 Gemini/외부 SDK 예외 타입을 현재 매핑 구조에 직접 연결

### 변경/생성 파일
- `backend/app/domains/analysis/client.py`
- `backend/app/domains/analysis/service.py`
- `backend/app/domains/analysis/router.py`
- `backend/tests/test_analysis_api.py`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 외부 SDK(Gemini) 연동 시 timeout/rate-limit/upstream 예외를 `client.py` 예외 타입으로 변환
2. rate-limited 응답의 `Retry-After` 헤더 활용 여부를 계약 문서에 반영할지 결정

### 메모
- 캐시 hit를 먼저 확인한 뒤 외부 호출하도록 순서를 고정해 불필요한 외부 호출/재시도를 줄였다.
- Firestore 도입 시에도 동일 순서를 유지하면 중복 조회(read) 및 재저장 트래픽을 완화할 수 있다.

---

## 2026-03-06 (analysis timeout/upstream 예외 매핑 + 최소 계약 테스트)
### 오늘 목표
- `ANALYSIS_TIMEOUT`, `ANALYSIS_UPSTREAM_UNAVAILABLE` 예외를 API 계약 코드로 고정 매핑하고 최소 API 계약 테스트를 추가

### 진행 내용 (완료)
- [x] `backend/app/domains/analysis/service.py`에 `AnalysisProcessingError` + 시뮬레이션 분기(`_timeout`, `_upstream_unavailable`) 추가
- [x] `backend/app/domains/analysis/router.py`에서 처리 예외를 공통 에러 응답으로 매핑 (`HTTP 503` + 계약 메시지)
- [x] `backend/tests/test_analysis_api.py` 생성 (정상/캐시 hit/timeout/upstream 실패 4케이스)
- [x] `docs/00_project/CHECKLIST.md` F 섹션(에러 처리/타임아웃 처리) 완료 처리

### 진행 내용 (미완료)
- [ ] 실제 외부 API 연동 레이어에서 timeout/upstream 예외를 동일 코드로 연결

### 변경/생성 파일
- `backend/app/domains/analysis/service.py`
- `backend/app/domains/analysis/router.py`
- `backend/tests/test_analysis_api.py`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 시뮬레이션 기반 예외 분기를 실제 외부 API 호출 레이어 예외 매핑으로 치환
2. `ANALYSIS_RATE_LIMITED` 매핑 분기와 재시도 정책(백오프)을 최소 구현

### 메모
- Firestore 도입 시에도 캐시 우선(`forceRefresh=false`) + 실패 즉시 종료 분기로 불필요한 재조회(read) 루프를 줄이는 구조를 유지해야 함.

---

## 2026-03-05 (analysis 저장/캐시 최소 동작 연결)
### 오늘 목표
- analysis 결과 저장 구조(in-memory)와 캐시 재사용(`cacheHit`) 분기를 연결해 F 섹션 미완료 항목을 축소

### 진행 내용 (완료)
- [x] `backend/app/domains/analysis/repository.py` 생성 (in-memory job 상태 + 결과 캐시 저장소)
- [x] 캐시 키 규칙 `analysis:{videoId}:{analysisVersion}` 구현 및 TTL(24시간) 적용
- [x] `POST /api/analysis/jobs`에 캐시 hit/miss + `forceRefresh` 분기 연결
- [x] cache hit 시 `status=completed` + `meta.cacheHit=true`, miss/강제갱신 시 `meta.cacheHit=false` 반영
- [x] `GET /api/analysis/jobs/{jobId}`를 저장소 기반 조회로 전환
- [x] `docs/00_project/CHECKLIST.md` F 섹션(결과 저장 구조) 완료 처리

### 진행 내용 (미완료)
- [ ] 백엔드 timeout/외부 API 예외 처리 추가

### 변경/생성 파일
- `backend/app/domains/analysis/repository.py`
- `backend/app/domains/analysis/router.py`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 백엔드 timeout/외부 API 예외를 문서 코드(`ANALYSIS_TIMEOUT`, `ANALYSIS_UPSTREAM_UNAVAILABLE`)로 매핑
2. FastAPI/Pydantic 환경을 맞춘 뒤 API 통합 테스트로 cache hit/miss 응답 검증

### 메모
- 현재 실행 환경에 FastAPI/Pydantic 패키지가 없어 통합 호출 테스트는 제한되었고, 문법 컴파일 중심으로 검증함.

---

## 목적
이 문서는 세션 단위 작업 로그입니다.
- 무엇을 완료했는지
- 무엇이 미완료인지
- 다음 세션에서 무엇부터 시작해야 하는지
를 빠르게 복구하기 위해 사용합니다.

---

## 2026-02-23 (백엔드 분석 검증 파이프라인 최소 구현)
### 오늘 목표
- D-5 정책(검증→보정→재검증)을 코드에 반영해 `failed` vs `completed(+warnings)` 분기를 실행 가능 상태로 전환

### 진행 내용 (완료)
- [x] `backend/app/domains/analysis/validator.py` 생성 (필수 필드 1차 검증 + 허용 필드 보정 + 2차 스키마 검증)
- [x] `backend/app/domains/analysis/service.py` 생성 (`ANALYSIS_OUTPUT_INVALID` 실패 분기 / `completed` 결과 분기)
- [x] `backend/app/domains/analysis/router.py` 연동 (기존 스텁 흐름에 서비스 적용)
- [x] `docs/00_project/CHECKLIST.md` F 섹션(검증 로직) 완료 처리

### 진행 내용 (미완료)
- [ ] 백엔드 timeout/외부 API 예외 처리 추가
- [ ] 결과 저장 구조(파일 mock/DB) 추가

### 변경/생성 파일
- `backend/app/domains/analysis/validator.py`
- `backend/app/domains/analysis/service.py`
- `backend/app/domains/analysis/router.py`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 백엔드 에러 처리/timeout 정책을 코드에 반영해 F 섹션 항목 추가 완료
2. 캐시/저장 구조(파일 mock 또는 DB)를 붙여 `cacheHit` 동작을 실제 분기로 확장

### 메모
- FastAPI/Pydantic 패키지 미설치 환경으로 API 통합 실행 검증은 제한되어, 파이썬 문법 컴파일 중심으로 검증함.

---

## 2026-03-03 (D-5 출력 검증/보정 정책 확정)
### 오늘 목표
- D-5(출력 검증/보정) 2단계 정책을 완료해 `failed` vs `partial-success` 분기와 저장 전 검증 순서를 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/ai-analysis.md`에 누락 허용 필드/기본값 적용 표 추가
- [x] `failed` vs `partial-success` 분기 기준과 저장 전 처리 체크리스트(스키마→보정→재검증→저장) 고정
- [x] `docs/01_manuals/api-contracts.md`에 D-5 상태 매핑 보강 규칙 및 `failed` 고정 조건 추가
- [x] `docs/01_manuals/backend.md`에 D-5 파이프라인/로그 필수 필드/프론트 정합성 규칙 동기화
- [x] `docs/00_project/CHECKLIST.md` D-5 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] 프론트 MVP 구현(E 섹션)
- [ ] 백엔드 MVP 구현(F 섹션)

### 변경/생성 파일
- `docs/01_manuals/ai-analysis.md`
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/backend.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. 백엔드 MVP 최소 골격 생성(`main.py`, analysis router/schemas)으로 API 계약을 실행 가능한 상태로 전환
2. 프론트 작업 전 백엔드 스텁 응답(`create/status`) 기준으로 상태 매핑 검증

### 메모
- 이번 세션은 단일 작업 원칙에 따라 D-5 문서 정책 확정만 수행했고, 코드 구현은 하지 않음.

---

## 2026-03-02 (D-4 캐시 키 전략 정책 확정)
### 오늘 목표
- D-4(캐시 키 전략) 2단계 정책을 완료해 캐시 키/TTL/cacheHit 기준을 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/data.md`에 캐시 키 포맷(`analysis:{videoId}:{analysisVersion}`) 단일안 고정
- [x] TTL 기본값(24시간) 및 `forceRefresh` 예외 허용 조건 문서화
- [x] `docs/01_manuals/api-contracts.md`에 `meta.cacheHit` 표기 조건/로그 필드 기준 추가
- [x] `docs/01_manuals/backend.md`에 캐시/중복 방지 규칙 및 로깅 기준 동기화
- [x] `docs/00_project/CHECKLIST.md` D-4 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/data.md`
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/backend.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-5(AI 출력 검증/보정) 2단계 정책 확정
2. D-4~D-5 완료 기준으로 프론트/백엔드 구현 착수 순서 1개 확정

### 메모
- 이번 세션은 단일 작업 원칙에 따라 D-4 문서 정책 확정만 수행했고, 코드 구현은 하지 않음.

---

## 기록 규칙
- 하루/세션 단위로 기록
- 완료/미완료/막힘/다음 시작점 중심으로 간단히 작성
- 관련 파일 경로를 함께 남기기

---

## 2026-03-01 (D-3 에러 코드/메시지 정책 확정)
### 오늘 목표
- D-3(에러 코드/메시지) 2단계 정책을 완료해 프론트/백엔드 구현 기준 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/api-contracts.md`에 MVP 필수 에러코드 6종 고정
- [x] 코드별 사용자 메시지/재시도 가능 여부 1:1 매핑 표 추가
- [x] 코드군별 프론트 분기 기준(토스트/인라인/재시도 버튼) 고정
- [x] `docs/01_manuals/frontend.md`에 에러 코드군별 UI 처리 기준 동기화
- [x] `docs/01_manuals/backend.md`에 사용자 메시지/내부 로그 분리 원칙 및 코드별 로그 예시 추가
- [x] `docs/00_project/CHECKLIST.md` D-3 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-4(캐시 키 전략) 2단계 정책 확정
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/frontend.md`
- `docs/01_manuals/backend.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-4(캐시 키 전략) 2단계 정책 확정
2. D-5(AI 출력 검증/보정) 2단계 정책 확정
3. 프론트 구현 착수 전 D-3~D-5 표준 문구/분기 규칙 최종 교차검증

### 메모
- 이번 세션은 단일 작업 원칙에 따라 D-3 정책 확정만 수행했고, 실제 프론트/백엔드 코드는 변경하지 않음.

---

## 2026-02-28 (D-2 모달 상태 정책 확정 + 계약 정합화 + 구현 체크리스트 고정)
### 오늘 목표
- D-2의 2/3/4단계를 한 세션에서 완료하고, 프론트 구현 착수 가능한 기준 문서를 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/frontend.md`에 상태별 최소 UI 요소 표(`loading/success/error/empty/partial-success`) 확정
- [x] 로딩 중 중복 클릭 방지(disabled) 규칙 및 상태별 사용자 문구 정책 고정
- [x] `docs/01_manuals/api-contracts.md`에 API 응답→프론트 상태 매핑 규칙 고정
- [x] `progress/step/message` 누락 fallback 처리 규칙 문서화
- [x] 구현 착수 체크리스트(작업순서) + 최소 QA 시나리오(정상/실패/빈데이터/부분성공) 반영
- [x] `docs/00_project/CHECKLIST.md` D-2 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-3(에러 코드/메시지) 2단계 정책 확정
- [ ] D-4(캐시 키 전략) 2단계 정책 확정
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/frontend.md`
- `docs/01_manuals/api-contracts.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-3(에러 코드/메시지) 2단계 정책 확정
2. D-4(캐시 키 전략) 2단계 정책 확정
3. D-5(AI 출력 검증/보정) 2단계 정책 확정

### 메모
- 이번 세션은 문서 정책 확정 작업만 수행했고, React/FastAPI 코드 구현은 의도적으로 수행하지 않음.

---

## 2026-02-27 (D-1 분석 Job API 정책 확정)
### 오늘 목표
- D-1(분석 Job API `create/status`) 2단계 정책 확정 및 문서 기준 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/api-contracts.md`에 D-1 고정 정책 섹션 추가
- [x] `POST /api/analysis/jobs`, `GET /api/analysis/jobs/{jobId}` 요청/응답 필드 필수·선택 표 추가
- [x] `forceRefresh` 기본값/캐시 무시 조건/허용 조건 정책 문장 고정
- [x] `progress/step/message` 누락 시 프론트 처리 규칙 명시
- [x] `docs/00_project/CHECKLIST.md` D-1 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-2(모달 상태) 2단계 정책 확정
- [ ] D-3(에러 코드/메시지) 2단계 정책 확정
- [ ] D-4(캐시 키 전략) 2단계 정책 확정
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/api-contracts.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-2(모달 상태) 2단계 정책 확정
2. D-3(에러 코드/메시지) 2단계 정책 확정
3. D-4(캐시 키 전략) 2단계 정책 확정

### 메모
- 이번 세션은 단일 작업 원칙에 따라 D-1 문서 정책 확정만 수행함.

---

## 2026-02-26 (failure-log 템플릿 작성 및 매핑 규칙 반영)
### 오늘 목표
- `docs/04_quality/failure-log.md`를 템플릿으로 작성하고, `api-contracts.md` 에러코드 매핑 규칙을 반영

### 진행 내용 (완료)
- [x] `docs/04_quality/failure-log.md` 생성
- [x] incident 필수 필드 표(incident_id, request_id, job_id, error_code, 원인/조치 등) 정의
- [x] `api-contracts.md` 에러코드(`COMMON_INVALID_REQUEST`, `ANALYSIS_TIMEOUT` 등) 매핑 규칙 추가
- [x] 복붙용 기록 템플릿 + 가상 샘플 1건 추가
- [x] `docs/00_project/CHECKLIST.md` 상태 업데이트(C/H/I)

### 진행 내용 (미완료)
- [ ] D 섹션 2단계(정책 확정) 항목 D-1~D-5 실제 완료 처리
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 변경/생성 파일
- `docs/04_quality/failure-log.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-1(분석 Job API) 2단계 정책 확정
2. D-2(모달 상태) 2단계 정책 확정
3. D-3(에러 코드/메시지) 2단계 정책 확정

### 메모
- 이번 세션은 문서 작업만 수행했으며 코드 구현/수정은 없음.

---

## 2026-02-25 (CHECKLIST D 섹션 재정리)
### 오늘 목표
- `CHECKLIST.md` D 섹션을 구현 착수 가능한 2단계(문서 확인/정책 확정) 단위로 재구성

### 진행 내용 (완료)
- [x] D 섹션 5개 미완료 항목을 `1단계: 문서 존재/연결 확인` + `2단계: 정책 확정` 구조로 분리
- [x] 각 항목에 근거 문서 경로(`api-contracts.md`, `data.md`, `ai-analysis.md`, `security.md` 등) 명시
- [x] 각 `2단계`에 수용 기준 3개 이상을 추가해 1~2시간 단위 작업으로 분해
- [x] H 섹션 다음 세션 후보를 최신 상태 기준으로 정리

### 진행 내용 (미완료)
- [ ] `docs/04_quality/failure-log.md` 생성
- [ ] D 섹션 2단계(정책 확정) 항목 D-1~D-5 실제 완료 처리
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 변경/생성 파일
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `docs/04_quality/failure-log.md` 작성
2. D-1(분석 Job API) 2단계 정책 확정
3. D-2(모달 상태) 2단계 정책 확정

### 메모
- 이번 세션은 계획/문서 정리 전용으로 수행했으며, 코드 구현은 진행하지 않음.

---

## 2026-02-23 (프로젝트 세팅 / 문서 하니스 구축)
### 오늘 목표
- 코딩 전 문서 하니스(매뉴얼/기억/품질검사) 구조 세팅
- AI 분석 기능의 스키마/계약/운영 규칙 문서화

### 진행 내용 (완료)
- [x] `AGENT.md`, `SKILLS.md` 작성
- [x] `docs/00_project/PLAN.md`, `CONTEXT_NOTE.md`, `CHECKLIST.md`, `DECISIONS.md` 작성
- [x] `docs/01_manuals/*` 핵심 매뉴얼 작성
- [x] `docs/03_prompts/output-schema-analysis.json` 작성
- [x] `docs/03_prompts/examples/analysis-output-sample.json` 작성
- [x] `docs/04_quality/done-report-template.md`, `peer-review-template.md` 작성

### 진행 내용 (미완료)
- [ ] `docs/04_quality/test-cases-mvp.md` 생성
- [ ] `docs/04_quality/failure-log.md` 생성
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 새로 생긴 이슈 / 막힘
- 유튜브 데이터 수집 정책(공식 API 사용 범위/제약) 최종 확정 필요
- 댓글 원문 저장 범위(전체 저장/샘플 저장/해시 저장) 정책 확정 필요

### 변경/생성 파일
- `AGENT.md`
- `SKILLS.md`
- `docs/00_project/PLAN.md`
- `docs/00_project/CONTEXT_NOTE.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/DECISIONS.md`
- `docs/00_project/CHANGELOG_WORKING.md`
- `docs/01_manuals/INDEX.md`
- `docs/01_manuals/frontend.md`
- `docs/01_manuals/backend.md`
- `docs/01_manuals/ai-analysis.md`
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/data.md`
- `docs/01_manuals/security.md`
- `docs/01_manuals/qa-checklist.md`
- `docs/03_prompts/output-schema-analysis.json`
- `docs/03_prompts/examples/analysis-output-sample.json`
- `docs/04_quality/done-report-template.md`
- `docs/04_quality/peer-review-template.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `docs/04_quality/test-cases-mvp.md` 작성 (정상/실패/빈데이터/경계값)
2. `docs/04_quality/failure-log.md` 작성 (장애 기록 템플릿)
3. 프론트/백엔드 구현 착수 전, `CHECKLIST.md` D~F 섹션 우선순위 확정

### 메모
- 현재 상태는 "문서 세팅 완료, 개발 코드 미시작"이다.
- CHECKLIST 완료 여부는 문서 생성 완료와 개발 완료를 구분해서 관리해야 혼선이 줄어든다.

---

## 2026-02-22 (문서 정합화)
### 오늘 목표
- CHECKLIST와 CHANGELOG를 실제 파일 상태와 일치시키기

### 진행 내용 (완료)
- [x] `docs/00_project/CHECKLIST.md` 상태를 실제 파일 존재/미존재 기준으로 보정
- [x] `docs/00_project/CHANGELOG_WORKING.md`를 최신 상태 기준으로 재작성

### 진행 내용 (미완료)
- [ ] 품질 문서 2종 (`test-cases-mvp.md`, `failure-log.md`) 작성
- [ ] 코드 구현 작업 시작

### 다음 세션 시작점 (가장 먼저 할 일)
1. 품질 문서 2종 작성
2. 구현 우선순위 확정 후 프론트 또는 백엔드 한 축부터 착수

### 메모
- 개발 시작 전이므로 기능 체크 항목은 대부분 미완료 상태가 정상이다.


## 2026-02-24 (품질 문서 보강 - 테스트 케이스)
### 오늘 목표
- `docs/04_quality/test-cases-mvp.md` 작성 및 계약 정합성 반영

### 진행 내용 (완료)
- [x] `docs/04_quality/test-cases-mvp.md` 생성
- [x] 정상/실패/빈데이터/경계값 4분류 케이스 문서화
- [x] API 계약(`api-contracts.md`)과 스키마(`output-schema-analysis.json`) 필드/에러코드 정합성 반영

### 진행 내용 (미완료)
- [ ] `docs/04_quality/failure-log.md` 생성
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 변경/생성 파일
- `docs/04_quality/test-cases-mvp.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `docs/04_quality/failure-log.md` 작성
2. CHECKLIST D 섹션을 구현 착수 가능한 단위로 재정리

### 메모
- 이번 세션은 단일 작업 원칙에 따라 테스트 케이스 문서 작성만 수행함.

---

## 2026-03-04 (백엔드 MVP 최소 골격 생성)
### 오늘 목표
- FastAPI 앱 진입점 + analysis 도메인 스텁 API(create/status) + 공통 응답 구조를 실행 가능한 최소 상태로 구현

### 진행 내용 (완료)
- [x] `backend/app/main.py` 생성 및 analysis 라우터 연결
- [x] `backend/app/domains/analysis/schemas.py` 생성 (요청/응답/상태 스키마)
- [x] `backend/app/domains/analysis/router.py` 생성 (`POST /api/analysis/jobs`, `GET /api/analysis/jobs/{jobId}` 스텁)
- [x] `backend/app/core/response.py` 생성 (공통 응답 헬퍼: `success`, `data|error`, `meta`)
- [x] `docs/00_project/CHECKLIST.md` F 섹션 일부 완료 처리

### 진행 내용 (미완료)
- [ ] AI 응답 JSON 스키마 검증 로직 추가
- [ ] 외부 API timeout/예외 처리 세부 정책의 코드 반영
- [ ] 결과 저장 구조(파일 mock 또는 DB) 추가

### 변경/생성 파일
- `backend/app/main.py`
- `backend/app/core/response.py`
- `backend/app/domains/analysis/schemas.py`
- `backend/app/domains/analysis/router.py`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. analysis 서비스 계층 초안 추가 후 `ANALYSIS_TIMEOUT`, `ANALYSIS_UPSTREAM_UNAVAILABLE` 등 에러 코드 매핑 구현
2. `GET /api/analysis/jobs/{jobId}`에 `failed` 상태 스텁 분기 추가 및 프론트 에러 상태 매핑 검증

### 메모
- 이번 세션은 단일 작업 원칙에 따라 백엔드 최소 골격만 구현했고, Gemini/DB/캐시 실구현은 범위에 맞춰 제외함.

---

## 2026-03-12 (FE-3 검색 API 최소 연결: client + hook + App 트리거)
### 오늘 목표
- FE-3 범위에서 검색 API 클라이언트/훅을 추가하고, App 검색 흐름을 버튼/Enter 트리거 기반 API 호출로 전환

### 진행 내용 (완료)
- [x] `frontend/src/domains/search/api/client.ts` 추가 (`VITE_API_BASE_URL` + `VITE_SEARCH_API_PATH` 기반 GET 요청/에러 파싱)
- [x] `frontend/src/domains/search/hooks/useVideoSearch.ts` 추가 (`loading/empty/error/success` 상태 관리 + 동일 파라미터 중복 호출 가드)
- [x] `frontend/src/domains/search/types.ts`에 검색 API 요청/응답 타입 및 훅 반환 타입 추가
- [x] `frontend/src/App.tsx`를 `useVideoSearch` 기반으로 전환하고, 검색 버튼/Enter로만 `runSearch` 실행되도록 연결
- [x] 필터/보기모드 변경 시 자동 API 재호출을 하지 않도록 유지(명시적 검색 트리거 정책 유지)
- [x] `docs/00_project/CHECKLIST.md`, `docs/00_project/CHANGELOG_WORKING.md` 업데이트

### 진행 내용 (미완료)
- [ ] popstate(브라우저 뒤로가기/앞으로가기) 시 검색 결과 자동 재조회 동기화

### 변경/생성 파일
- `frontend/src/domains/search/api/client.ts`
- `frontend/src/domains/search/hooks/useVideoSearch.ts`
- `frontend/src/domains/search/types.ts`
- `frontend/src/App.tsx`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. popstate 시점 URL 상태(`q/channel/view`) 복구와 검색 결과 재조회 동기화를 경량 보강

### 메모
- 현재 백엔드 검색 API가 확정 구현되지 않은 환경에서도, 프론트는 명시적 트리거 호출 구조를 유지해 자동 재조회로 인한 Firestore read 급증 위험을 방지하도록 설계했다.
- 동일 파라미터 재검색은 훅 내부 키 비교로 요청을 건너뛰어 추후 Firestore 연동 시 불필요 read 소모를 줄일 수 있다.
