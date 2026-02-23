# CHANGELOG_WORKING.md

## 목적
이 문서는 세션 단위 작업 로그입니다.
- 무엇을 완료했는지
- 무엇이 미완료인지
- 다음 세션에서 무엇부터 시작해야 하는지
를 빠르게 복구하기 위해 사용합니다.

---

## 기록 규칙
- 하루/세션 단위로 기록
- 완료/미완료/막힘/다음 시작점 중심으로 간단히 작성
- 관련 파일 경로를 함께 남기기

---

## 2026-03-01 (D-3 에러 코드/메시지 정책 확정)
### 오늘 목표
- D-3(에러 코드/메시지) 2단계 정책을 완료해 프론트/백엔드 구현 기준 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/api-contracts.md`에 MVP 필수 에러코드 6종 고정
- [x] 코드별 사용자 메시지/재시도 가능 여부 1:1 매핑 표 추가
- [x] 코드군별 프론트 분기 기준(토스트/인라인/재시도 버튼) 고정
- [x] `docs/01_manuals/frontend.md`에 에러 코드군별 UI 처리 기준 동기화
- [x] `docs/01_manuals/backend.md`에 사용자 메시지/내부 로그 분리 원칙 및 코드별 로그 예시 추가
- [x] `docs/00_project/CHECKLIST.md` D-3 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-4(캐시 키 전략) 2단계 정책 확정
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/frontend.md`
- `docs/01_manuals/backend.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-4(캐시 키 전략) 2단계 정책 확정
2. D-5(AI 출력 검증/보정) 2단계 정책 확정
3. 프론트 구현 착수 전 D-3~D-5 표준 문구/분기 규칙 최종 교차검증

### 메모
- 이번 세션은 단일 작업 원칙에 따라 D-3 정책 확정만 수행했고, 실제 프론트/백엔드 코드는 변경하지 않음.

---

## 2026-02-28 (D-2 모달 상태 정책 확정 + 계약 정합화 + 구현 체크리스트 고정)
### 오늘 목표
- D-2의 2/3/4단계를 한 세션에서 완료하고, 프론트 구현 착수 가능한 기준 문서를 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/frontend.md`에 상태별 최소 UI 요소 표(`loading/success/error/empty/partial-success`) 확정
- [x] 로딩 중 중복 클릭 방지(disabled) 규칙 및 상태별 사용자 문구 정책 고정
- [x] `docs/01_manuals/api-contracts.md`에 API 응답→프론트 상태 매핑 규칙 고정
- [x] `progress/step/message` 누락 fallback 처리 규칙 문서화
- [x] 구현 착수 체크리스트(작업순서) + 최소 QA 시나리오(정상/실패/빈데이터/부분성공) 반영
- [x] `docs/00_project/CHECKLIST.md` D-2 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-3(에러 코드/메시지) 2단계 정책 확정
- [ ] D-4(캐시 키 전략) 2단계 정책 확정
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/frontend.md`
- `docs/01_manuals/api-contracts.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-3(에러 코드/메시지) 2단계 정책 확정
2. D-4(캐시 키 전략) 2단계 정책 확정
3. D-5(AI 출력 검증/보정) 2단계 정책 확정

### 메모
- 이번 세션은 문서 정책 확정 작업만 수행했고, React/FastAPI 코드 구현은 의도적으로 수행하지 않음.

---

## 2026-02-27 (D-1 분석 Job API 정책 확정)
### 오늘 목표
- D-1(분석 Job API `create/status`) 2단계 정책 확정 및 문서 기준 고정

### 진행 내용 (완료)
- [x] `docs/01_manuals/api-contracts.md`에 D-1 고정 정책 섹션 추가
- [x] `POST /api/analysis/jobs`, `GET /api/analysis/jobs/{jobId}` 요청/응답 필드 필수·선택 표 추가
- [x] `forceRefresh` 기본값/캐시 무시 조건/허용 조건 정책 문장 고정
- [x] `progress/step/message` 누락 시 프론트 처리 규칙 명시
- [x] `docs/00_project/CHECKLIST.md` D-1 2단계 완료 처리

