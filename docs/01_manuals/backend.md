# backend.md

## 목적
이 문서는 FastAPI 기반 백엔드 개발 시 일관된 구조, API 품질, 예외 처리, 확장성을 유지하기 위한 작업 규칙을 정의합니다.

이 프로젝트에서 백엔드는 단순 CRUD가 아니라,
검색/분석/AI 호출/캐시/Job 상태 관리의 핵심 역할을 담당합니다.

---

## 기본 원칙
1. **응답 스키마 우선**
2. **입력 검증 필수**
3. **예외 처리 없는 완료 선언 금지**
4. **외부 API 호출에는 timeout 필수**
5. **AI 출력은 검증 후 저장**
6. **긴 작업은 Job 기반 구조를 우선 고려**

---

## 권장 디렉토리 구조 (예시)
```txt id="8p4m0e"
backend/app/
├─ main.py
├─ core/
│  ├─ config.py
│  ├─ logging.py
│  ├─ exceptions.py
│  └─ response.py
├─ domains/
│  ├─ analysis/
│  │  ├─ router.py
│  │  ├─ service.py
│  │  ├─ repository.py
│  │  ├─ schemas.py
│  │  └─ jobs.py
│  ├─ search/
│  ├─ videos/
│  ├─ channels/
│  └─ data_collection/
├─ schemas/        # 공통 응답/에러 스키마 (선택)
├─ db/
│  ├─ session.py
│  ├─ models/
│  └─ migrations/
└─ tests/

계층 분리 원칙
1) Router (입구)

역할:

HTTP 엔드포인트 정의

요청 파라미터 수집

인증/권한 체크 (추후)

Service 호출

응답 스키마 반환

금지:

복잡한 비즈니스 로직 직접 작성

DB 직접 조작

외부 API 직접 호출(가급적 금지)

2) Service (핵심 로직)

역할:

도메인 비즈니스 로직 처리

외부 API 호출 오케스트레이션

예외 분기 처리

캐시/DB 저장/검증 흐름 조합

예:

분석 job 생성

기존 캐시 결과 조회

AI 분석 실행

JSON 스키마 검증 후 저장

3) Repository (데이터 접근)

역할:

DB CRUD / 조회

upsert / 인덱스 기반 조회

쿼리 캡슐화

금지:

비즈니스 판단 로직

프롬프트/AI 로직

4) Schema (Pydantic)

역할:

요청/응답 형식 명시

타입 검증

문서화(API docs) 품질 향상

원칙:

Request / Response / Result / Meta 구분

nullable 필드는 명확히 표현

프론트와 계약된 필드명 유지

API 응답 규칙 (요약)

세부 형식은 api-contracts.md 기준을 따름.

기본 원칙:

성공 응답과 실패 응답 구조를 일관되게 유지

예외가 발생해도 프론트가 처리 가능한 형식으로 반환

내부 에러 상세 stack trace를 사용자 응답에 노출하지 않음

예외 처리 규칙
필수 처리 대상

입력값 누락/형식 오류

외부 API timeout

외부 API rate limit / quota 초과

AI 출력 형식 오류(JSON 파싱 실패, 필드 누락)

DB 저장 실패

캐시 조회 실패 (fallback 처리)

권장 방식

도메인별 커스텀 예외 정의

공통 예외 핸들러에서 에러 응답 변환

사용자 메시지와 내부 로그 메시지 분리



## D-3 정책 확정: 사용자 메시지 vs 내부 로그 메시지 분리 원칙 (고정)

### 1) 분리 원칙
- API 응답 `error.message`는 사용자 행동 유도 문구만 포함합니다.
- 내부 로그는 원인 파악용 상세 정보(외부 API 상태, 검증 실패 필드, trace)를 기록합니다.
- 사용자 응답에는 내부 시스템명, 스택트레이스, 원문 payload를 노출하지 않습니다.

### 2) 코드별 로그/응답 매핑 기준
| 에러 코드 | 사용자 응답 메시지(고정) | 내부 로그 메시지 예시 |
|---|---|---|
| `COMMON_INVALID_REQUEST` | 요청값이 올바르지 않습니다. 입력값을 확인해 주세요. | `COMMON_INVALID_REQUEST: invalid videoId format (requestId=...)` |
| `ANALYSIS_TIMEOUT` | 분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요. | `ANALYSIS_TIMEOUT: Gemini call timed out after 20s (jobId=..., requestId=...)` |
| `ANALYSIS_OUTPUT_INVALID` | 분석 결과 검증에 실패했습니다. 다시 시도해 주세요. | `ANALYSIS_OUTPUT_INVALID: schema validation failed, missing field=contentIdeas (jobId=...)` |
| `ANALYSIS_JOB_NOT_FOUND` | 분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요. | `ANALYSIS_JOB_NOT_FOUND: no job matched by id (jobId=..., requestId=...)` |
| `ANALYSIS_RATE_LIMITED` | 분석 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요. | `ANALYSIS_RATE_LIMITED: upstream quota exceeded (provider=gemini, requestId=...)` |
| `ANALYSIS_UPSTREAM_UNAVAILABLE` | 분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. | `ANALYSIS_UPSTREAM_UNAVAILABLE: provider unavailable status=503 (requestId=...)` |

### 3) 구현 시 주의
- 응답 메시지 변경 시 `api-contracts.md`, `frontend.md`를 같은 세션에 동기화합니다.
- 실패 로그에는 `requestId`, 가능하면 `jobId`를 포함합니다.
- 민감정보(API 키, 토큰, 원문 대량 데이터)는 로그 금지 정책을 유지합니다.
예:

사용자 메시지: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."

내부 로그: Gemini JSON schema validation failed: missing field 'contentIdeas'

외부 API 호출 규칙 (Gemini / YouTube 등)

timeout 설정 필수

재시도 정책 문서화 (무한 재시도 금지)

실패 시 fallback 여부 정의

요청/응답 로그 시 민감정보 마스킹

비용이 드는 호출은 캐시 확인 후 실행

권장 체크 순서:

기존 캐시 결과 조회

forceRefresh 여부 확인

외부 데이터 준비(댓글/메타)

Gemini 호출

JSON 검증/보정

저장 + 결과 반환

AI 분석 Job 처리 원칙 (중요)

초기에는 동기 구현으로 시작 가능하지만, 구조는 Job 확장 가능성을 고려합니다.

권장 흐름

POST /analysis/jobs

분석 요청 생성

이미 캐시 있으면 즉시 completed 결과 반환 가능(정책 선택)

GET /analysis/jobs/{jobId}

상태 조회 (queued, processing, completed, failed)

완료 시 결과 반환

상태 값 예시

queued

processing

completed

failed

진행률 예시 (선택)

progress: 0~100

step: collecting_comments, extracting_keywords, generating_insights, validating_output

## D-4 정책 확정: 캐시/중복 방지 규칙 (고정)

- 동일 영상 + 동일 분석 버전 요청은 재분석보다 캐시 재사용을 우선합니다.
- 기본 캐시 키는 `analysis:{videoId}:{analysisVersion}`를 사용합니다.
- 댓글 변동 기준 분리가 필요할 때만 `analysis:{videoId}:{analysisVersion}:{commentSnapshotHash}` 확장을 허용합니다.

### forceRefresh + TTL 처리 기준
- 기본값은 `forceRefresh=false`이며, 유효 TTL(24시간) 캐시가 있으면 즉시 반환합니다.
- `forceRefresh=true`는 사용자 명시 재분석/버전 상향/직전 실패 재시도에서만 허용합니다.
- `analysisVersion`이 상향되면 기존 TTL과 무관하게 신규 키로 재분석합니다.

### 응답 meta 표기 기준
- `cacheHit=true`: 유효 캐시를 그대로 반환
- `cacheHit=false`: 재분석 결과 반환(캐시 miss/강제갱신 포함)
- `analysisVersion`은 항상 결과와 함께 응답합니다.

예:

cacheHit: true

analysisVersion: "v1"

로깅 규칙
로그에 남길 것

request_id / job_id

endpoint

처리 시간

주요 상태 전환

외부 API 성공/실패 요약

검증 실패 이유

캐시 판단 근거(`cacheKey`, `cacheHit`, `forceRefresh`)

로그에 남기면 안 되는 것

API 키

access token

사용자 민감정보

원문 프롬프트 전체(필요 최소만)

댓글 원문 전체 대량 로그

테스트 규칙 (최소)

백엔드 작업 완료 전 아래 최소 시나리오 확인:

정상 분석 요청

잘못된 videoId 입력

외부 API timeout 시 에러 응답

AI JSON 형식 실패 시 에러/보정 처리

캐시 hit 동작

캐시 miss 동작

변경 시 문서 업데이트 규칙

다음 변경 시 문서를 함께 수정해야 함:

API 응답 필드 변경 → api-contracts.md

분석 결과 필드 변경 → ai-analysis.md + api-contracts.md

캐시 전략 변경 → data.md + CONTEXT_NOTE.md

예외 정책 변경 → api-contracts.md (에러 코드/메시지)

완료 보고 필수 항목 (백엔드 작업)

수정 파일 목록

입력 검증 처리 여부

예외 처리 내역

timeout/retry 설정 여부

응답 스키마 변경 여부

테스트 결과

남은 리스크
