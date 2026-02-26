# CHECKLIST.md

## 사용 규칙
- 작업 시작 전 현재 상태 확인
- 작업 완료 시 즉시 체크 상태 업데이트
- 새로 생긴 할 일은 Backlog에 추가
- 막힌 항목은 Blocked로 이동하고 원인 기록
- 각 항목은 가능한 작게 나눈다 (1~2시간 단위 권장)

---

## 상태 구분
- [ ] Backlog (해야 할 일)
- [~] In Progress (진행 중)
- [x] Done (완료)
- [!] Blocked (막힘)

---

## A. 세팅 / 문서 하니스 (문서 작성은 완료, 개발은 미시작)
- [x] `AGENT.md` 초안 작성
- [x] `SKILLS.md` 초안 작성
- [x] `docs/00_project/PLAN.md` 초안 작성
- [x] `docs/00_project/CONTEXT_NOTE.md` 초안 작성
- [x] `docs/00_project/CHECKLIST.md` 초안 작성
- [x] `docs/00_project/DECISIONS.md` 생성
- [x] `docs/00_project/CHANGELOG_WORKING.md` 생성

---

## B. 매뉴얼 분리 (문서 파일 생성 완료)
- [x] `docs/01_manuals/INDEX.md` 작성
- [x] `docs/01_manuals/frontend.md` 작성
- [x] `docs/01_manuals/backend.md` 작성
- [x] `docs/01_manuals/data.md` 작성
- [x] `docs/01_manuals/ai-analysis.md` 작성
- [x] `docs/01_manuals/api-contracts.md` 작성
- [x] `docs/01_manuals/security.md` 작성
- [x] `docs/01_manuals/qa-checklist.md` 작성

---

## C. 품질검사 템플릿 (일부 완료)
- [x] `docs/04_quality/done-report-template.md` 작성
- [x] `docs/04_quality/peer-review-template.md` 작성
- [x] `docs/04_quality/test-cases-mvp.md` 초안 작성
- [x] `docs/04_quality/failure-log.md` 생성

---

## D. AI 소재 분석 설계 (개발 전 문서 기준 정리 단계)
- [x] 분석 결과 JSON 스키마 초안 정의 (`docs/03_prompts/output-schema-analysis.json`)
- [x] 분석 결과 샘플(JSON) 작성 (`docs/03_prompts/examples/analysis-output-sample.json`)

### D-1. 분석 Job API (`create/status`) 재정리
- [x] 1단계: 문서 존재/연결 확인
  - 근거 문서: `docs/01_manuals/api-contracts.md`, `docs/01_manuals/backend.md`, `docs/01_manuals/security.md`
  - 확인 기준:
    - `POST /api/analysis/jobs`, `GET /api/analysis/jobs/{jobId}` 계약이 문서에 존재한다.
    - 상태값(`queued/processing/completed/failed`) 정의가 문서에 존재한다.
    - 공통 성공/실패 응답 포맷(`success`, `data|error`, `meta`)이 문서에 존재한다.
- [x] 2단계: 정책 확정 (1~2시간)
  - 수용 기준:
    - [x] 요청/응답 필드를 `필수/선택`으로 분리해 문서에 기록했다.
    - [x] `forceRefresh` 사용 조건(기본값/캐시 무시 조건)을 정책 문장으로 확정했다.
    - [x] 상태 조회 응답에서 `progress/step/message`의 선택 필드 규칙(없을 때 처리)을 확정했다.

### D-2. 모달 상태 정의 (`loading/success/error`) 재정리
- [x] 1단계: 문서 존재/연결 확인
  - 근거 문서: `docs/01_manuals/frontend.md`, `docs/01_manuals/api-contracts.md`, `docs/01_manuals/qa-checklist.md`
  - 확인 기준:
    - 모달 상태 분리 원칙(`loading/success/error`)이 문서에 존재한다.
    - 실패 시 안내/재시도 경로 필요 조건이 문서에 존재한다.
    - null/undefined/빈 데이터 대응 체크 항목이 문서에 존재한다.
- [x] 2단계: 정책 확정 (1~2시간)
  - 수용 기준:
    - [x] 각 상태의 최소 UI 요소(제목/본문/버튼/재시도 액션)를 표로 확정한다.
    - [x] 로딩 중 중복 클릭 방지(disabled) 규칙을 명시한다.
    - [x] 결과 없음/부분 성공/완전 실패를 분리한 사용자 문구 정책을 확정한다.

