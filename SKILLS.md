# SKILLS.md

## 기술 스택 (초기 기준)
### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- (선택) TanStack Query
- (선택) Zustand

### Backend
- FastAPI
- Pydantic
- SQLAlchemy (선택)
- Alembic (선택)
- PostgreSQL
- Redis (캐시/큐)

### AI
- Gemini API (우선 사용)
- JSON 스키마 기반 출력 강제

---

## 코딩 스타일 규칙

### 공통
- 의미 있는 이름 사용 (축약 남발 금지)
- 하드코딩 최소화
- 매직 스트링/매직 넘버 최소화
- 예외 상황 처리 우선
- TODO 남길 때는 이유와 후속 작업 기록

### 프론트엔드
- 컴포넌트는 단일 책임 원칙 유지
- UI 상태(`loading/success/error`)를 명시적으로 분리
- API 응답 타입을 TypeScript 인터페이스로 정의
- null/undefined 대응 필수
- 긴 모달/패널은 스크롤 영역 분리
- 사용자 액션 버튼은 disabled/로딩 상태 제공

### 백엔드
- API 응답 형식 통일 (성공/실패 구조)
- 요청/응답 스키마를 Pydantic으로 명시
- 입력값 검증 필수
- 예외를 삼키지 말고 적절한 에러 응답 반환
- 외부 API 호출은 timeout 설정
- 로그는 민감정보 마스킹
- 동일 분석 요청은 캐시/중복 방지 고려

### 데이터/AI 분석
- AI 출력은 JSON 스키마 검증 필수
- 필드 누락 시 기본값 처리 정책 문서화
- "사실 기반 요약"과 "AI 제안" 구분
- 분석 메타데이터(모델명, 기준 데이터 수, 분석 시각) 저장 권장
- score/지표는 버전 관리 권장 (`score_version` 등)

---

## API 설계 규칙 (요약)
- 엔드포인트는 도메인 중심으로 분리
- 성공/에러 응답 구조 일관성 유지
- 에러 코드/메시지 형식 통일
- 비동기 작업은 `jobId` 기반 상태 조회 구조 우선 검토
- 긴 작업은 동기 처리보다 job/polling 방식 선호

---

## 네이밍 규칙
### 파일/폴더
- 소문자 + 필요 시 하이픈/언더스코어 일관성 유지
- 도메인 기반 폴더 구조 사용 (search, analysis 등)

### 프론트 타입
- `XxxResponse`, `XxxRequest`, `XxxState`, `XxxResult`

### 백엔드 스키마
- `XxxCreateRequest`, `XxxJobStatusResponse`, `XxxAnalysisResult`

---

## 금지/주의 패턴
- any 남발 (TS)
- 응답 타입 없이 fetch/axios 사용
- try/catch 없이 외부 API 호출
- 에러 발생 시 UI 무반응
- schema 없는 AI 자유출력 그대로 저장
- 체크리스트/문서 업데이트 누락
- 기존 기능을 건드리면서 영향 범위 설명 없이 수정

---

## 작업 단위 기준 (권장)
한 번의 작업은 다음 중 1개 수준으로 제한:
- UI 상태 1개 구현 (예: analysis modal loading)
- API 1개 추가 (예: create analysis job)
- 테이블 1개 설계/추가
- 스키마 1개 정의
- 문서 1개 업데이트

큰 작업은 반드시 분해해서 진행합니다.
