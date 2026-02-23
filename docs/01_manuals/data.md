# data.md

## 목적
이 문서는 데이터 저장/캐시/정합성/버전 관리 규칙을 정의합니다.

이 프로젝트는 단순 조회 앱이 아니라,
유튜브 메타데이터 + 댓글 데이터 + AI 분석 결과를 조합해 재사용하는 구조이므로
초기부터 데이터 규칙을 정해두는 것이 중요합니다.

---

## 핵심 원칙
1. **원본 데이터와 AI 결과를 분리 저장한다**
2. **동일 분석 요청은 캐시 재사용을 우선한다**
3. **버전 필드로 결과 의미를 보존한다**
4. **결측/부분 실패를 구조적으로 허용한다**
5. **나중에 교체 가능한 저장 구조로 설계한다** (파일 mock → DB)

---

## 데이터 계층 개념 (권장)
### 1) 원본/준원본 데이터
- 영상 메타데이터 (제목, 설명, 조회수, 업로드일 등)
- 댓글 데이터 (텍스트, 작성 시점, 좋아요 수 등 가능하면)
- 채널 데이터 (이름, 구독자 수, 공개 여부 등 가능하면)

역할:
- 분석의 재료
- 재분석 시 재사용 가능
- 디버깅/검증 근거

---

### 2) 가공/분석 데이터
- 키워드 추출 결과
- 댓글 요약 결과
- AI 소재 분석 결과 (최종 인사이트 JSON)

역할:
- UI 표시
- 검색/재추천/후속 기능 연결
- 캐시 재사용

---

### 3) 작업 상태 데이터 (Job)
- 분석 요청 상태 (`queued`, `processing`, `completed`, `failed`)
- 진행률 / 단계 메시지
- 실패 코드 / 메시지

역할:
- 프론트 모달 상태 전환
- 비동기 처리 추적
- 장애 분석

---

## 저장 단위 설계 원칙
### 원칙 A: 식별자 중심
가능하면 모든 핵심 레코드는 아래 식별자를 기준으로 연결합니다.
- `videoId` (외부/내부 기준 명확히)
- `jobId`
- `analysisResultId` (선택)
- `channelId` (가능하면)

### 원칙 B: 버전 포함
AI 결과는 시간이 지나면 프롬프트/스키마/로직이 바뀌므로,
반드시 버전 정보를 저장합니다.

권장 필드:
- `analysisVersion`
- `schemaVersion`
- (선택) `promptVersion`
- (선택) `scoreVersion`

---

## 캐시 전략 (중요)

## 캐시의 목적
- 동일 영상 재분석 비용 절감
- 응답 속도 개선
- 사용자 경험 향상
- Gemini API 호출 비용 절감

---

## D-4 정책 확정: 캐시 키 설계 (고정)
기본 캐시 키 포맷은 아래 단일안을 사용합니다.

- `analysis:{videoId}:{analysisVersion}`

선택 확장(댓글 스냅샷 기준 강제 분리 필요 시):
- `analysis:{videoId}:{analysisVersion}:{commentSnapshotHash}`

### 필드 설명
- `videoId`: 분석 대상 식별자
- `analysisVersion`: 분석 로직/프롬프트/필드 구조 버전
- `commentSnapshotHash`: 댓글 스냅샷 변경 감지용 선택 필드

### 고정 원칙
- 기본 인덱싱/조회 기준은 `videoId + analysisVersion`입니다.
- `commentSnapshotHash`는 기본 필수가 아니며, 댓글 변동 반영 요구가 명확할 때만 사용합니다.
- 캐시 키 포맷이 변경되면 이전 키와 자동 호환하지 않고 신규 키 공간으로 분리합니다.

---

## D-4 정책 확정: 캐시 사용/TTL 정책 (고정)
1. `forceRefresh=false` (기본)
   - 유효 캐시가 있으면 즉시 캐시 결과 반환
2. `forceRefresh=true` (예외 허용)
   - 캐시가 있어도 재분석 수행
   - 허용 조건: 사용자 명시 재분석 요청 / `analysisVersion` 상향 / 직전 실패 작업 재시도
3. 캐시 miss
   - 분석 수행 후 결과 저장

### TTL 기본값 (초기 고정)
- 기본 TTL: `24시간`
- `analysisVersion` 상향 시: TTL 만료 전이라도 신규 버전 키로 재생성
- 장애 대응 시(외부 API 불안정): 임시로 TTL을 단축할 수 있으나, 변경 시 `CHANGELOG_WORKING.md`에 사유 기록

### 비용/읽기 소모 관점 메모
- 캐시 우선 조회는 외부 API 호출뿐 아니라 저장소 재조회 횟수도 줄여 비용을 안정화합니다.
- Firestore를 사용할 경우에도 `forceRefresh=false` 기본 정책은 불필요한 문서 read 반복을 줄이는 기본 안전장치로 동작합니다.

응답 meta 표기 기준 (고정):
- `cacheHit: true/false`
- `analysisVersion`
- `schemaVersion`

`cacheHit` 판정 규칙:
- `true`: 유효한 캐시 레코드를 그대로 반환한 경우
- `false`: 재분석 수행 결과를 반환했거나, 캐시가 없거나, 강제 갱신을 수행한 경우

---

## 캐시 무효화 정책 (초기)
초기에는 단순 정책으로 시작합니다.

권장:
- 버전 변경 시 자연 무효화 (`analysisVersion` 변경)
- 강제 재분석 시 갱신
- (선택) 일정 기간 경과 시 재분석 유도

주의:
- 캐시 삭제 정책을 너무 공격적으로 잡으면 비용 증가
- 반대로 너무 오래 유지하면 최신 반응 반영이 늦음

---