### D-3. 에러 코드/메시지 정책 재정리
- [x] 1단계: 문서 존재/연결 확인
  - 근거 문서: `docs/01_manuals/api-contracts.md`, `docs/01_manuals/security.md`, `docs/01_manuals/backend.md`
  - 확인 기준:
    - 에러 코드 규칙(`DOMAIN_REASON`)이 문서에 존재한다.
    - 사용자 노출 메시지와 내부 로그 메시지 분리 원칙이 문서에 존재한다.
    - timeout/외부 API 실패/검증 실패 관련 코드 예시가 문서에 존재한다.
- [x] 2단계: 정책 확정 (1~2시간)
  - 수용 기준:
    - [x] MVP 필수 에러코드 목록(예: `COMMON_INVALID_REQUEST`, `ANALYSIS_TIMEOUT`)을 고정한다.
    - [x] 코드별 사용자 메시지(재시도 가능/불가)를 1:1로 매핑한다.
    - [x] 프론트 분기 기준(토스트/인라인/재시도 버튼 표시)을 코드군 단위로 확정한다.

### D-4. 캐시 키 전략 (`video_id + analysis_version`) 재정리
- [x] 1단계: 문서 존재/연결 확인
  - 근거 문서: `docs/01_manuals/data.md`, `docs/01_manuals/backend.md`, `docs/01_manuals/security.md`
  - 확인 기준:
    - 캐시 키 기본 구조(`video_id + analysis_version`)가 문서에 존재한다.
    - 캐시 목적(비용 절감/속도 개선) 및 우선 조회 원칙이 문서에 존재한다.
    - 캐시 무효화/버전 상향 규칙이 문서에 존재한다.
- [x] 2단계: 정책 확정 (1~2시간)
  - 수용 기준:
    - [x] 캐시 키 포맷 문자열(예: `analysis:{videoId}:{analysisVersion}`)을 확정한다.
    - [x] TTL 기본값/강제갱신(`forceRefresh`) 예외 규칙을 확정한다.
    - [x] 응답 `meta.cacheHit` 표기 조건과 로그 기록 기준을 확정한다.

### D-5. AI 출력 검증/보정 정책 재정리
- [x] 1단계: 문서 존재/연결 확인
  - 근거 문서: `docs/01_manuals/ai-analysis.md`, `docs/01_manuals/api-contracts.md`, `docs/01_manuals/data.md`, `docs/01_manuals/security.md`
  - 확인 기준:
    - JSON 스키마 검증 필수 원칙이 문서에 존재한다.
    - 필드 누락 시 보정(Fallback) 규칙이 문서에 존재한다.
    - 분석 메타데이터(`model`, `analyzedAt`, `analysisVersion`, `schemaVersion`) 요구사항이 문서에 존재한다.
- [x] 2단계: 정책 확정 (1~2시간)
  - 수용 기준:
    - [x] 스키마 검증 실패 시 처리 정책(`failed` vs 부분 성공)을 명시한다.
    - [x] 누락 허용 필드/기본값 적용 필드 목록을 명시한다.
    - [x] 결과 저장 전 검증 순서(스키마→보정→재검증→저장)를 체크리스트로 고정한다.

---

## E. 프론트 MVP (개발 미시작)
- [x] 검색 결과 카드 UI 초안
- [x] "AI 소재 분석" 버튼 클릭 동작
- [x] 분석 모달 loading 화면 UI
- [x] 분석 모달 success 화면 UI
- [x] 분석 모달 error 화면 UI
- [x] 추천 키워드 칩 UI + 클릭 동작(임시)
- [x] 분석 메타 영역 UI (모델명/분석 기준/시간)

---

## F. 백엔드 MVP (개발 미시작)
- [x] FastAPI 프로젝트 기본 구조 생성
- [x] 공통 응답 스키마 정의
- [x] 분석 API 엔드포인트(임시/동기 버전 가능) 추가
- [x] AI 응답 JSON 검증 로직 추가
- [x] 에러 처리/타임아웃 처리 추가
- [x] 결과 저장 구조(테이블/파일 mock) 추가

---

## G. Blocked (막힘/확인 필요)
- [x] 유튜브 데이터 수집 전략 확정 (공식 API v3 + Render 백엔드 프록시)
  - 결정: 프론트 직호출 금지, Render 백엔드에서 `YOUTUBE_API_KEY` 환경변수로만 호출
  - 반영 문서: `docs/01_manuals/backend.md`, `docs/01_manuals/api-contracts.md`, `docs/01_manuals/security.md`
  - 운영 메모: dedupe/캐시/명시적 검색 트리거로 불필요 호출 및 추후 Firestore read 소모를 억제

