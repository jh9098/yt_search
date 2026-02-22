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

캐시/중복 방지 규칙 (요약)

동일 영상 + 동일 분석 버전이면 재분석 대신 캐시 결과 사용

캐시 키 예시:

video_id + analysis_version

(선택) comment_snapshot_hash 추가

캐시 사용 여부/재분석 여부는 응답 meta에 표시 권장

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
