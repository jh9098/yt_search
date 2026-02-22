# api-contracts.md

## 목적
이 문서는 프론트엔드와 백엔드 간 API 계약(Request/Response/Error)을 정의합니다.
핵심 목표는 응답 구조의 일관성과 변경 관리입니다.

이 문서는 구현보다 우선하며, 필드 변경 시 반드시 문서를 먼저/함께 갱신합니다.

---

## 공통 원칙
1. 성공/실패 응답 구조를 일관되게 유지한다.
2. 프론트가 상태 분기 가능한 최소 정보를 항상 제공한다.
3. 내부 구현 세부사항(스택트레이스 등)은 응답에 노출하지 않는다.
4. 버전/메타 정보는 확장 가능하게 둔다.
5. 긴 작업은 `jobId` 기반 상태 조회를 지원한다.

---

## 공통 응답 형식 (권장)

### 성공 응답 (예시)
```json id="mi8h4d"
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_xxx",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}

실패 응답 (예시)
{
  "success": false,
  "error": {
    "code": "ANALYSIS_TIMEOUT",
    "message": "분석 중 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
  },
  "meta": {
    "requestId": "req_xxx",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}

에러 코드 규칙

형식:

DOMAIN_REASON

예:

COMMON_INVALID_REQUEST

ANALYSIS_JOB_NOT_FOUND

ANALYSIS_TIMEOUT

ANALYSIS_OUTPUT_INVALID

ANALYSIS_EXTERNAL_API_ERROR

ANALYSIS_STORAGE_FAILED

원칙:

프론트에서 분기 가능한 수준으로 유지

너무 세세한 내부 에러코드는 서버 로그에서 관리

사용자 메시지는 친절하고 재시도 가능하게 작성

분석 기능 API (MVP 기준)

### D-1 정책 확정 (create/status)
- `POST /api/analysis/jobs`는 요청 유효성 검증 후 `jobId`와 `status`를 반환하는 것을 최소 계약으로 고정합니다.
- `GET /api/analysis/jobs/{jobId}`는 상태 조회 단일 책임으로 유지하고, 진행률 관련 필드는 선택 필드로 둡니다.
- `forceRefresh` 기본값은 `false`이며, `true`일 때만 캐시를 무시하고 재분석 경로를 허용합니다.

A. 분석 Job 생성
POST /api/analysis/jobs

특정 영상에 대한 AI 소재 분석 작업을 생성합니다.
초기 구현은 동기 처리일 수 있으나, 응답 구조는 Job 기반 확장 가능하게 유지합니다.

Request Body
{
  "videoId": "youtube_video_id_or_internal_id",
  "forceRefresh": false
}
Request 필드 설명

videoId (string, required)

분석 대상 영상 식별자

forceRefresh (boolean, optional, default=false)

캐시 결과가 있어도 재분석을 시도할지 여부

#### Request/Response 필수·선택 필드 표

| API | 위치 | 필드 | 타입 | 필수 여부 | 규칙 |
|---|---|---|---|---|---|
| POST /api/analysis/jobs | body | videoId | string | 필수 | 누락/빈값이면 `COMMON_INVALID_REQUEST` |
| POST /api/analysis/jobs | body | forceRefresh | boolean | 선택 | 기본값 `false` |
| POST /api/analysis/jobs | data | jobId | string | 필수 | 생성 또는 재사용된 작업 식별자 |
| POST /api/analysis/jobs | data | status | string | 필수 | `queued / processing / completed / failed` |
| POST /api/analysis/jobs | data | result | object | 선택 | 캐시 즉시반환 정책에서만 포함 |
| POST /api/analysis/jobs | meta | requestId | string | 필수 | 요청 추적 |
| POST /api/analysis/jobs | meta | timestamp | string(date-time) | 필수 | 서버 기록 시각 |

#### forceRefresh 정책 문장 (고정)
- 서버 기본 정책은 `forceRefresh=false` + 캐시 우선 조회입니다.
- `forceRefresh=false`이고 유효 캐시가 있으면 캐시 결과를 재사용하며, `status=completed + result` 즉시반환을 허용합니다.
- `forceRefresh=true`는 (1) 사용자의 명시적 재분석 요청, (2) `analysisVersion` 상향, (3) 직전 실패 작업 재시도 중 하나일 때만 허용합니다.

Success Response (Job 생성됨)
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "queued"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}
Success Response (캐시 결과 즉시 반환 정책 사용 시 - 선택)
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "completed",
    "result": {
      "summary": {
        "majorReactions": "공감/반성/가족 경험 공유 중심의 반응이 많습니다.",
        "positivePoints": "과학적 설명을 통해 개인 경험을 보편적 문제로 이해하게 해준다는 평가가 있습니다.",
        "weakPoints": "해결책이 다소 추상적이라는 반응이 일부 있습니다."
      },
      "contentIdeas": [
        {
          "title": "가족에게 상처 주는 말, 뇌과학으로 이해하고 줄이는 법",
          "description": "댓글에서 드러난 공감 포인트를 바탕으로 구체적 대화 예시와 감정 조절 방법을 제안합니다."
        }
      ],
      "recommendedKeywords": ["가족관계", "뇌과학", "심리", "소통", "감정조절"],
      "meta": {
        "model": "gemini-2.0-flash",
        "analyzedAt": "2026-02-22T12:00:00Z",
        "commentSampleCount": 320,
        "analysisBasis": ["title", "description", "comments"],
        "cacheHit": true,
        "analysisVersion": "v1",
        "schemaVersion": "analysis-result-v1"
      }
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}
Error Response 예시
{
  "success": false,
  "error": {
    "code": "COMMON_INVALID_REQUEST",
    "message": "videoId가 필요합니다."
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}

B. 분석 Job 상태 조회
GET /api/analysis/jobs/{jobId}

분석 작업의 상태를 조회합니다.

Path Params

jobId (string, required)

Success Response - 처리중
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "processing",
    "progress": 65,
    "step": "extracting_keywords",
    "message": "다국어 댓글 통합 분석 및 키워드 추출 중..."
  },
  "meta": {
    "requestId": "req_status_001",
    "timestamp": "2026-02-22T12:00:06Z"
  }
}
상태 필드 설명

status: queued | processing | completed | failed

progress: 0~100 (선택, 없을 수 있음)

step: 내부 단계 키 (선택)

message: UI 표시용 진행 문구 (선택)

#### Status 조회 필드 필수·선택 표

| API | 위치 | 필드 | 타입 | 필수 여부 | 규칙 |
|---|---|---|---|---|---|
| GET /api/analysis/jobs/{jobId} | path | jobId | string | 필수 | 미존재 시 `ANALYSIS_JOB_NOT_FOUND` |
| GET /api/analysis/jobs/{jobId} | data | jobId | string | 필수 | 상태 조회 대상 식별자 |
| GET /api/analysis/jobs/{jobId} | data | status | string | 필수 | `queued / processing / completed / failed` |
| GET /api/analysis/jobs/{jobId} | data | progress | number(0~100) | 선택 | processing 시 권장, 누락 가능 |
| GET /api/analysis/jobs/{jobId} | data | step | string | 선택 | 내부 단계 키, 프론트 하드 의존 금지 |
| GET /api/analysis/jobs/{jobId} | data | message | string | 선택 | 사용자 안내 문구, 누락 가능 |
| GET /api/analysis/jobs/{jobId} | data | result | object | 선택 | `status=completed`일 때 포함 |
| GET /api/analysis/jobs/{jobId} | data | failure | object | 선택 | `status=failed`일 때 포함 |
| GET /api/analysis/jobs/{jobId} | meta | requestId | string | 필수 | 요청 추적 |
| GET /api/analysis/jobs/{jobId} | meta | timestamp | string(date-time) | 필수 | 서버 기록 시각 |

#### progress/step/message 누락 처리 규칙
- `status=queued` 또는 `status=processing`에서도 `progress/step/message`는 누락될 수 있습니다.
- 프론트는 이를 에러로 처리하지 않고 기본 문구(예: "분석을 준비 중입니다.", "분석 진행 중입니다.")를 사용합니다.
- 진행률 바는 `progress` 값이 있을 때만 렌더링하고, `step/message`는 보조 정보로 사용합니다.

Success Response - 완료
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "completed",
    "result": {
      "summary": {
        "majorReactions": "영상 내용에 공감하며 자신의 경험과 연결짓는 댓글이 많습니다.",
        "positivePoints": "뇌과학/심리학적 설명을 통해 문제를 이해하는 데 도움이 되었다는 평가가 있습니다.",
        "weakPoints": "해결책이 추상적이거나 특정 상황에는 적용이 어렵다는 반응이 일부 있습니다."
      },
      "contentIdeas": [
        {
          "title": "가족에게 상처 주는 말, 뇌과학으로 분석하고 줄이는 법",
          "description": "댓글에서 반복된 '화', '가족', '반성' 키워드를 바탕으로 구체적인 대화법과 감정 조절 팁을 제공합니다."
        },
        {
          "title": "가족 유형별 소통법: 왜 우리 가족은 이렇게 다를까?",
          "description": "가족 구성원 성향 차이에 따른 소통 전략을 뇌과학/심리 관점으로 정리합니다."
        }
      ],
      "recommendedKeywords": ["가족관계", "뇌과학", "심리", "소통", "감정조절"],
      "meta": {
        "model": "gemini-2.0-flash",
        "analyzedAt": "2026-02-22T12:00:08Z",
        "commentSampleCount": 320,
        "analysisBasis": ["title", "description", "comments"],
        "languageSummary": ["ko"],
        "cacheHit": false,
        "analysisVersion": "v1",
        "schemaVersion": "analysis-result-v1",
        "warnings": []
      }
    }
  },
  "meta": {
    "requestId": "req_status_001",
    "timestamp": "2026-02-22T12:00:08Z"
  }
}
Success Response - 실패(작업 자체는 완료되었지만 status=failed)
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "failed",
    "error": {
      "code": "ANALYSIS_OUTPUT_INVALID",
      "message": "AI 분석 결과 형식 검증에 실패했습니다. 다시 시도해 주세요."
    }
  },
  "meta": {
    "requestId": "req_status_001",
    "timestamp": "2026-02-22T12:00:08Z"
  }
}
Error Response - 존재하지 않는 Job
{
  "success": false,
  "error": {
    "code": "ANALYSIS_JOB_NOT_FOUND",
    "message": "분석 작업을 찾을 수 없습니다."
  },
  "meta": {
    "requestId": "req_status_404",
    "timestamp": "2026-02-22T12:00:08Z"
  }
}
분석 결과 스키마 (MVP v1 개요)
result.summary

majorReactions (string)

positivePoints (string)

weakPoints (string)

result.contentIdeas

배열 of:

title (string)

description (string)

result.recommendedKeywords

string[]

권장 개수: 0~8

result.meta

model (string)

analyzedAt (ISO string)

commentSampleCount (number, optional)

analysisBasis (string[])

languageSummary (string[], optional)

cacheHit (boolean, optional)

analysisVersion (string)

schemaVersion (string)

warnings (string[], optional)

UI 연동 규칙 (프론트 참고)

프론트는 아래 기준으로 상태를 분기합니다.

POST /analysis/jobs 응답:

status=queued|processing → 로딩 상태 시작 + 폴링

status=completed + result 존재 → 즉시 success 렌더링

GET /analysis/jobs/{jobId} 응답:

status=queued|processing → 로딩 메시지 갱신

status=completed → success 렌더링

status=failed → error 렌더링

HTTP 실패 or success=false → error 렌더링

버전 관리 규칙

API 계약 변경 시 아래를 함께 갱신:

이 문서 (api-contracts.md)

프론트 타입 정의

백엔드 Pydantic 스키마

ai-analysis.md (AI 결과 필드 변경 시)

권장 버전 필드:

analysisVersion

schemaVersion

변경 이력 (간단)
v1

분석 job 생성/조회 API 정의

분석 결과 기본 스키마 정의

로딩/성공/실패 상태 대응 가능한 계약 정의