---

## H. 다음 세션용 1~2시간 단위 작업 후보
- [x] `docs/04_quality/failure-log.md` 생성 및 기록 템플릿 확정
- [x] D 섹션 2단계(정책 확정) 항목 중 D-2 우선 완료
- [x] D 섹션 2단계(정책 확정) 항목 중 D-5 마무리

---

## I. 완료 로그 (요약)

### 2026-03-24 (FE-16 필터 옵션/비디오 카드 locale 확장)
- [x] `searchUiText.types.ts`, `locales/ko.ts`, `locales/en.ts`에 `filterToolbar.labels/placeholders/options`, `videoGrid`, `videoCard` 키 추가
- [x] `FilterToolbar` 하드코딩 라벨/옵션 문구를 locale 리소스 기반으로 치환하고, `filterToolbarOptions.ts`로 value 상수를 분리
- [x] `VideoGrid` 로딩 문구, `VideoCard` 버튼/aria-label 접미사 하드코딩을 locale 리소스로 치환
- [x] `searchUiText.test.ts` 검증 케이스 확장 + `docs/01_manuals/frontend.md`, `docs/00_project/CHANGELOG_WORKING.md` 동기화
- 메모: 이번 변경은 프론트 텍스트/접근성 계층만 수정하여 Firestore read 소모는 0회다. locale 일관성 강화로 잘못된 액션 유도와 재요청 가능성을 낮춰 추후 Firestore 연동 시 불필요 read 위험을 줄인다.

### 2026-03-23 (FE-15 검색 레이아웃/채널/뷰모드 locale 확장)
- [x] `searchUiText.types.ts`, `locales/ko.ts`, `locales/en.ts`에 `searchLayout/channelSearch/filterToolbar/viewMode` 키 추가
- [x] `App.tsx` 검색 섹션 `aria-label`(search-panel/toolbar-row/search-section)을 locale 리소스로 치환
- [x] `ChannelSearchBar`, `FilterToolbar`, `ViewModeToggle`이 `searchUiText` props 기반 문구를 사용하도록 전환
- [x] `searchUiText.test.ts`에 신규 locale 키 검증 추가, `docs/01_manuals/frontend.md`, `docs/00_project/CHANGELOG_WORKING.md` 동기화
- 메모: 이번 변경은 프론트 텍스트/접근성 라벨 계층만 수정하여 Firestore read 소모는 0회다. locale 일관성으로 잘못된 검색 액션 유도 가능성을 줄여 추후 Firestore 연동 시 불필요 read 위험을 낮춘다.

### 2026-03-23 (FE-14 헤더 설정 패널 locale 분리)
- [x] `frontend/src/domains/search/i18n/appUiText.types.ts`, `locales/appKo.ts`, `locales/appEn.ts`에 localeSelector/apiKeyManager/cookieManager 섹션 추가
- [x] `SearchLocaleSelector`, `ApiKeyManager`, `CookieFilePathManager`가 `appUiText` props 기반으로만 문구를 렌더링하도록 변경
- [x] `App.tsx`에서 세 컴포넌트에 locale 텍스트를 주입해 런타임 locale 변경 시 즉시 반영되도록 연결
- [x] `docs/01_manuals/frontend.md`, `docs/00_project/CHANGELOG_WORKING.md` 동기화
- 메모: 이번 변경은 프론트 문구/상태 표현 계층만 수정하여 Firestore read 소모는 0회다. locale 일관성으로 잘못된 재시도/입력 오해를 줄여 추후 Firestore 연동 시 불필요 read 유발 가능성을 낮춘다.

### 2026-03-22 (FE-13 헤더/대본 모달 locale 확장)
- [x] `frontend/src/domains/search/i18n/appUiText.types.ts`, `appUiText.ts`, `locales/appKo.ts`, `locales/appEn.ts` 추가로 앱 헤더/공통 메시지/대본 모달 문구 locale 리소스화
- [x] `App.tsx`에서 헤더 제목/서브타이틀/할당량 라벨/공통 토스트/분석 준비 문구를 `appUiText` 기반으로 전환
- [x] `TranscriptModal.tsx`가 locale 텍스트 props를 받아 로딩/오류/필드 라벨을 하드코딩 없이 렌더링하도록 변경
- [x] `appUiText.test.ts` 추가로 기본 locale/지원 locale/미지원 fallback 동작 고정
- 메모: 이번 변경은 UI 텍스트/렌더링 계층만 수정하여 Firestore read 소모는 0회다. locale 일관성으로 잘못된 재시도/오해 문구를 줄여 추후 Firestore 연동 시 불필요 read 유발 가능성을 낮춘다.