## 데이터 정합성 규칙
### 필수 규칙
- 동일 `jobId`는 단일 최종 상태를 가짐
- `completed` 상태의 job은 결과 레코드와 연결 가능해야 함
- `failed` 상태의 job은 실패 코드/메시지 보관 권장
- AI 결과 저장 전 JSON 스키마 검증 완료 필요

### 권장 규칙
- 분석 결과 저장 시 사용된 입력 요약 메타 저장
  - 댓글 샘플 수
  - 분석 기준(title/description/comments)
  - 모델명
  - 분석 시각

---

## 결측값/부분 실패 처리 정책
실제 데이터 수집에서는 누락이 자주 발생합니다. 이를 전제로 설계합니다.

예시:
- 댓글이 없거나 수집 실패 → `commentSampleCount = 0`
- 제목/설명만으로 축소 분석 → `analysisBasis = ["title", "description"]`
- 일부 필드 생성 실패 → `warnings[]`에 기록

원칙:
- 결측 자체를 에러로만 처리하지 말고, 가능한 경우 "부분 성공" 허용
- 단, UI에서 혼동되지 않게 `warnings`, `analysisBasis` 노출 가능하게 설계

---

## 추천 데이터 모델 (개념 수준)

### 1) `analysis_jobs`
역할:
- 작업 상태 추적

권장 필드(개념):
- `job_id`
- `video_id`
- `status`
- `progress` (nullable)
- `step` (nullable)
- `error_code` (nullable)
- `error_message` (nullable)
- `force_refresh`
- `created_at`
- `updated_at`
- `completed_at` (nullable)

---

### 2) `analysis_results`
역할:
- 최종 AI 분석 결과 저장(캐시 재사용 대상)

권장 필드(개념):
- `id`
- `video_id`
- `analysis_version`
- `schema_version`
- `comment_snapshot_hash` (nullable)
- `result_json` (JSON)
- `model_name`
- `comment_sample_count`
- `analysis_basis` (JSON/array)
- `cache_key`
- `created_at`

권장 인덱스:
- `(video_id, analysis_version)`
- 필요 시 `(video_id, analysis_version, comment_snapshot_hash)`

---

### 3) `video_snapshots` (선택/추후)
역할:
- 분석 당시 영상 메타데이터 스냅샷 보관

권장 필드(개념):
- `video_id`
- `title`
- `description`
- `view_count`
- `published_at`
- `duration_sec`
- `channel_id`
- `snapshot_at`

---

### 4) `comment_snapshots` (선택/추후)
역할:
- 댓글 원본/준원본 보관 (비용/정책에 따라 축약 가능)

권장 전략:
- 원문 전체 저장 vs 샘플 저장 vs 해시만 저장
- 초기에는 샘플 일부 + 집계 메타만 저장해도 됨

---

## 파일 저장 → DB 전환 전략 (초기 개발 팁)
초기 MVP에서는 다음 순서 허용:
1. 메모리/파일 mock (`data_samples/`)
2. DB 테이블 설계 확정
3. Postgres 저장 전환

주의:
- mock 구조도 실제 스키마와 최대한 유사하게 유지
- 필드명은 초기에 고정할수록 좋음

---

## 데이터 버전 관리 규칙 (매우 중요)
### 언제 `analysisVersion`을 올릴까?
아래 중 하나라도 바뀌면 버전 증가 검토:
- 프롬프트 구조 변경
- 출력 필드 의미 변경
- 분석 로직/보정 정책 변경
- 입력 데이터 범위 변경 (예: 자막 추가 사용)
- 점수 계산 로직 변경

### 버전 정책 예시
- `v1`: 기본 댓글 요약 + 소재 추천
- `v2`: 자막/댓글 감정 분리 반영
- `v3`: 채널 유형별 맞춤 추천 강화

---

## 데이터 품질 체크리스트 (작업 시)
- [ ] 식별자(`videoId`, `jobId`) 기준이 명확한가?
- [ ] 캐시 키 기준이 문서화되었는가?
- [ ] `analysisVersion`, `schemaVersion` 필드가 포함되었는가?
- [ ] 결측값/부분 실패 시 저장 정책이 있는가?
- [ ] `completed`/`failed` 상태 데이터가 추적 가능한가?
- [ ] 결과 저장 전 JSON 스키마 검증이 수행되는가?

---

## 프론트/백엔드 연동 시 주의사항
- 프론트는 `result.meta.warnings`가 있을 수 있음을 가정해야 함
- `commentSampleCount`는 없거나 0일 수 있음
- `analysisBasis`를 통해 축소 분석 여부를 표시 가능하게 설계
- 캐시 hit 여부(`cacheHit`)는 UI 힌트로만 사용하고 핵심 로직 분기 기준으로 과도하게 의존하지 않기

---

## 변경 시 문서 동기화 규칙
다음 변경 시 함께 수정:
- 결과 JSON 필드 변경 → `ai-analysis.md`, `api-contracts.md`
- Job 상태값 변경 → `api-contracts.md`, 프론트 상태 타입
- 캐시 키 전략 변경 → `CONTEXT_NOTE.md`, `backend.md`
- 버전 증가 정책 변경 → `ai-analysis.md`, `CONTEXT_NOTE.md`

---

## 확실하지 않은 사실 / ChatGPT의 의견
- 확실하지 않은 사실: 실제 댓글 저장 정책(원문 전체 저장 가능 여부)은 사용 데이터 수집 방식/약관/비용 정책에 따라 달라질 수 있음
- ChatGPT의 의견: 초기에는 `analysis_results` 중심으로 시작하고, `comment_snapshots`는 최소 샘플 저장 전략으로 가는 것이 비용/복잡도 균형상 유리함
