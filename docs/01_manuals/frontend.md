# frontend.md

## 목적
이 문서는 프론트엔드(React + Vite + TypeScript + Tailwind) 작업 시
UI/상태/타입/API 연동/에러 처리 품질을 일정하게 유지하기 위한 규칙을 정의합니다.

이 프로젝트의 핵심 UX는 "검색 결과 → AI 소재 분석 모달 → 분석 결과 활용" 흐름입니다.

---

## 기본 원칙
1. **상태를 명시적으로 분리한다** (`loading/success/error/empty/partial-success`)
2. **API 응답 타입을 먼저 정의한다**
3. **실패 UX를 정상 UX만큼 중요하게 다룬다**
4. **긴 콘텐츠는 스크롤 영역을 분리한다**
5. **도메인별로 컴포넌트/타입/훅을 나눈다**
6. **검색/에러/안내 문구는 도메인 i18n 리소스 파일로 분리한다** (`domains/search/i18n/searchUiText.ts`)
7. **앱 헤더/공통 토스트/대본 모달처럼 검색 외 문구도 `appUiText`로 분리한다** (`domains/search/i18n/appUiText.ts`)

---

## 권장 구조 (예시)
```txt
frontend/src/
├─ domains/
│  ├─ search/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ api/
│  │  └─ types.ts
│  ├─ analysis/
│  │  ├─ components/
│  │  │  ├─ AnalysisModal.tsx
│  │  │  ├─ AnalysisLoadingView.tsx
│  │  │  ├─ AnalysisSuccessView.tsx
│  │  │  ├─ AnalysisErrorView.tsx
│  │  │  └─ KeywordChipList.tsx
│  │  ├─ hooks/
│  │  ├─ api/
│  │  └─ types.ts
│  └─ common/
├─ components/
├─ lib/
│  ├─ http.ts
│  └─ format.ts
├─ types/
└─ mocks/
```

---

## 상태 관리 규칙 (중요)
분석 모달 같은 핵심 UI는 상태를 암묵적으로 처리하지 말고 명시적으로 분리합니다.

### 권장 상태
- `idle`
- `loading`
- `success`
- `error`
- `empty`
- `partial-success`

### 분석 모달에서 최소 처리 상태
- 모달 열림/닫힘
- 요청 진행 상태
- 결과 데이터
- 에러 메시지
- 재시도 가능 여부

예시 상태 개념:

```ts
type AnalysisStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "empty"
  | "partial-success";
```

---

## 타입 우선 규칙
API 호출 전에 TypeScript 타입/인터페이스를 먼저 정의합니다.
세부 필드는 `api-contracts.md`와 일치해야 합니다.

예시 분류:
- `CreateAnalysisJobRequest`
- `CreateAnalysisJobResponse`
- `AnalysisJobStatusResponse`
- `AnalysisResult`
- `AnalysisErrorState`

금지:
- 응답 타입 없이 `any`로 처리
- 필수 필드를 optional로 남발
- API 문서와 다른 필드명 임의 사용

---

## D-2 정책 확정: 모달 상태별 최소 UI 요소

| 상태 | 제목 | 본문 | 버튼 | 재시도 가능 여부 | 사용자 문구 정책 | 접근성/보조 안내 |
|---|---|---|---|---|---|---|
| loading | AI 소재 분석 중 | 분석 진행 상황 또는 기본 진행 문구 | 닫기(정책 선택), 분석 버튼 disabled | 불가 | "분석을 준비 중입니다." 또는 "분석 진행 중입니다." | `aria-live="polite"`로 진행 문구 알림 권장 |
| success | 분석 완료 | 요약/긍정/아쉬운 점/소재 추천/키워드 | 닫기, (선택) 재분석 | 가능(선택) | 사실 요약과 AI 제안을 구분 라벨로 표시 | 섹션 제목을 명확히 분리해 스크린리더 탐색성 확보 |
| empty | 분석 결과 없음 | 결과가 비어 있는 이유 + 다음 액션 | 닫기, 재시도 | 가능 | "분석 가능한 데이터가 부족합니다. 잠시 후 다시 시도해 주세요." | 빈 상태도 안내 텍스트 제공(아이콘만 금지) |
| partial-success | 일부 결과만 제공 | 사용 가능한 섹션 + 누락 섹션 안내 | 닫기, 재시도 | 가능 | "일부 데이터만 수집되어 제한된 결과를 표시합니다." | 누락 섹션에 "데이터 없음" 레이블 고정 |
| error | 분석 실패 | 실패 원인 범주 + 재시도 안내 | 재시도, 닫기 | 가능 | "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." | 에러 제목/본문/액션 버튼 순서 유지 |

### 로딩 중 중복 클릭 방지 규칙 (고정)
- `loading` 상태에서는 분석 시작 버튼/재시도 버튼을 모두 `disabled=true`로 처리합니다.
- 동일 `videoId`에 대한 요청이 `queued/processing`이면 새 요청을 보내지 않고 기존 Job 폴링으로 전환합니다.
- `loading` 해제는 `success/empty/partial-success/error` 중 하나로 전환된 뒤에만 허용합니다.