### 2026-03-22 (FE-12 analysis 모달 locale 문구 연결)
- [x] `frontend/src/domains/analysis/i18n/*` 추가로 analysis 모달 문구 locale 리소스를 `ko/en`으로 분리
- [x] `AnalysisModal`, `AnalysisLoadingView`, `AnalysisSuccessView`, `AnalysisErrorView`가 locale 기반 공통 문구를 사용하도록 연결
- [x] `analysisUiText.test.ts`로 기본 locale/지원 locale/미지원 locale fallback 동작 고정
- 메모: 이번 변경은 프론트 문구/렌더링 계층만 수정하여 Firestore read 소모는 0회다. locale 일관성으로 잘못된 재시도 유도 문구를 줄여 추후 Firestore 연동 시 불필요 read 위험을 낮춘다.

### 2026-03-21 (FE-11 검색 UI runtime locale 상태 연결)
- [x] `searchUiLocale.ts` 추가로 locale 해석/저장(`localStorage`) 정책을 모듈화
- [x] `App.tsx`에 locale 상태(`searchUiLocale`)와 선택 UI(`SearchLocaleSelector`)를 연결하고, 브라우저 언어 fallback을 적용
- [x] `KeywordSearchBar`, `ResultSummaryBar`, `VideoGrid`가 `searchUiText` props 기반으로 렌더링되도록 전환
- [x] `searchErrorUiPolicy`, `popStateSyncPolicy`를 locale 텍스트 주입형 함수로 전환해 정책 문구도 런타임 locale을 따르도록 정합성 확보
- [x] `searchUiLocale.test.ts` 포함 관련 테스트/빌드 통과
- 메모: 본 변경은 프론트 i18n 상태/문구 렌더링 계층만 다루므로 Firestore read 소모는 0회다. 또한 locale 혼선으로 인한 잘못된 재시도 문구 노출을 줄여, 추후 Firestore 연동 시 불필요 재조회(read) 유발 가능성을 낮춘다.

### 2026-03-21 (FE-10 검색 문구 locale 레이어 확장)
- [x] `frontend/src/domains/search/i18n/locales/ko.ts`, `en.ts`로 locale 리소스를 분리
- [x] `searchUiText.ts`에 `getSearchUiText(locale)` + `DEFAULT_SEARCH_UI_LOCALE` fallback을 추가해 상수 기반 구조를 locale 선택 가능한 구조로 확장
- [x] `searchUiText.types.ts`로 리소스 타입을 분리해 locale 파일 간 필드 누락을 컴파일 단계에서 차단
- [x] `searchUiText.test.ts` 추가로 기본 locale/지원 locale/미지원 locale fallback 동작을 고정
- [x] `docs/01_manuals/frontend.md`에 FE-10 locale 확장 규칙 추가
- 메모: UI 텍스트 리소스/테스트만 변경되어 Firestore read 소모는 0회다. 또한 locale fallback을 고정해 잘못된 locale 값으로 인한 불필요 재요청 루프를 예방해 추후 Firestore 연동 시 read 증가 위험을 줄였다.

### 2026-03-20 (FE-9 검색 패널 문구 i18n 리소스 분리)
- [x] `frontend/src/domains/search/i18n/searchUiText.ts` 생성으로 검색 패널/오류/popstate/키워드 입력 문구를 단일 리소스로 분리
- [x] `ResultSummaryBar`, `VideoGrid`, `KeywordSearchBar`, `searchErrorUiPolicy`, `popStateSyncPolicy`가 공통 문구 리소스를 참조하도록 정리
- [x] `docs/01_manuals/frontend.md`에 검색 패널 문구 관리 규칙(FE-9) 추가
- 메모: 현재 검색 경로는 백엔드 API 기반이라 Firestore read는 0회다. 이번 변경은 UI 문구 참조 구조만 정리해 read 소모를 늘리지 않으며, 향후 문구 변경 시 재시도 정책 오작동으로 인한 불필요 재조회(read) 위험을 줄인다.