### 진행 내용 (미완료)
- [ ] D-2(모달 상태) 2단계 정책 확정
- [ ] D-3(에러 코드/메시지) 2단계 정책 확정
- [ ] D-4(캐시 키 전략) 2단계 정책 확정
- [ ] D-5(AI 출력 검증/보정) 2단계 정책 확정

### 변경/생성 파일
- `docs/01_manuals/api-contracts.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-2(모달 상태) 2단계 정책 확정
2. D-3(에러 코드/메시지) 2단계 정책 확정
3. D-4(캐시 키 전략) 2단계 정책 확정

### 메모
- 이번 세션은 단일 작업 원칙에 따라 D-1 문서 정책 확정만 수행함.

---

## 2026-02-26 (failure-log 템플릿 작성 및 매핑 규칙 반영)
### 오늘 목표
- `docs/04_quality/failure-log.md`를 템플릿으로 작성하고, `api-contracts.md` 에러코드 매핑 규칙을 반영

### 진행 내용 (완료)
- [x] `docs/04_quality/failure-log.md` 생성
- [x] incident 필수 필드 표(incident_id, request_id, job_id, error_code, 원인/조치 등) 정의
- [x] `api-contracts.md` 에러코드(`COMMON_INVALID_REQUEST`, `ANALYSIS_TIMEOUT` 등) 매핑 규칙 추가
- [x] 복붙용 기록 템플릿 + 가상 샘플 1건 추가
- [x] `docs/00_project/CHECKLIST.md` 상태 업데이트(C/H/I)

### 진행 내용 (미완료)
- [ ] D 섹션 2단계(정책 확정) 항목 D-1~D-5 실제 완료 처리
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 변경/생성 파일
- `docs/04_quality/failure-log.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. D-1(분석 Job API) 2단계 정책 확정
2. D-2(모달 상태) 2단계 정책 확정
3. D-3(에러 코드/메시지) 2단계 정책 확정

### 메모
- 이번 세션은 문서 작업만 수행했으며 코드 구현/수정은 없음.

---

## 2026-02-25 (CHECKLIST D 섹션 재정리)
### 오늘 목표
- `CHECKLIST.md` D 섹션을 구현 착수 가능한 2단계(문서 확인/정책 확정) 단위로 재구성

### 진행 내용 (완료)
- [x] D 섹션 5개 미완료 항목을 `1단계: 문서 존재/연결 확인` + `2단계: 정책 확정` 구조로 분리
- [x] 각 항목에 근거 문서 경로(`api-contracts.md`, `data.md`, `ai-analysis.md`, `security.md` 등) 명시
- [x] 각 `2단계`에 수용 기준 3개 이상을 추가해 1~2시간 단위 작업으로 분해
- [x] H 섹션 다음 세션 후보를 최신 상태 기준으로 정리

### 진행 내용 (미완료)
- [ ] `docs/04_quality/failure-log.md` 생성
- [ ] D 섹션 2단계(정책 확정) 항목 D-1~D-5 실제 완료 처리
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 변경/생성 파일
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `docs/04_quality/failure-log.md` 작성
2. D-1(분석 Job API) 2단계 정책 확정
3. D-2(모달 상태) 2단계 정책 확정

### 메모
- 이번 세션은 계획/문서 정리 전용으로 수행했으며, 코드 구현은 진행하지 않음.

---

## 2026-02-23 (프로젝트 세팅 / 문서 하니스 구축)
### 오늘 목표
- 코딩 전 문서 하니스(매뉴얼/기억/품질검사) 구조 세팅
- AI 분석 기능의 스키마/계약/운영 규칙 문서화

### 진행 내용 (완료)
- [x] `AGENT.md`, `SKILLS.md` 작성
- [x] `docs/00_project/PLAN.md`, `CONTEXT_NOTE.md`, `CHECKLIST.md`, `DECISIONS.md` 작성
- [x] `docs/01_manuals/*` 핵심 매뉴얼 작성
- [x] `docs/03_prompts/output-schema-analysis.json` 작성
- [x] `docs/03_prompts/examples/analysis-output-sample.json` 작성
- [x] `docs/04_quality/done-report-template.md`, `peer-review-template.md` 작성

