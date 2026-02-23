# api-contracts.md

## 목적
이 문서는 프론트엔드와 백엔드 간 API 계약(Request/Response/Error)을 정의합니다.
핵심 목표는 응답 구조의 일관성과 변경 관리입니다.

---

## 공통 응답 규격

### 성공 응답
```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_xxx",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}
```

### 실패 응답
```json
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
```

---

## 에러 코드 규칙
- 형식: `DOMAIN_REASON`
- 예시:
  - `COMMON_INVALID_REQUEST`
  - `ANALYSIS_TIMEOUT`
  - `ANALYSIS_OUTPUT_INVALID`
  - `ANALYSIS_JOB_NOT_FOUND`

### D-3 정책 확정: MVP 필수 에러코드/메시지/재시도 매핑 (고정)
| 에러 코드 | 사용자 메시지(고정) | 재시도 가능 여부 | 프론트 기본 처리 |
|---|---|---|---|
| `COMMON_INVALID_REQUEST` | 요청값이 올바르지 않습니다. 입력값을 확인해 주세요. | 불가 | 인라인 에러 + 재시도 버튼 숨김 |
| `ANALYSIS_TIMEOUT` | 분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |
| `ANALYSIS_OUTPUT_INVALID` | 분석 결과 검증에 실패했습니다. 다시 시도해 주세요. | 가능 | 인라인 에러 + 재시도 버튼 노출 |
| `ANALYSIS_JOB_NOT_FOUND` | 분석 작업을 찾을 수 없습니다. 새로 분석을 시작해 주세요. | 불가 | 토스트 + "새 분석 시작" 버튼 노출 |
| `ANALYSIS_RATE_LIMITED` | 분석 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |
| `ANALYSIS_UPSTREAM_UNAVAILABLE` | 분석 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |


### D-3 확장 정책: `ANALYSIS_RATE_LIMITED`의 `Retry-After` 헤더 (고정)
- `ANALYSIS_RATE_LIMITED`(HTTP 503) 응답에서는 `Retry-After` 헤더를 **초(second) 단위**로 함께 반환합니다.
- MVP 기본값은 `Retry-After: 3` 입니다.
- 프론트는 헤더가 있으면 해당 초 이후 재시도 안내 문구를 우선 사용하고, 헤더가 없으면 기본 재시도 문구를 사용합니다.

### D-3 정책 확정: 코드군별 프론트 분기 기준 (고정)
- `COMMON_*` 입력 검증 계열: 인라인 안내 우선, 사용자 입력 수정 유도, 즉시 재시도 비권장
- `ANALYSIS_TIMEOUT`, `ANALYSIS_RATE_LIMITED`, `ANALYSIS_UPSTREAM_UNAVAILABLE`: 토스트 + 재시도 버튼 동시 제공
- `ANALYSIS_OUTPUT_INVALID`: 결과 화면 내 인라인 에러 우선 + 재시도 제공
- `ANALYSIS_JOB_NOT_FOUND`: 토스트로 알리고 기존 job 폴링 중단 후 새 분석 시작 액션 제공


---

## 검색 API 계약 (YouTube API v3 프록시)

> 원칙: 프론트는 YouTube API를 직접 호출하지 않고, 백엔드(Render) 검색 API를 호출합니다.

### `GET /api/search/videos`

### Query Parameters
- `q` (string, optional): 검색 키워드 (단, `q`와 `channel` 둘 다 비어있으면 400)
- `channel` (string, optional): 채널명/채널 식별자 필터
- `sort` (string, optional): `relevance | views | latest` (기본 `relevance`)
- `period` (string, optional): `24h | 7d | 30d | all` (기본 `7d`)
- `minViews` (number, optional): 최소 조회수 (기본 `0`)

