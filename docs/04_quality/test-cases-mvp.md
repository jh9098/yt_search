# test-cases-mvp.md

## 목적
MVP 단계에서 AI 소재 분석 기능의 품질을 빠르게 검증하기 위한 테스트 케이스 문서입니다.

- 분류: 정상 / 실패 / 빈데이터 / 경계값
- 기준 문서:
  - `docs/01_manuals/api-contracts.md`
  - `docs/03_prompts/output-schema-analysis.json`
- 검증 대상 핵심:
  - API 계약 필드/상태값 일치 (`success`, `data`, `error`, `meta`, `status`)
  - UI 상태 전환 일치 (`loading` / `success` / `error`)
  - 로그 추적 가능성 (`requestId`, `jobId`, 에러코드)

---

## 작업 범위 제한 (이번 문서 작업에서 하지 않는 것)
- 프론트 UI 컴포넌트 코드 수정 금지
- 프론트 훅/상태관리 코드 수정 금지
- 백엔드 API 함수/스키마 코드 수정 금지
- DB/캐시 구현 변경 금지
- 이 문서는 "테스트 설계"만 다루며, 실제 자동화 테스트 스크립트 구현은 제외

---

## 공통 확인 규칙

### API 계약 확인
- 성공 응답 기본 형태
  - `success: true`
  - `data: { ... }`
  - `meta.requestId`, `meta.timestamp` 존재
- 실패 응답 기본 형태
  - `success: false`
  - `error.code`, `error.message` 존재
  - `meta.requestId`, `meta.timestamp` 존재
- Job 상태값
  - `queued | processing | completed | failed`

### 분석 결과 스키마 확인
- 최상위 필수 필드
  - `summary`, `contentIdeas`, `recommendedKeywords`, `meta`
- `summary` 필수 필드
  - `majorReactions`, `positivePoints`, `weakPoints`
- `meta` 필수 필드
  - `model`, `analyzedAt`, `analysisBasis`, `analysisVersion`, `schemaVersion`

### UI 상태 확인
- `loading`: 분석 진행 표시, 중복 요청 방지 UI(버튼 disabled 등)
- `success`: 결과 렌더링 + 추천 키워드 표시
- `error`: 사용자 안내 문구 + 재시도 동선 제공

### 로그 확인 포인트
- 모든 요청/응답에서 `requestId` 추적 가능해야 함
- Job 흐름에서는 `jobId` 추적 가능해야 함
- 실패 시 `error.code`가 계약된 코드 형식(`DOMAIN_REASON`)인지 확인

---

## 1) 정상 케이스

### N-01: 분석 Job 생성 성공 (초기 queued)
- 입력 조건
  - `POST /api/analysis/jobs`
  - Body: `{ "videoId": "video_001", "forceRefresh": false }`
- 기대 API 응답
  - HTTP 200
  - `success: true`
  - `data.jobId` 문자열 존재
  - `data.status`가 `queued` 또는 정책상 `completed`
  - `meta.requestId`, `meta.timestamp` 존재
- 기대 UI 상태
  - 요청 직후 `loading`
  - 상태 조회 후 `processing/queued`면 `loading` 유지
  - 완료 시 `success` 전환
- 확인 로그 포인트
  - request 로그에 `requestId` 존재
  - job 생성 로그에 `jobId` 존재

### N-02: 상태 조회 성공 후 completed 결과 수신
- 입력 조건
  - `GET /api/analysis/jobs/{jobId}`
- 기대 API 응답
  - HTTP 200
  - `success: true`
  - `data.status: completed`
  - `data.result.summary.majorReactions` 존재
  - `data.result.summary.positivePoints` 존재
  - `data.result.summary.weakPoints` 존재
  - `data.result.contentIdeas` 배열
  - `data.result.recommendedKeywords` 배열
  - `data.result.meta.model`, `analyzedAt`, `analysisBasis`, `analysisVersion`, `schemaVersion` 존재
- 기대 UI 상태
  - 폴링 중 `loading`
  - 완료 응답 수신 후 `success`
- 확인 로그 포인트
  - 상태 조회 로그에 `requestId`, `jobId`
  - 완료 로그에 결과 스키마 검증 통과 표시

### N-03: 캐시 히트로 completed 즉시 반환
- 입력 조건
  - 동일 `videoId` 재요청, `forceRefresh=false`
- 기대 API 응답
  - HTTP 200
  - `success: true`
  - `data.status: completed`
  - `data.result.meta.cacheHit: true` (정책 사용 시)
- 기대 UI 상태
  - 짧은 `loading` 또는 즉시 `success`
- 확인 로그 포인트
  - 캐시 히트 로그(키: `video_id + analysis_version`) 확인

---

## 2) 실패 케이스

### F-01: 잘못된 입력(videoId 누락)
- 입력 조건
  - `POST /api/analysis/jobs`
  - Body: `{ "forceRefresh": false }`
- 기대 API 응답
  - HTTP 4xx
  - `success: false`
  - `error.code: COMMON_INVALID_REQUEST`
  - `error.message` 사용자 친화 문구
  - `meta.requestId`, `meta.timestamp`
- 기대 UI 상태
  - `loading` 진입 후 `error`
  - 재시도 또는 입력 보완 동선 노출
- 확인 로그 포인트
  - validation 실패 로그 + `requestId`

### F-02: 존재하지 않는 Job 조회
- 입력 조건
  - `GET /api/analysis/jobs/job_not_exists`
