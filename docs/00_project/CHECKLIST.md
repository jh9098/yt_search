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
- [ ] 검색 결과 카드 UI 초안
- [ ] "AI 소재 분석" 버튼 클릭 동작
- [ ] 분석 모달 loading 화면 UI
- [ ] 분석 모달 success 화면 UI
- [ ] 분석 모달 error 화면 UI
- [ ] 추천 키워드 칩 UI + 클릭 동작(임시)
- [ ] 분석 메타 영역 UI (모델명/분석 기준/시간)

---

## F. 백엔드 MVP (개발 미시작)
- [ ] FastAPI 프로젝트 기본 구조 생성
- [ ] 공통 응답 스키마 정의
- [ ] 분석 API 엔드포인트(임시/동기 버전 가능) 추가
- [ ] AI 응답 JSON 검증 로직 추가
- [ ] 에러 처리/타임아웃 처리 추가
- [ ] 결과 저장 구조(테이블/파일 mock) 추가

---

## G. Blocked (막힘/확인 필요)
- [ ] 유튜브 데이터 수집 전략 확정 (공식 API vs 기타 방식)
  - 이유: 수집 범위/요금/정책 제약 확정 필요
  - 결정 필요자: 기획/개발 공동
  - 임시 대응: 문서 설계 기준으로만 진행하고 구현은 보류

---

## H. 다음 세션용 1~2시간 단위 작업 후보
- [x] `docs/04_quality/failure-log.md` 생성 및 기록 템플릿 확정
- [x] D 섹션 2단계(정책 확정) 항목 중 D-2 우선 완료
- [x] D 섹션 2단계(정책 확정) 항목 중 D-5 마무리

---

## I. 완료 로그 (요약)

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