### 검색 패널 문구 리소스 분리 규칙 (FE-9)
- 검색 패널에서 반복되는 문구(요약 바, 오류 패널, popstate 복구 안내, 키워드 검색 라벨)는 `domains/search/i18n/searchUiText.ts`에서 단일 관리한다.
- 컴포넌트/유틸에서는 문자열 하드코딩 대신 리소스를 import해 사용한다.
- 문구 변경 시 정책 테스트(`searchErrorUiPolicy.test.ts` 등)가 깨지지 않도록 기존 키를 유지한 채 값만 변경한다.

### locale 확장 규칙 (FE-10)
- `domains/search/i18n/locales/{locale}.ts` 단위로 locale 리소스를 분리하고, `searchUiText.ts`는 locale 선택/기본 fallback만 담당한다.
- 지원하지 않는 locale 요청은 `DEFAULT_SEARCH_UI_LOCALE`로 fallback해 런타임 에러를 방지한다.
- 기존 컴포넌트는 `SEARCH_UI_TEXT` 기본 export를 그대로 사용해도 동작하도록 호환성을 유지한다.

### runtime locale 상태 연결 규칙 (FE-11)
- 앱 시작 시 locale 우선순위는 `localStorage(사용자 선택) -> browser language -> DEFAULT_SEARCH_UI_LOCALE` 순서로 고정한다.
- locale 선택 UI에서 변경한 값은 `searchUiLocale.ts`를 통해 저장하고, 검색 도메인 컴포넌트에는 `searchUiText`를 props로 주입해 즉시 반영한다.
- 정책/유틸(`searchErrorUiPolicy`, `popStateSyncPolicy`)도 동일 `searchUiText`를 인자로 받아 locale 일관성을 유지한다.

### analysis modal locale 연결 규칙 (FE-12)
- analysis 도메인 문구는 `domains/analysis/i18n/locales/{locale}.ts`로 분리하고 `analysisUiText.ts`에서 fallback(`ko`)을 처리한다.
- `AnalysisModal`은 `locale` prop을 받아 `loading/success/error` 공통 버튼/섹션 문구를 동일 locale로 렌더링한다.
- 날짜 포맷은 locale별 `toLocaleString`을 사용하고, 파싱 실패 시 locale별 fallback 문구를 노출한다.

### 결과 없음/부분 성공/완전 실패 문구 분리 규칙
- `empty`: 데이터 부족/필드 부재 중심 문구 사용(시스템 오류 문구 금지).
- `partial-success`: "일부 결과만 표시"를 명시하고 누락 범위를 안내.
- `error`: 네트워크/서버/검증 실패 등 재시도 중심 문구 사용.

---

## API 연동 규칙
### 공통 HTTP 클라이언트
- 공통 `http.ts` 사용 권장
- timeout/에러 파싱 정책 통일
- response body 구조를 일관되게 해석

### 분석 Job 흐름 (권장)
1. `POST /api/analysis/jobs`
2. 응답으로 `jobId` 받기
3. 폴링(`GET /api/analysis/jobs/{jobId}`)
4. 상태에 따라 UI 전환

초기 임시 동기 버전 구현 시에도, 모달 상태 구조는 Job 방식 전환 가능하게 유지합니다.

---

## D-2 정책 확정: API 응답 → 프론트 상태 매핑

| API/응답 조건 | 프론트 상태 | 처리 규칙 |
|---|---|---|
| `POST`/`GET` + `success=true` + `status=queued|processing` | loading | 진행 문구 표시, 폴링 유지 |
| `POST`/`GET` + `success=true` + `status=completed` + 유효 result | success | 결과 섹션 렌더링 |
| `POST`/`GET` + `success=true` + `status=completed` + result 비어있음 | empty | 빈 상태 안내 + 재시도 제공 |
| `POST`/`GET` + `success=true` + `status=completed` + result 일부 누락 | partial-success | 사용 가능한 섹션 우선 렌더링 + 누락 안내 |
| `POST`/`GET` + `success=true` + `status=failed` | error | 재시도 버튼 노출 |
| HTTP 실패 또는 `success=false` | error | 오류 안내 문구 + 재시도 버튼 노출 |

### `progress/step/message` 누락 fallback 규칙
- `status=queued|processing`이어도 `progress/step/message`는 없을 수 있으며 에러로 간주하지 않습니다.
- `message` 없으면 기본 문구 사용: "분석 진행 중입니다.".
- `progress` 없으면 진행률 바를 숨기고 로딩 인디케이터만 표시합니다.
- `step`은 내부 키로 취급하고, 사용자 문구는 `message` 또는 기본 문구를 우선합니다.

---


## D-3 정책 확정: 에러 코드군별 UI 처리 기준 (고정)