### 2026-03-19 (FE-8 retryable=false 입력 포커스/강조)
- [x] `searchInputAttentionPolicy.ts` + 테스트 추가로 비재시도 오류 시 입력 주의 유도 트리거를 정책화
- [x] `App.tsx`에서 `resultsState=error` + `isSearchErrorRetryable=false` 최초 진입 시 키워드 입력 자동 포커스 연결
- [x] `KeywordSearchBar`에 `aria-invalid` + 강조 스타일 클래스 연결로 입력 수정 유도 강화
- [x] `styles.css`에 `search-input-attention` 스타일 추가
- 메모: 현재 검색 경로는 백엔드 API 기반이라 Firestore read는 0회다. 비재시도 오류에서 즉시 재호출 대신 입력 수정으로 유도해 추후 Firestore 연동 시 불필요 read 소모 위험을 낮췄다.

### 2026-03-19 (FE-7 검색 에러 retryable UX 분기 반영)
- [x] `VideoGrid` 오류 상태에 retryable 여부 기반 보조 문구/액션 버튼 분기 추가
- [x] retryable=true는 "같은 조건으로 다시 검색", retryable=false는 "검색 조건 초기화" 액션으로 고정
- [x] `ResultSummaryBar`에 retryable=false 전용 입력 수정 안내 문구 추가
- [x] `searchErrorUiPolicy.ts` + 단위 테스트 추가로 에러 UX 정책 문자열을 모듈화
- 메모: 현재 검색 경로는 백엔드 API 기반이라 Firestore read는 0회다. 재시도 불가 오류에서 즉시 재요청을 막고 입력 수정으로 유도해 추후 Firestore 연동 시 불필요 read 증가를 예방한다.

### 2026-03-18 (FE-6 검색 에러 매핑/재시도 가능 여부 테스트 보강)
- [x] `frontend/src/domains/search/utils/mapSearchError.ts` 생성 및 검색 에러코드별 `message/retryable` 정책 고정
- [x] `useVideoSearch`에 `isSearchErrorRetryable` 상태 추가 및 executor 에러 결과를 `message + retryable` 구조로 확장
- [x] `useVideoSearch.test.ts`에 retry 가능/불가 매핑 전달 테스트 2건 추가
- [x] `mapSearchError.test.ts` 신규 추가로 `SEARCH_QUOTA_EXCEEDED`, `COMMON_INVALID_REQUEST`, unknown code 정책 검증
- 메모: 현재 검색 경로는 백엔드 API 기반이라 Firestore read는 0회다. retryable 정책을 코드/테스트에 고정해 재시도 불가 오류에서 불필요 read 소모가 발생하지 않도록 대비했다.

### 2026-03-18 (FE-5 검색 훅 중복 호출 방지 테스트 보강)
- [x] `frontend/src/domains/search/hooks/useVideoSearch.test.ts` 신규 추가
- [x] 동일 query/filter/apiKeys 재호출 시 API 호출이 `skipped` 처리되어 중복 호출이 차단되는지 검증
- [x] query 변경 시 재호출, 에러 후 동일 파라미터 재시도 가능, reset 이후 재호출 가능 시나리오 검증
- 메모: 현재 검색 경로는 백엔드 API 기반이라 Firestore read는 직접 발생하지 않는다. 다만 동일 요청 중복 호출 차단을 테스트로 고정해 추후 Firestore 연동 시 불필요 read 증가를 예방한다.

### 2026-03-17 (ANALYSIS 계약 테스트 보강)
- [x] `ANALYSIS_OUTPUT_INVALID` 시 `success=true + status=failed + data.error.code` 검증 테스트 추가
- [x] `ANALYSIS_RATE_LIMITED` `Retry-After: 3` 헤더 유지 및 비 rate-limit 오류에서 헤더 미노출 검증 테스트 추가
- [x] 허용 누락 필드(`summary.weakPoints`, `contentIdeas`, `recommendedKeywords`, `meta.warnings`) 보정 후 `status=completed` + warnings 검증 테스트 추가
- 메모: 현재 analysis 저장소는 in-memory이므로 Firestore read는 0회이며, 계약 테스트 보강은 추후 Firestore 연동 시 불필요 재시도/중복 조회로 인한 read 증가를 예방하는 안전장치 역할을 한다.