- 기대 API 응답
  - HTTP 404 또는 정책된 실패 코드
  - `success: false`
  - `error.code: ANALYSIS_JOB_NOT_FOUND`
- 기대 UI 상태
  - `error` 상태 + "다시 요청" 유도
- 확인 로그 포인트
  - 조회 실패 로그에 `jobId`, `requestId`

### F-03: 외부 AI 타임아웃
- 입력 조건
  - 분석 중 외부 모델 호출 지연(시뮬레이션)
- 기대 API 응답
  - `success: false` 또는 job `failed`
  - `error.code: ANALYSIS_TIMEOUT`
- 기대 UI 상태
  - `loading`에서 `error` 전환
  - 재시도 가능 안내
- 확인 로그 포인트
  - timeout 로그(민감정보 제외), `requestId`, `jobId`

### F-04: AI 출력 스키마 불일치
- 입력 조건
  - 모델 응답에서 필수 필드 누락/타입 오류
- 기대 API 응답
  - `success: false` 또는 job `failed`
  - `error.code: ANALYSIS_OUTPUT_INVALID`
- 기대 UI 상태
  - `error` 전환 + 일시적 오류 안내
- 확인 로그 포인트
  - 스키마 검증 실패 필드명 기록
  - 보정(fallback) 시도 여부 기록

---

## 3) 빈데이터 케이스

### E-01: 댓글 수집 결과 0건
- 입력 조건
  - 유효한 `videoId`이나 댓글 샘플 0건
- 기대 API 응답
  - 정책 A: 분석 수행 후 `completed` + `commentSampleCount: 0`
  - 정책 B: `failed` + 명시 코드(정책 확정 필요)
- 기대 UI 상태
  - 정책 A면 `success` + "데이터가 적어 정확도 제한" 안내
  - 정책 B면 `error` + 재시도/다른 영상 유도
- 확인 로그 포인트
  - 수집량 로그(`commentSampleCount=0`)
  - fallback 경로 진입 여부

### E-02: contentIdeas/recommendedKeywords 빈 배열
- 입력 조건
  - 분석 결과에서 아이디어/키워드 생성 실패
- 기대 API 응답
  - `completed` 허용 시, 빈 배열 유지
  - 필수 필드 자체는 존재
- 기대 UI 상태
  - `success`
  - 빈 상태 안내 문구(예: "추천 항목이 아직 없습니다")
- 확인 로그 포인트
  - 부분 성공(partial success) 처리 로그

---

## 4) 경계값 케이스

### B-01: videoId 최소/최대 길이 경계
- 입력 조건
  - 허용 최소 길이, 최대 길이 경계값으로 요청
- 기대 API 응답
  - 허용 범위: 성공 흐름
  - 범위 초과: `COMMON_INVALID_REQUEST`
- 기대 UI 상태
  - 유효 입력은 `loading -> success`
  - 무효 입력은 `error`
- 확인 로그 포인트
  - 입력 검증 경계 테스트 로그

### B-02: summary 텍스트 길이 경계
- 입력 조건
  - `summary.*` 필드가 스키마 `minLength=1`, `maxLength=1000` 경계
- 기대 API 응답
  - 경계 내 값 통과
  - 초과/미만 시 `ANALYSIS_OUTPUT_INVALID`
- 기대 UI 상태
  - 통과 시 `success`
  - 실패 시 `error`
- 확인 로그 포인트
  - 스키마 길이 검증 결과 로그

### B-03: recommendedKeywords 최대 항목 수
- 입력 조건
  - 배열 12개(허용 최대), 13개(초과)
- 기대 API 응답
  - 12개: 통과
  - 13개: `ANALYSIS_OUTPUT_INVALID`
- 기대 UI 상태
  - 통과 시 `success`
  - 실패 시 `error`
- 확인 로그 포인트
  - 배열 길이 검증 로그

### B-04: analysisVersion 패턴 경계
- 입력 조건
  - `v1`(정상), `1`, `version1`(비정상)
- 기대 API 응답
  - 정상 패턴(`^v[0-9]+$`)만 허용
  - 비정상은 `ANALYSIS_OUTPUT_INVALID`
- 기대 UI 상태
  - 정상 `success`
  - 비정상 `error`
- 확인 로그 포인트
  - 버전 패턴 검증 로그

---

## 계약 정합성 체크 결과 (문서 작성 시점)
- API 에러코드 참조: `COMMON_INVALID_REQUEST`, `ANALYSIS_JOB_NOT_FOUND`, `ANALYSIS_TIMEOUT`, `ANALYSIS_OUTPUT_INVALID`
- Job 상태 참조: `queued`, `processing`, `completed`, `failed`
- 스키마 필수 필드/제약 참조:
  - `summary.majorReactions/positivePoints/weakPoints`
  - `meta.model/analyzedAt/analysisBasis/analysisVersion/schemaVersion`
  - `recommendedKeywords.maxItems=12`
  - `analysisVersion` 패턴 `^v[0-9]+$`

---

## 실행/검증 메모
- 본 문서는 구현 전 검증 기준 문서이며, 실제 테스트 실행 결과는 `docs/04_quality/failure-log.md` 또는 향후 테스트 리포트에 누적한다.
- 미확정 정책(댓글 0건 처리 방식)은 DECISIONS 또는 API 계약 문서에서 확정 후 본 문서를 동기화한다.
