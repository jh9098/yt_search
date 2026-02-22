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
- [ ] `docs/04_quality/failure-log.md` 생성

---

## D. AI 소재 분석 설계 (개발 전 문서 기준 정리 단계)
- [x] 분석 결과 JSON 스키마 초안 정의 (`docs/03_prompts/output-schema-analysis.json`)
- [x] 분석 결과 샘플(JSON) 작성 (`docs/03_prompts/examples/analysis-output-sample.json`)
- [ ] 분석 Job API 초안 작성 (`create/status`)를 CHECKLIST 기준 완료 처리 가능한 단위로 재정리
- [ ] 모달 상태 정의 문서 작성 (`loading/success/error`)를 CHECKLIST 기준 완료 처리 가능한 단위로 재정리
- [ ] 에러 코드/메시지 정책을 CHECKLIST 기준 완료 처리 가능한 단위로 재정리
- [ ] 캐시 키 전략 초안(`video_id + analysis_version`)을 CHECKLIST 기준 완료 처리 가능한 단위로 재정리
- [ ] AI 출력 검증/보정 정책을 CHECKLIST 기준 완료 처리 가능한 단위로 재정리

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
- [ ] `docs/04_quality/test-cases-mvp.md` 생성 및 정상/실패/빈데이터/경계값 케이스 작성
- [ ] `docs/04_quality/failure-log.md` 생성 및 기록 템플릿 확정
- [ ] `CHECKLIST.md`의 D 섹션 미완료 항목을 "문서 존재 확인" 기준과 "정책 확정" 기준으로 분리

---

## I. 완료 로그 (요약)
### 2026-02-23
- 완료 항목: 문서 하니스/매뉴얼/핵심 설계 문서 초안 작성
- 메모: 개발 코드는 아직 시작하지 않음

### 2026-02-24
- 완료 항목: `docs/04_quality/test-cases-mvp.md` 작성 (정상/실패/빈데이터/경계값)
- 메모: API 계약/스키마 필드명 및 에러코드 정합성 기준 문서화 완료

### 2026-02-22
- 완료 항목: CHECKLIST/CHANGELOG 상태 정합화 업데이트
- 메모: 실제 파일 존재 여부와 개발 미시작 상태를 분리해 반영