### 진행 내용 (미완료)
- [ ] `docs/04_quality/test-cases-mvp.md` 생성
- [ ] `docs/04_quality/failure-log.md` 생성
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 새로 생긴 이슈 / 막힘
- 유튜브 데이터 수집 정책(공식 API 사용 범위/제약) 최종 확정 필요
- 댓글 원문 저장 범위(전체 저장/샘플 저장/해시 저장) 정책 확정 필요

### 변경/생성 파일
- `AGENT.md`
- `SKILLS.md`
- `docs/00_project/PLAN.md`
- `docs/00_project/CONTEXT_NOTE.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/DECISIONS.md`
- `docs/00_project/CHANGELOG_WORKING.md`
- `docs/01_manuals/INDEX.md`
- `docs/01_manuals/frontend.md`
- `docs/01_manuals/backend.md`
- `docs/01_manuals/ai-analysis.md`
- `docs/01_manuals/api-contracts.md`
- `docs/01_manuals/data.md`
- `docs/01_manuals/security.md`
- `docs/01_manuals/qa-checklist.md`
- `docs/03_prompts/output-schema-analysis.json`
- `docs/03_prompts/examples/analysis-output-sample.json`
- `docs/04_quality/done-report-template.md`
- `docs/04_quality/peer-review-template.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `docs/04_quality/test-cases-mvp.md` 작성 (정상/실패/빈데이터/경계값)
2. `docs/04_quality/failure-log.md` 작성 (장애 기록 템플릿)
3. 프론트/백엔드 구현 착수 전, `CHECKLIST.md` D~F 섹션 우선순위 확정

### 메모
- 현재 상태는 "문서 세팅 완료, 개발 코드 미시작"이다.
- CHECKLIST 완료 여부는 문서 생성 완료와 개발 완료를 구분해서 관리해야 혼선이 줄어든다.

---

## 2026-02-22 (문서 정합화)
### 오늘 목표
- CHECKLIST와 CHANGELOG를 실제 파일 상태와 일치시키기

### 진행 내용 (완료)
- [x] `docs/00_project/CHECKLIST.md` 상태를 실제 파일 존재/미존재 기준으로 보정
- [x] `docs/00_project/CHANGELOG_WORKING.md`를 최신 상태 기준으로 재작성

### 진행 내용 (미완료)
- [ ] 품질 문서 2종 (`test-cases-mvp.md`, `failure-log.md`) 작성
- [ ] 코드 구현 작업 시작

### 다음 세션 시작점 (가장 먼저 할 일)
1. 품질 문서 2종 작성
2. 구현 우선순위 확정 후 프론트 또는 백엔드 한 축부터 착수

### 메모
- 개발 시작 전이므로 기능 체크 항목은 대부분 미완료 상태가 정상이다.


## 2026-02-24 (품질 문서 보강 - 테스트 케이스)
### 오늘 목표
- `docs/04_quality/test-cases-mvp.md` 작성 및 계약 정합성 반영

### 진행 내용 (완료)
- [x] `docs/04_quality/test-cases-mvp.md` 생성
- [x] 정상/실패/빈데이터/경계값 4분류 케이스 문서화
- [x] API 계약(`api-contracts.md`)과 스키마(`output-schema-analysis.json`) 필드/에러코드 정합성 반영

### 진행 내용 (미완료)
- [ ] `docs/04_quality/failure-log.md` 생성
- [ ] 실제 프론트/백엔드 코드 구현 시작

### 변경/생성 파일
- `docs/04_quality/test-cases-mvp.md`
- `docs/00_project/CHECKLIST.md`
- `docs/00_project/CHANGELOG_WORKING.md`

### 다음 세션 시작점 (가장 먼저 할 일)
1. `docs/04_quality/failure-log.md` 작성
2. CHECKLIST D 섹션을 구현 착수 가능한 단위로 재정리

### 메모
- 이번 세션은 단일 작업 원칙에 따라 테스트 케이스 문서 작성만 수행함.
