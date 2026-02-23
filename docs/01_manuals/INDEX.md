# INDEX.md

## 목적
이 폴더는 AI와 사람이 프로젝트를 일관되게 작업하기 위한 "도메인별 매뉴얼" 모음입니다.

긴 문서 1개 대신, 필요한 영역만 읽도록 분리합니다.
AI 작업 시작 시에는 이 파일을 통해 필요한 매뉴얼만 선택해서 읽습니다.

---

## 기본 읽기 순서 (세션 시작 시)
1. `AGENT.md`
2. `docs/00_project/PLAN.md`
3. `docs/00_project/CONTEXT_NOTE.md`
4. `docs/00_project/CHECKLIST.md`
5. 이 파일(`INDEX.md`)
6. 현재 작업과 관련된 매뉴얼 1~2개

---

## 매뉴얼 목록

### 1. `frontend.md`
프론트엔드 작업 규칙
- React/Vite/TS/Tailwind 기준
- 컴포넌트 구조
- 상태 관리 방식
- 모달/로딩/에러 UX 규칙
- API 연동 시 타입/에러 처리 규칙

읽어야 하는 경우:
- UI 구현
- 모달/카드/리스트 수정
- 상태 전환(`loading/success/error`) 구현
- 키워드 칩 클릭/라우팅 연동

---

### 2. `backend.md`
백엔드 작업 규칙
- FastAPI 구조
- 라우터/서비스/스키마 분리
- 입력 검증
- 예외 처리
- timeout/logging 규칙
- 비동기 Job 구조 가이드

읽어야 하는 경우:
- API 추가/수정
- AI 분석 job 생성/상태 조회 구현
- 에러 응답/공통 응답 구조 구현
- 캐시/중복 처리 설계

---

### 3. `data.md`
데이터 모델링 / 캐시 / 수집 / 정합성 규칙
- 테이블 설계 기준
- 시계열 스냅샷 전략
- 캐시 키 전략
- 버전 관리(`analysis_version`, `score_version`)
- 결측값/삭제/중복 처리 원칙

읽어야 하는 경우:
- DB 스키마 설계
- 캐시 구조 정의
- 분석 결과 저장 구조 설계
- 지표/점수 저장 정책 수립

---

### 4. `ai-analysis.md`
AI 소재 분석 기능 전용 매뉴얼
- Gemini 프롬프트 원칙
- 출력 JSON 스키마 원칙
- 사실 요약 vs AI 제안 구분
- 실패/재시도/검증/보정 정책
- 분석 메타데이터 저장 및 표시 기준

읽어야 하는 경우:
- AI 소재 분석 API 구현
- 프롬프트 수정
- JSON 스키마 변경
- 분석 결과 UI 필드 변경

---

### 5. `api-contracts.md`
API 계약 문서 (요청/응답/에러 규약)
- 공통 응답 형식
- 에러 코드 규칙
- 분석 job API 계약
- 결과 스키마 예시
- 버전 변경 규칙

읽어야 하는 경우:
- 프론트-백엔드 연동
- API 추가/변경
- 응답 스키마 조정
- 에러 정책 변경

---

### 6. `security.md` (추후/필수)
보안/운영 관련 규칙
- API 키/토큰 관리
- CORS/권한/로그 마스킹
- 입력값 검증/남용 방지
- 추후 인증/결제 시 체크포인트

읽어야 하는 경우:
- 외부 API 연동
- 배포 설정
- 인증/권한 기능 추가
- 운영 안정화 작업

---

### 7. `qa-checklist.md`
작업 완료 전 셀프 점검 문서
- 요구사항/범위
- 프론트 상태 처리
- 백엔드 예외 처리
- AI/데이터 검증
- 테스트/문서 업데이트 점검

읽어야 하는 경우:
- 모든 작업 종료 직전 (필수)



### 8. `deployment-netlify.md`
Netlify 배포 전용 매뉴얼
- base/build/publish 고정값
- SPA redirect 설정
- Vite 환경변수 규칙
- 배포 실패 로그 대응 포인트

읽어야 하는 경우:
- Netlify 빌드 실패 대응
- 프론트 최초 배포/재배포 설정 점검

---
## 작업 유형별 권장 읽기 조합

### UI 작업 (예: 분석 모달 디자인/상태 구현)
- `frontend.md`
- `api-contracts.md` (API 연동 시)
- `qa-checklist.md`

### 백엔드 API 작업 (예: analysis job API)
- `backend.md`
- `api-contracts.md`
- `ai-analysis.md` (AI 분석 연관 시)
- `qa-checklist.md`

### DB/캐시 작업
- `data.md`
- `backend.md`
- `api-contracts.md`
- `qa-checklist.md`

### AI 분석 결과/프롬프트 작업
- `ai-analysis.md`
- `api-contracts.md`
- `data.md`
- `qa-checklist.md`

---

## 문서 수정 규칙
- 설계 의도 변경 → `docs/00_project/CONTEXT_NOTE.md` 업데이트
- 중요한 결정 변경 → `docs/00_project/DECISIONS.md` 업데이트
- 작업 완료 상태 변경 → `docs/00_project/CHECKLIST.md` 업데이트
- API 응답 변경 → `api-contracts.md` 업데이트
- AI 출력 필드 변경 → `ai-analysis.md` + `api-contracts.md` 동시 업데이트