### 2026-03-12 (FE-3 검색 API 최소 연결)
- [x] `search/api/client.ts` 추가로 검색 API 요청/에러 파싱 경로 구성 (`VITE_API_BASE_URL`, `VITE_SEARCH_API_PATH` 지원)
- [x] `useVideoSearch` 훅 추가로 `loading/empty/error/success` 상태 관리 및 동일 파라미터 중복 호출 가드 반영
- [x] `App.tsx` 검색 흐름을 훅 기반으로 전환하고 버튼/Enter 트리거에서만 API 호출되도록 유지
- 메모: 필터/보기모드 변경에서는 자동 검색을 실행하지 않아 불필요 네트워크 호출을 줄였고, 동일 파라미터 재호출 차단으로 Firestore 연동 시 read 소모 증가를 완화할 수 있다.

### 2026-03-12 (FE-2 URL 쿼리 동기화)
- [x] `useSearchQueryState` 훅 추가로 `q`, `channel`, `view` 파싱/직렬화 + `history.replaceState` 동기화 반영
- [x] `App.tsx`에서 query/view 상태를 훅으로 이관하고, 초기 마운트 시 URL 기반 검색 복구 반영
- [x] 결과 요약 바에 `필터 초기화`, `URL 복사` 액션 추가(실패/성공 메시지 포함)
- 메모: 현재는 로컬 데이터 필터 기반이라 Firestore read는 0회이며, URL 동기화는 네트워크 호출 없이 브라우저 history만 갱신해 read 소모에 영향이 없다. 또한 자동 API 재조회가 아니라 버튼 트리거 검색을 유지해 추후 Firestore 연동 시 불필요 read 증가를 방지한다.

### 2026-03-12 (FE-1 탐색 화면 뼈대 보강)
- [x] `FilterToolbar`, `ViewModeToggle` 컴포넌트 추가로 필터/보기 전환 UI 연결
- [x] `App.tsx`에 검색영역-필터-결과상태 연결 및 검색 로딩/분석 로딩 상태 분리 유지
- [x] `styles.css` 다크 테마 및 grid/list 레이아웃 최소 보강
- 메모: 현재 구현은 백엔드 API + 로컬 검색 필터 기반으로 Firestore read는 0회이며, 검색 버튼 트리거/디바운스/모달 폴링 중단 조건으로 추후 Firestore 연동 시 불필요 read를 줄이도록 유지

### 2026-03-11
- [x] analysis 프론트 실제 API 연결: create/status 어댑터 추가 및 모달 상태를 mock 타이머에서 API 응답 기반으로 전환
- [x] queued/processing 폴링 + 완료/실패/모달 닫힘 중단 조건 반영
- [x] `ANALYSIS_RATE_LIMITED`의 `Retry-After` 헤더 기반 재시도 안내 문구 반영

### 2026-03-12
- [x] `domains/search/types.ts` 추가 및 검색/결과 상태 타입 분리
- [x] `KeywordSearchBar`, `ChannelSearchBar`, `ResultSummaryBar`, `VideoCard`, `VideoGrid` 컴포넌트 분리
- [x] `App.tsx`에서 검색 패널 + 결과 상태(loading/empty/error/success) 분기 뼈대 구성, 기존 analysis 모달 흐름 유지
- 메모: 현재는 백엔드 in-memory 저장소 기준이라 Firestore read는 0회이며, 폴링 간격(1.2s)·중단조건·중복 클릭 차단으로 추후 Firestore 연동 시 불필요 read 반복을 줄이도록 설계

### 2026-02-23
- [x] 검색 카드(초안)에서 "AI 소재 분석" 모달 트리거 연결
- [x] 추천 키워드 칩 컴포넌트 분리 및 임시 클릭(검색어 반영) 연결
- [x] 로딩 중 분석 버튼/모달 액션 비활성화로 중복 요청 방지
- 메모: 현재는 mock 기반이라 Firestore read는 발생하지 않으며, UI 단에서 로딩 중 중복 클릭을 막아 향후 Firestore 연동 시 불필요한 read 반복을 줄일 수 있도록 반영

### 2026-03-08
- [x] analysis 프론트 기초 연결: 타입/모달 loading·success·error/mock 데이터 반영
- 완료 항목: 외부 SDK 예외 변환 연결 + `ANALYSIS_RATE_LIMITED` `Retry-After`(3초) 정책 반영 + API 계약 테스트 헤더 검증 추가
- 메모: SDK 미가용 환경은 기존 시뮬레이션 모드로 안전 폴백되며, rate-limited 응답에서 재시도 타이밍을 명시해 불필요한 재호출을 줄일 수 있음

