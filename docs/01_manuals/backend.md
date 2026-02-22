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