### Success Response (예시)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "videoId": "abc123",
        "title": "샘플 영상",
        "channelName": "샘플 채널",
        "thumbnailUrl": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
        "durationText": "12:34",
        "publishedDateText": "2026-03-12",
        "viewCountText": "12.3만",
        "subscriberCountText": "53.1만",
        "countryCode": "KR",
        "isShortForm": false,
        "hasScript": false,
        "isSubscriberPublic": true,
        "keywordMatchedTerms": ["가족", "대화법"],
        "estimatedRevenueTotalText": null,
        "vphText": null,
        "badgeLabel": null
      }
    ]
  },
  "meta": {
    "requestId": "req_search_001",
    "timestamp": "2026-03-12T10:00:02Z"
  }
}
```

### 필드 제공/Null 정책
- `estimatedRevenueTotalText`, `vphText`, `badgeLabel`는 선택 필드이며 데이터가 없으면 `null`로 내려준다.
- `countryCode`는 채널 국가 정보가 없으면 `"N/A"`로 내려준다.
- `keywordMatchedTerms`는 매칭 결과가 없으면 빈 배열(`[]`)로 내려준다.
- `thumbnailUrl`, `durationText`, `publishedDateText`, `subscriberCountText`는 UI 카드 렌더링 고정 필드로 항상 포함한다.

### 검색 API 에러코드 매핑 (MVP)
| 에러 코드 | 사용자 메시지(고정) | 재시도 가능 여부 | 프론트 기본 처리 |
|---|---|---|---|
| `COMMON_INVALID_REQUEST` | 요청값이 올바르지 않습니다. 입력값을 확인해 주세요. | 불가 | 인라인 에러 + 입력 수정 유도 |
| `SEARCH_QUOTA_EXCEEDED` | 검색 한도에 도달했습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |
| `SEARCH_RATE_LIMITED` | 검색 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |
| `SEARCH_UPSTREAM_UNAVAILABLE` | 검색 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |
| `SEARCH_UPSTREAM_ERROR` | 검색 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. | 가능 | 토스트 + 재시도 버튼 노출 |

### 검색 API 운영 메모
- 쿼리 자동 재호출은 최소화하고 버튼/Enter 트리거 우선 정책을 유지합니다.
- 동일 파라미터 요청은 백엔드 dedupe + 캐시 우선 정책으로 중복 호출을 차단합니다.
- 위 정책은 추후 Firestore 연동 시에도 불필요 read 소모를 줄이기 위한 기본 가드레일입니다.

---

## 1) 분석 Job 생성
### `POST /api/analysis/jobs`

### Request Body
```json
{
  "videoId": "youtube_video_id",
  "forceRefresh": false
}
```

- `videoId` (string, required)
- `forceRefresh` (boolean, optional, default=false)

#### forceRefresh 정책 문장 (고정)
- 서버 기본 정책은 `forceRefresh=false` + 캐시 우선 조회입니다.
- `forceRefresh=false`이고 유효 캐시가 있으면 캐시 결과를 재사용하며, `status=completed + result` 즉시 반환을 허용합니다.
- `forceRefresh=true`는 아래 중 하나일 때만 허용합니다.
  1) 사용자의 명시적 재분석 요청
  2) `analysisVersion` 상향
  3) 직전 실패 작업 재시도

#### D-4 캐시 키/TTL 기준 (고정)
- 기본 캐시 키 포맷: `analysis:{videoId}:{analysisVersion}`
- 선택 확장 키 포맷: `analysis:{videoId}:{analysisVersion}:{commentSnapshotHash}`
- 기본 TTL: 24시간
- `analysisVersion` 상향 시 TTL과 무관하게 신규 키로 재분석합니다.

### Success Response (예시)
```json
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "queued"
  },
  "meta": {
    "requestId": "req_create_001",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}
