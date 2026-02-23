# deployment-netlify.md

## 목적
Netlify에서 프론트엔드(현재 `frontend` 폴더)를 안정적으로 빌드/배포하기 위한 최소 설정 가이드입니다.

## 이번 장애 원인 요약
- Netlify 빌드 로그에서 `frontend/package.json`을 찾지 못해 `npm run build`가 실패했습니다.
- 즉, **빌드 루트(`frontend`)에는 Node 프로젝트 파일이 반드시 있어야** 합니다.

## 저장소 기준 고정 설정
저장소 루트 `netlify.toml` 기준:

- `base = "frontend"`
- `command = "npm run build"`
- `publish = "dist"`

또한 SPA 라우팅(새로고침 404 방지)을 위해 아래 redirect를 사용합니다.

- `/* -> /index.html (200)`

## Netlify UI에서 확인할 값
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

> `netlify.toml`을 사용하면 UI 값과 불일치할 때 혼란이 생길 수 있으므로, 가능하면 **UI 값도 동일하게 맞춰 주세요.**

## 환경변수 규칙 (Vite)
- 프론트에서 사용될 변수는 `VITE_` 접두사가 필요합니다.
- 이 프로젝트의 Render 백엔드 주소: `https://yt-search-mytn.onrender.com`
- 권장값: `VITE_API_BASE_URL=https://yt-search-mytn.onrender.com/api`

### Netlify 환경변수 설정 순서 (초보자용)
1. Netlify 대시보드에서 해당 사이트 선택
2. **Site configuration** → **Environment variables** 이동
3. **Add a variable** 클릭
4. Key에 `VITE_API_BASE_URL` 입력
5. Value에 `https://yt-search-mytn.onrender.com/api` 입력
6. 저장 후 **Deploys** 탭에서 **Trigger deploy** → **Deploy site** 실행
7. 배포 완료 후 브라우저 개발자도구 Network에서 요청 URL이
   `https://yt-search-mytn.onrender.com/api/...` 로 나가는지 확인

> 현재 프론트 코드는 환경변수가 비어 있어도,
> 로컬(`localhost`)에서는 `http://localhost:8000/api`,
> 그 외(예: Netlify 도메인)에서는 `https://yt-search-mytn.onrender.com/api`를 기본 사용하도록 되어 있습니다.
> 다만 운영 안정성을 위해 Netlify 환경변수를 명시적으로 설정하는 방식을 권장합니다.

## 점검 명령어 (로컬)
```bash
cd frontend
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

## Cloud Firestore 읽기 소모 주의
Netlify 배포 설정 자체는 Firestore 읽기 비용을 증가시키지 않습니다.
다만 프론트 코드에서 아래 패턴은 읽기 소모를 늘릴 수 있습니다.

- 페이지 진입 시 중복 `getDocs()` 실행
- 화면 전환 시 동일 쿼리 재요청
- 불필요한 `onSnapshot()` 장시간 구독

배포 전 체크:
- 1회성 화면은 `getDocs` 1회 + 로컬 상태/캐시 재사용
- 실시간이 꼭 필요하지 않으면 polling 주기를 길게 설정
- 쿼리 범위를 좁히고 pagination 적용