### 2026-03-07
- 완료 항목: 외부 AI 호출 래퍼 도입 + timeout/upstream/rate-limited 계약 매핑 + API 테스트 5종 검증
- 메모: 캐시 선조회 후 외부 호출하도록 순서를 조정해 불필요한 재요청을 방지했고, rate-limited는 최소 백오프(1회) 후 실패 시 `ANALYSIS_RATE_LIMITED`로 고정 응답

### 2026-03-06
- 완료 항목: 백엔드 timeout/upstream 예외 매핑 + 최소 API 계약 테스트 추가
- 메모: `videoId` 시뮬레이션 접미사(`_timeout`, `_upstream_unavailable`)로 `ANALYSIS_TIMEOUT`/`ANALYSIS_UPSTREAM_UNAVAILABLE`를 계약 메시지로 고정 반환하고, TestClient 기반 정상/캐시 hit/실패 응답 테스트 4건을 추가

### 2026-02-23
- 완료 항목: 백엔드 분석 검증 파이프라인 최소 구현(validator/service/router 연동)
- 메모: 1차 필수 필드 검증 → 허용 필드 보정(`summary.weakPoints`, `contentIdeas`, `recommendedKeywords`, `meta.warnings`) → 2차 스키마 검증 순서를 코드로 고정하고, 실패 시 `ANALYSIS_OUTPUT_INVALID` + `status=failed`로 분기

### 2026-03-04
- 완료 항목: 백엔드 MVP 최소 골격 생성(앱 진입점/analysis router/schemas/공통 응답 헬퍼)
- 메모: `POST /api/analysis/jobs`, `GET /api/analysis/jobs/{jobId}` 스텁 구현 및 공통 응답 포맷(`success`, `data|error`, `meta`) 적용

### 2026-03-03
- 완료 항목: D-5(출력 검증/보정) 2단계 정책 확정
- 메모: `ai-analysis.md`에 failed/partial-success 분기 기준과 누락 허용 필드 표를 고정하고, `api-contracts.md`/`backend.md`에 상태 매핑·저장 전 파이프라인·로그 기준을 동기화
### 2026-03-02
- 완료 항목: D-4(캐시 키 전략) 2단계 정책 확정
- 메모: `data.md`에 캐시 키 포맷/TTL(24h)/forceRefresh 정책을 고정하고, `api-contracts.md`와 `backend.md`에 `meta.cacheHit` 표기 조건 및 로깅 기준을 동기화
### 2026-03-01
- 완료 항목: D-3(에러 코드/메시지) 2단계 정책 확정
- 메모: `api-contracts.md`에 MVP 필수 에러코드/메시지/재시도 매핑 표와 코드군별 프론트 분기 기준을 고정하고, `frontend.md`/`backend.md`에 UI 처리 및 로그 분리 원칙을 동기화
### 2026-02-28
- 완료 항목: D-2(모달 상태) 2단계 정책 확정
- 메모: `frontend.md`에 상태별 UI 요소 표/문구 정책/중복 클릭 방지 규칙을 고정하고, `api-contracts.md`에 API 응답→프론트 상태 매핑 및 fallback 규칙을 동기화
### 2026-02-27
- 완료 항목: D-1(분석 Job API) 2단계 정책 확정
- 메모: `api-contracts.md`에 create/status 필수·선택 필드표, `forceRefresh` 고정 정책, `progress/step/message` 누락 처리 규칙 반영

### 2026-02-26
- 완료 항목: `docs/04_quality/failure-log.md` 생성 및 에러코드 매핑 규칙 반영
- 메모: `api-contracts.md` 코드 기준으로 incident 템플릿/샘플 1건 포함

### 2026-02-23
- 완료 항목: 문서 하니스/매뉴얼/핵심 설계 문서 초안 작성
- 메모: 개발 코드는 아직 시작하지 않음

### 2026-02-24
- 완료 항목: `docs/04_quality/test-cases-mvp.md` 작성 (정상/실패/빈데이터/경계값)
- 메모: API 계약/스키마 필드명 및 에러코드 정합성 기준 문서화 완료

### 2026-02-22
- 완료 항목: CHECKLIST/CHANGELOG 상태 정합화 업데이트
- 메모: 실제 파일 존재 여부와 개발 미시작 상태를 분리해 반영