```

### Error Response (예시)
```json
{
  "success": false,
  "error": {
    "code": "COMMON_INVALID_REQUEST",
    "message": "videoId가 필요합니다."
  },
  "meta": {
    "requestId": "req_create_002",
    "timestamp": "2026-02-22T12:00:00Z"
  }
}
```

---

## 2) 분석 Job 상태 조회
### `GET /api/analysis/jobs/{jobId}`

### Success Response - 처리 중 예시
```json
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
```

### 상태 필드 설명
- `status`: `queued | processing | completed | failed`
- `progress`: `0~100` (선택)
- `step`: 내부 단계 키 (선택)
- `message`: UI 표시용 진행 문구 (선택)

### progress/step/message 누락 처리 규칙 (고정)
- `queued`/`processing` 상태에서도 `progress/step/message`는 누락될 수 있습니다.
- 프론트는 이를 에러로 처리하지 않고 기본 문구(예: "분석을 준비 중입니다.", "분석 진행 중입니다.")를 사용합니다.
- 진행률 바는 `progress`가 있을 때만 렌더링합니다.

### Success Response - 완료 예시
```json
{
  "success": true,
  "data": {
    "jobId": "job_20260222_001",
    "status": "completed",
    "result": {
      "summary": {
        "majorReactions": "영상 내용에 공감하며 자신의 경험과 연결짓는 댓글이 많습니다.",
        "positivePoints": "뇌과학/심리학적 설명이 이해에 도움 되었다는 평가가 있습니다.",
        "weakPoints": "해결책이 추상적이라는 반응이 일부 있습니다."
      },
      "contentIdeas": [
        {
          "title": "가족에게 상처 주는 말 줄이는 대화법",
          "description": "감정 폭발 전 멈춤 신호와 표현 전환 팁 정리"
        }
      ],
      "recommendedKeywords": ["가족관계", "심리", "감정조절"],
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
```

### D-4 응답 `meta.cacheHit` 표기/로그 기준 (고정)
- `cacheHit=true`: 유효 캐시 결과를 반환한 응답
- `cacheHit=false`: 재분석 결과를 반환한 응답(캐시 miss/강제 갱신 포함)
- `cacheHit`은 `status=completed` + `result.meta`에서만 표기합니다.
- `forceRefresh=false` + 동일 `analysis:{videoId}:{analysisVersion}`가 `queued|processing`이면 기존 `jobId`를 반환해 중복 생성을 방지합니다(dedupe).
- `status=queued|processing|failed`에서는 `cacheHit`를 강제하지 않습니다.

권장 로그 필드:
- `requestId` (필수)
- `jobId` (가능하면 포함)
- `cacheKey` (해시/축약 허용)
- `cacheHit`
- `forceRefresh`
- `errorCode`, `retryAfter` (해당 시)

### Success Response - 작업 실패(status=failed) 예시
```json
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
```

### Error Response - 존재하지 않는 Job 예시
```json
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
```

---

## D-2 정책 확정: API 응답 → 프론트 상태 매핑 (고정)

| API 결과 | 프론트 상태 | 분기 규칙 |
|---|---|---|
| `success=true` + `status=queued|processing` | `loading` | 폴링 유지 + 진행 문구 렌더링 |
| `success=true` + `status=completed` + 유효 `result` | `success` | 정상 결과 렌더링 |
| `success=true` + `status=completed` + `result` 비어 있음 | `empty` | 빈 상태 안내 + 재시도 제공 |
| `success=true` + `status=completed` + `result` 일부 누락 | `partial-success` | 사용 가능한 섹션 우선 렌더링 + 누락 안내 |
| `success=true` + `status=failed` | `error` | 에러 안내 + 재시도 제공 |
| HTTP 실패 또는 `success=false` | `error` | 일반 오류 상태로 처리 |

### 프론트 fallback 규칙
- `message` 누락 시: "분석 진행 중입니다." 사용
- `progress` 누락 시: 진행률 바 숨김
- `step` 누락 시: 내부 단계 UI 생략

---

## D-5 정책 확정: 출력 검증/보정 결과의 상태 매핑 (고정)

### 상태 매핑 보강 규칙
- `status=completed`라도 `result.meta.warnings`에 보정 내역이 있으면 프론트는 `partial-success` 분기를 허용합니다.
- `status=failed`는 JSON 파싱 실패, 필수 필드 누락(보정 불가), 재검증 실패, 저장 실패에 사용합니다.
- `status=completed` + `result`가 존재하고 보정 내역이 없으면 `success`로 처리합니다.

### 누락 허용 필드 + API 응답 계약
| 필드 | 누락 허용 여부 | 서버 보정 규칙 | 프론트 렌더링 규칙 |
|---|---|---|---|
| `summary.weakPoints` | 허용 | 기본 문구로 보정 | 보정 문구 그대로 출력 |
| `contentIdeas` | 허용 | 빈 배열 + warning 추가 | 섹션은 유지하되 "아이디어 준비 중" 문구 가능 |
| `recommendedKeywords` | 허용 | 빈 배열 | 키워드 칩 영역 숨김 또는 빈 상태 표시 |
| `meta.warnings` | 허용 | 없으면 빈 배열 생성 | warning 존재 시 상단 안내 배너 표시 |

### `failed` 고정 조건
아래 중 하나라도 충족하면 `status=failed`로 응답합니다.
1. JSON 파싱 실패
2. `summary.majorReactions`, `summary.positivePoints` 등 필수 필드 누락
3. 보정 후 재검증 실패
4. 저장 실패

---

## D-2 정책 확정: 구현 착수 체크리스트 연동
프론트 구현 전 아래 순서로 착수합니다.
1. 상태 enum 정의 (`idle/loading/success/error/empty/partial-success`)
2. 모달 상태 분기 구현
3. API 응답 매핑 함수 구현
4. 재시도 버튼 활성 조건 구현(`error/empty/partial-success`)
5. 로딩 중 버튼 disabled 처리
6. 진행 필드 누락 fallback 적용
7. QA 시나리오 점검(정상/실패/빈데이터/부분성공)

---

## 버전 관리 규칙
API 계약 변경 시 아래를 함께 갱신합니다.
- 이 문서(`api-contracts.md`)
- 프론트 타입 정의
- 백엔드 Pydantic 스키마
- `ai-analysis.md` (AI 결과 필드 변경 시)

권장 버전 필드:
- `analysisVersion`
- `schemaVersion`