| 에러 코드 | 사용자 메시지(요약) | UI 노출 방식 | 재시도 버튼 | 비고 |
|---|---|---|---|---|
| `COMMON_INVALID_REQUEST` | 요청값이 올바르지 않습니다. 입력값을 확인해 주세요. | 인라인(폼/모달 본문) | 숨김 | 입력 수정 유도 |
| `ANALYSIS_TIMEOUT` | 분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요. | 토스트 + 모달 본문 안내 | 노출 | 로딩 중복 클릭 방지 유지 |
| `ANALYSIS_OUTPUT_INVALID` | 분석 결과 검증에 실패했습니다. 다시 시도해 주세요. | 인라인(결과 영역) | 노출 | 부분 렌더링 금지, 오류 상태 전환 |
| `ANALYSIS_JOB_NOT_FOUND` | 분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요. | 토스트 | 숨김(대신 "새 분석 시작") | 기존 폴링 즉시 중단 |
| `ANALYSIS_RATE_LIMITED` | 분석 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요. | 토스트 | 노출 | 과도한 연속 재시도 방지 문구 포함 |
| `ANALYSIS_UPSTREAM_UNAVAILABLE` | 분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. | 토스트 | 노출 | 일시 장애로 분류 |

### 코드군 단위 분기 원칙
- `COMMON_*`: 사용자 입력 교정이 우선이므로 인라인 안내를 기본으로 사용합니다.
- `ANALYSIS_*` 일시 장애 계열(`TIMEOUT`, `RATE_LIMITED`, `UPSTREAM_UNAVAILABLE`): 토스트 + 재시도 버튼을 함께 제공합니다.
- `ANALYSIS_OUTPUT_INVALID`: 결과 컨텍스트를 유지해야 하므로 모달 내부 인라인 에러를 우선 사용합니다.
- `ANALYSIS_JOB_NOT_FOUND`: 기존 작업을 복구하지 않고 새 작업 시작으로 전환합니다.

## D-2 정책 확정: 구현 착수 체크리스트(작업순서)
1. 상태 enum/타입 정의(`idle/loading/success/error/empty/partial-success`)
2. 모달 컨테이너 상태 분기 구현
3. API 응답 매핑 함수 구현(계약 기준)
4. 재시도 핸들러 구현(`error/empty/partial-success`에서만 활성)
5. 로딩 중 버튼 disabled 처리
6. `progress/step/message` 누락 fallback 적용
7. 빈 데이터/부분 성공 문구 정책 적용
8. QA 시나리오 점검(정상/실패/빈데이터/부분성공)

### 최소 QA 시나리오(D-2 범위)
- 정상: `loading → success`
- 실패: `loading → error → retry`
- 빈데이터: `completed + empty result → empty`
- 부분성공: `completed + 일부 섹션 누락 → partial-success`

---

## 컴포넌트 분리 원칙
하나의 컴포넌트가 너무 많은 책임을 가지지 않도록 분리합니다.

예시 (analysis 도메인):
- `AnalysisModal` (컨테이너/상태 분기)
- `AnalysisLoadingView`
- `AnalysisSuccessView`
- `AnalysisErrorView`
- `KeywordChipList`
- `AnalysisMetaInfo`

---

## 스타일 / UI 일관성 규칙
- Tailwind 반복 클래스는 공용 컴포넌트/유틸 추출 검토
- 카드/모달/버튼 색상 톤 일관성 유지
- 다크 테마 명도 대비 확인
- 스크롤바/overflow 처리 점검
- hover/focus 상태 제공

---

## 사용자 액션 UX 규칙
- 로딩 중 분석 버튼 중복 클릭 방지 (`disabled`)
- 재시도 시 상태 초기화 후 요청 시작
- 닫기 후 재오픈 시 상태 초기화 정책 명확화
  - 권장: 새 분석이면 초기화
  - 캐시 결과면 즉시 success 가능

---

## 테스트 체크 포인트 (프론트)
- `loading → success` 전환
- `loading → error` 전환
- `error → retry → success` 전환
- 결과 텍스트가 긴 경우 레이아웃 유지
- 추천 키워드 0개/1개/여러 개
- 결과 필드 일부 누락 시 fallback 렌더링

---

## 문서 연동 규칙
다음 변경 시 반드시 문서 동기화:
- 분석 결과 UI 필드 변경 → `api-contracts.md`, `ai-analysis.md`
- 상태 추가/변경 → `docs/05_ui/states-analysis-modal.md` (생성 후)
- UX 정책 변경 → `CONTEXT_NOTE.md`

---

## 완료 보고 필수 항목 (프론트 작업)
- 상태 처리 범위 (`loading/success/error/empty/partial-success`)
- 에러 UX 구현 여부
- 타입 정의 변경 여부
- API 연동 방식 (동기/폴링)
- 레이아웃/스크롤 처리 내역
- 테스트 결과