### 2026-03-10
- [x] 완료 항목: 동일 `videoId+analysisVersion` 처리 중 dedupe(진행 중 job 재사용) 반영
- [x] 완료 항목: 분석 도메인 공통 로깅 필드(`requestId`, `jobId`, `videoId`, `errorCode`, `retryAfter`, `cacheHit`) 표준화
- [x] 완료 항목: 계약 테스트 보강(중복 요청 재사용, forceRefresh 우회, Retry-After 헤더 유지)
- 메모: 현재 저장소는 in-memory라 Firestore read는 0회이며, dedupe + cache 우선 전략으로 Firestore 연동 시 동일 분석 요청의 반복 read를 줄일 수 있도록 선제 반영

### 2026-03-13 (YouTube API v3 + Render 연동 정책 확정)
- [x] YouTube API 호출을 Render 백엔드 경유로 고정하고 `YOUTUBE_API_KEY` 서버 환경변수 원칙 문서화
- [x] 검색 API 계약에 quota/rate-limit/upstream 에러코드 매핑 추가
- [x] 보안 매뉴얼에 키관리/로그마스킹/운영 체크리스트 보강
- 메모: 버튼/Enter 트리거 + dedupe/캐시 우선 정책을 유지해 자동 재조회로 인한 불필요 호출과 추후 Firestore read 증가 위험을 낮춤

### 2026-03-14 (검색 초기상태 + 카드 모델/렌더 고도화)
- [x] 검색 기본 상태를 `keyword=""`로 변경하고 초기 마운트 자동 검색을 URL 파라미터 존재 시에만 실행하도록 조정
- [x] `/api/search/videos` 응답/프론트 타입/백엔드 스키마를 카드 고도화 필드(썸네일/길이/국가/구독자/숏폼/스크립트/수익필드)로 확장
- [x] YouTube `videos(part=snippet,statistics,contentDetails)` + `channels(part=snippet,statistics)` 연동으로 duration/thumbnail/subscriber/country 수집
- [x] 검색 카드 UI를 썸네일 오버레이/키워드 강조/메타 3줄 구조로 모듈 분리
- 메모: 현재 변경은 YouTube API 기반이며 Firestore를 조회하지 않아 read 소모는 0회. 또한 초기 자동검색 제거 + 명시적 검색 트리거 유지로 추후 Firestore 연동 시 불필요 read 발생 가능성을 줄임.


### 2026-03-16 (FE-5 popstate 복구 안내 UX 완결)
- [x] popstate 재조회 시 안내 문구 노출 조건을 `query 변경 + autoSearchOnPopState=true`로 고정
- [x] `useSearchQueryState`에 조건부 안내 콜백을 추가해 동일 query/view에서는 재조회/안내 모두 생략
- [x] `ResultSummaryBar`에 popstate 복구 인라인 안내 영역을 추가하고 App에서 2.6초 자동 해제 처리
- [x] `popStateSyncPolicy` 단위 테스트 추가로 재조회/안내 노출 조건 검증
- 메모: 현재 검색 경로는 백엔드 API 기반으로 Firestore read는 0회. 동일 query/view popstate 재조회 차단을 유지해 추후 Firestore 연동 시 불필요 read 증가를 예방

### 2026-03-15 (FE-4 popstate 검색 동기화 경량 보강)
- [x] `useSearchQueryState`에서 popstate 이벤트 시 query/view 변경 여부를 비교해 동일 상태에서는 콜백/상태 업데이트를 생략
- [x] `App.tsx`에서 `autoSearchOnPopState=true` + 복원 query 기반 `runSearch` 연결
- [x] popstate 자동 재조회는 query가 실제로 변경된 경우에만 실행되도록 가드
- 메모: 현재 검색은 백엔드 API 기반이며 Firestore read는 0회. query 변경 없는 popstate 재조회 차단으로 추후 Firestore 연동 시 불필요 read 증가 위험을 낮춤


### 2026-03-18 (백엔드 검색 에러 계약 테스트 보강)
- [x] `backend/tests/test_search_api.py`에 quota/rate-limit/upstream unavailable/upstream error 계약 테스트 4건 추가
- [x] 검색 에러코드별 상태코드(503/502)와 고정 사용자 메시지 일치 여부 검증
- 메모: 테스트 보강 작업으로 런타임 로직/저장소 경로는 변경하지 않았고 Firestore read는 0회. 추후 Firestore 연동 시에도 에러 응답 계약이 고정돼 재시도 분기 오작동으로 인한 불필요 read 증가 위험을 줄임.
