# frontend.md

## 목적
이 문서는 프론트엔드(React + Vite + TypeScript + Tailwind) 작업 시
UI/상태/타입/API 연동/에러 처리 품질을 일정하게 유지하기 위한 규칙을 정의합니다.

이 프로젝트의 핵심 UX는 "검색 결과 → AI 소재 분석 모달 → 분석 결과 활용" 흐름입니다.

---

## 기본 원칙
1. **상태를 명시적으로 분리한다** (`loading/success/error/empty`)
2. **API 응답 타입을 먼저 정의한다**
3. **실패 UX를 정상 UX만큼 중요하게 다룬다**
4. **긴 콘텐츠는 스크롤 영역을 분리한다**
5. **도메인별로 컴포넌트/타입/훅을 나눈다**

---

## 권장 구조 (예시)
```txt id="trzje8"
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

상태 관리 규칙 (중요)

분석 모달 같은 핵심 UI는 상태를 암묵적으로 처리하지 말고 명시적으로 분리합니다.

권장 상태

idle

loading

success

error

분석 모달에서 최소 처리 상태

모달 열림/닫힘

요청 진행 상태

결과 데이터

에러 메시지

재시도 가능 여부

예시 상태 개념:

type AnalysisStatus = "idle" | "loading" | "success" | "error";
타입 우선 규칙

API 호출 전에 TypeScript 타입/인터페이스를 먼저 정의합니다.
세부 필드는 api-contracts.md와 일치해야 합니다.

예시 분류:

CreateAnalysisJobRequest

CreateAnalysisJobResponse

AnalysisJobStatusResponse

AnalysisResult

AnalysisErrorState

금지:

응답 타입 없이 any로 처리

필수 필드를 optional로 남발

API 문서와 다른 필드명 임의 사용

UI 상태별 UX 규칙 (분석 모달 기준)
1) Loading 상태

필수 요소:

제목 (무엇을 분석 중인지)

스피너/로딩 인디케이터

진행 메시지 (예: 댓글/영상 데이터 분석 중)

닫기 버튼 (정책에 따라 비활성 또는 활성)

권장 요소:

단계성 메시지 (댓글 수집 중, 키워드 추출 중, 인사이트 정리 중)

예상 소요 시간 안내 (선택)

취소 버튼 (추후)

주의:

로딩 중 빈 화면 금지

로딩 중 버튼 연타 방지

2) Success 상태

필수 요소:

분석 완료 헤더

댓글 요약 섹션

주요 반응 / 긍정 포인트 / 아쉬운 점

소재 추천 섹션

추천 키워드 칩 리스트

닫기 버튼

권장 요소:

분석 메타 정보 (모델명 / 기준 데이터 수 / 분석 시각)

재분석 버튼

백로그 저장 버튼 (추후)

"AI 제안" / "요약" 구분 라벨

주의:

텍스트가 길어도 레이아웃 깨지지 않도록 스크롤 처리

섹션이 비어 있을 경우 graceful fallback 표시

3) Error 상태

필수 요소:

오류 안내 문구

재시도 버튼

닫기 버튼

권장 요소:

가능한 경우 원인 분류 메시지

댓글 수집 실패

AI 응답 오류

네트워크 오류

기본 분석으로 보기(추후)

주의:

"알 수 없는 오류" 한 줄만 보여주고 끝내지 않기

사용자 행동 경로(재시도/닫기) 제공

API 연동 규칙
공통 HTTP 클라이언트

공통 http.ts 사용 권장

timeout/에러 파싱 정책 통일

response body 구조를 일관되게 해석

분석 Job 흐름 (권장)

POST /analysis/jobs

응답으로 jobId 받기

폴링(GET /analysis/jobs/{jobId})

상태에 따라 UI 전환

초기 임시 동기 버전 구현 시에도, 모달 상태 구조는 Job 방식 전환 가능하게 유지

컴포넌트 분리 원칙

하나의 컴포넌트가 너무 많은 책임을 가지지 않도록 분리합니다.

예시 (analysis 도메인):

AnalysisModal (컨테이너/상태 분기)

AnalysisLoadingView

AnalysisSuccessView

AnalysisErrorView

KeywordChipList

AnalysisMetaInfo

스타일 / UI 일관성 규칙

Tailwind 유틸 사용 시 반복 클래스는 공용 컴포넌트/유틸로 추출 검토

카드/모달/버튼 색상 톤 일관성 유지

다크 테마 기반 UI에서 명도 대비 확인

스크롤바/overflow 처리 점검

hover/focus 상태 제공

사용자 액션 UX 규칙

로딩 중 분석 버튼 중복 클릭 방지 (disabled)

재시도 시 상태 초기화 후 요청 시작

닫기 후 재오픈 시 상태 초기화 정책 명확화

권장: 새 분석이면 초기화

캐시 결과면 즉시 success 가능

테스트 체크 포인트 (프론트)

loading → success 전환

loading → error 전환

error → retry → success 전환

결과 텍스트 길이가 긴 경우 레이아웃

추천 키워드 0개/1개/여러 개 케이스

결과 필드 일부 누락 시 fallback 렌더링

문서 연동 규칙

다음 변경 시 반드시 문서 동기화:

분석 결과 UI 필드 변경 → api-contracts.md, ai-analysis.md

상태 추가/변경 → docs/05_ui/states-analysis-modal.md (생성 후)

UX 정책 변경 → CONTEXT_NOTE.md

완료 보고 필수 항목 (프론트 작업)

상태 처리 범위 (loading/success/error)

에러 UX 구현 여부

타입 정의 변경 여부

API 연동 방식 (동기/폴링)

레이아웃/스크롤 처리 내역

테스트 결과
