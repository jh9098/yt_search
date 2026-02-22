# failure-log.md

## 목적
운영/개발 중 발생한 실패(장애, API 오류, 분석 실패)를 일관된 형식으로 기록해,
재현/원인분석/재발방지까지 연결하기 위한 템플릿 문서입니다.

---

## 사용 시점
- 분석 API 호출 실패
- 외부 AI API timeout/응답 이상
- 스키마 검증 실패
- 저장 실패/캐시 불일치
- 사용자에게 반복 노출되는 에러 발생

---

## 상태 규칙
- `new`: 최초 접수
- `investigating`: 원인 분석 중
- `mitigated`: 임시 조치 완료
- `resolved`: 근본 원인 해결 완료
- `retrospective_done`: 회고/재발방지 반영 완료

---

## 필수 기록 필드 (템플릿)
| 필드 | 설명 | 예시 |
|---|---|---|
| incident_id | 장애 식별자(날짜+번호 권장) | `INC-2026-02-26-001` |
| status | 현재 상태(`new` 등) | `investigating` |
| detected_at | 최초 인지 시각(UTC) | `2026-02-26T03:12:00Z` |
| environment | 발생 환경 | `staging` |
| endpoint | 관련 API 경로 | `POST /api/analysis/jobs` |
| request_id | 요청 추적 ID | `req_abc123` |
| job_id | 분석 작업 ID(있으면) | `job_20260226_001` |
| error_code | API 계약 에러코드 | `ANALYSIS_TIMEOUT` |
| user_message | 사용자 노출 메시지 | `분석 중 시간이 초과되었습니다...` |
| internal_message | 내부 원인 메시지 | `Gemini call timed out after 20s` |
| impact | 영향 범위/심각도 | `중간: 일부 사용자 재시도 필요` |
| reproducible | 재현 가능 여부 | `yes` |
| reproduction_steps | 재현 절차 | `1) videoId=... 2) forceRefresh=true ...` |
| suspected_root_cause | 추정 원인 | `외부 API 지연 + timeout 20s` |
| mitigation | 임시 조치 | `timeout 20s -> 30s(임시)` |
| resolution | 근본 해결 | `재시도+백오프 적용` |
| follow_up_tasks | 후속 작업 | `failure test case 추가` |
| owner | 담당자 | `backend` |
| updated_at | 마지막 업데이트 시각 | `2026-02-26T04:00:00Z` |

---

## api-contracts.md 에러코드 매핑 규칙
기준 문서: `docs/01_manuals/api-contracts.md`

### 1) 코드 선택 규칙
1. API 응답 `error.code`와 동일한 값을 기록합니다.
2. 코드가 비어 있으면 `UNKNOWN`으로 임시 기록하고, 24시간 내 표준 코드로 보정합니다.
3. 한 사건에 코드가 여러 개면 **최초 사용자 노출 코드**를 대표 코드로 기록하고, 나머지는 `internal_message`에 병기합니다.

### 2) 코드별 기록 가이드
| error_code | 의미 | 기본 사용자 메시지 방향 | 운영 분류 |
|---|---|---|---|
| `COMMON_INVALID_REQUEST` | 요청값 검증 실패 | 입력값 확인 안내 | 클라이언트 입력/검증 |
| `ANALYSIS_JOB_NOT_FOUND` | jobId 미존재 | 작업 만료/오류 후 재시도 안내 | 데이터 정합성 |
| `ANALYSIS_TIMEOUT` | 분석 시간 초과 | 잠시 후 재시도 안내 | 외부 API/성능 |
| `ANALYSIS_OUTPUT_INVALID` | AI 출력 스키마 불일치 | 일시적 오류 안내 + 재시도 | AI 출력/검증 |
| `ANALYSIS_EXTERNAL_API_ERROR` | 외부 API 호출 실패 | 잠시 후 재시도 안내 | 외부 의존성 |
| `ANALYSIS_STORAGE_FAILED` | 결과 저장 실패 | 재시도 안내 + 내부 복구 진행 | 저장소/DB |

### 3) 메시지 매핑 규칙
- `user_message`는 친절/재시도 가능 중심으로 기록합니다.
- `internal_message`는 원인 파악 가능한 기술 문구(파라미터, timeout, 단계)를 기록합니다.
- 민감정보(API 키/토큰/개인정보)는 절대 기록하지 않습니다.

---

## 기록 템플릿 (복붙용)
```md
## INCIDENT: INC-YYYY-MM-DD-XXX
- status:
- detected_at:
- environment:
- endpoint:
- request_id:
- job_id:
- error_code:
- user_message:
- internal_message:
- impact:
- reproducible:
- reproduction_steps:
- suspected_root_cause:
- mitigation:
- resolution:
- follow_up_tasks:
- owner:
- updated_at:
```

---

## 샘플 1건 (가상)
## INCIDENT: INC-2026-02-26-001
- status: resolved
- detected_at: 2026-02-26T03:12:00Z
- environment: staging
- endpoint: POST /api/analysis/jobs
- request_id: req_abc123
- job_id: job_20260226_001
- error_code: ANALYSIS_TIMEOUT
- user_message: 분석 중 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.
- internal_message: Gemini call timed out after 20s during summarize step.
- impact: 중간 (재시도 시 대부분 복구)
- reproducible: yes
- reproduction_steps: 1) forceRefresh=true 2) 댓글 많은 영상 요청 3) timeout 재현
- suspected_root_cause: 외부 API 응답 지연 대비 timeout 값이 낮음
- mitigation: timeout 임시 상향(20s→30s)
- resolution: 재시도(최대 2회) + 백오프 적용
- follow_up_tasks: timeout 관련 실패 케이스를 `test-cases-mvp.md`에 추가
- owner: backend
- updated_at: 2026-02-26T04:00:00Z

---

## 문서 동기화 규칙
아래 변경 시 함께 갱신합니다.
- 에러코드 추가/변경: `docs/01_manuals/api-contracts.md`
- 보안/로그 정책 변경: `docs/01_manuals/security.md`
- 체크 상태 변경: `docs/00_project/CHECKLIST.md`
- 세션 로그 반영: `docs/00_project/CHANGELOG_WORKING.md`
