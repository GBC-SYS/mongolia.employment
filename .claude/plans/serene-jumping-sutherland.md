# /photos 페이지 구현 계획

## Context
선교팀 전용 사진 갤러리 페이지 추가. "Isaiah 52:7" 비밀번호를 아는 팀원만 접근 가능하며, Synology NAS에 커스텀 Docker API 서버를 올려 사진을 조회·다운로드할 수 있도록 구성한다.

**사용자 선택 사항:**
- NAS 방식: 커스텀 Docker API 서버 (Node.js/Express)
- 인증 방식: 서버사이드 HMAC 토큰 검증
- UI: 2열 그리드 + 전체화면 모달 뷰어

---

## 아키텍처

```
[클라이언트 (iOS/Android)]
        │
        ▼
[Next.js App (Vercel)]
  POST /api/photos/auth           ← 비밀번호 → HMAC 토큰 반환
  GET  /api/photos/list           ← 사진 목록 (토큰 필요)
  GET  /api/photos/image/[name]   ← 이미지 프록시 (토큰 필요)
  GET  /api/photos/download/[name]← 다운로드 프록시 (토큰 필요)
        │
        ▼  (서버 → 서버, X-Api-Key 헤더)
[NAS Docker Container :8080]
  GET  /api/photos                ← 파일 목록 (파일명/크기/날짜)
  GET  /api/photo/:filename       ← 이미지 바이너리 스트리밍
```

---

## 환경변수 추가 (`.env` + Vercel)

| 키 | 설명 |
|----|------|
| `PHOTOS_PASSWORD` | `Isaiah 52:7` |
| `PHOTOS_SECRET` | HMAC 서명용 랜덤 시크릿 (32자 hex) |
| `PHOTOS_NAS_URL` | `http://gospelfix.synology.me:8080` (http 내부 포트, TLS 이슈 회피) |
| `PHOTOS_NAS_API_KEY` | NAS Docker 컨테이너 API 키 (동일 값을 NAS에도 설정) |

---

## 생성할 파일 목록

### 1. NAS Docker 서버 (`nas-docker/`)
> 이 디렉토리를 NAS에 복사해 Docker로 빌드·실행

- `nas-docker/Dockerfile` — Node 20-alpine 기반
- `nas-docker/package.json` — express, cors 의존성
- `nas-docker/server.js` — Express API 서버
  - `GET /api/photos` → 사진 디렉토리 파일 목록 (JSON)
  - `GET /api/photo/:filename` → 파일 스트리밍
  - `X-Api-Key` 헤더로 인증, path traversal 방어
  - 볼륨 마운트: `/volume1/photos` → `/data/photos` (읽기 전용)
  - 허용 확장자: `.jpg .jpeg .png .webp .heic .gif`

### 2. 서버 전용 유틸
- `lib/photos-auth.ts` — HMAC 토큰 검증 유틸
  - 토큰 형식: `base64url(payload).hmac_hex`
  - 페이로드: `{ iat: timestamp }`, TTL 24시간
  - `timingSafeEqual` 비교

### 3. API Routes
- `app/api/photos/auth/route.ts` — POST: 비밀번호 검증 → 토큰 발급
- `app/api/photos/list/route.ts` — GET: NAS 목록 프록시
- `app/api/photos/image/[filename]/route.ts` — GET: 이미지 프록시
- `app/api/photos/download/[filename]/route.ts` — GET: `Content-Disposition: attachment` 포함 다운로드

### 4. 컴포넌트
- `components/PhotoPasswordGate.tsx` — 비밀번호 입력 UI (Glass morphism 카드)
- `components/PhotoGallery.tsx` — 사진 그리드 + 전체화면 모달 뷰어

### 5. 페이지 & 수정
- `app/photos/page.tsx` — `"use client"`, sessionStorage 토큰 확인 후 게이트 or 갤러리
- `store/atoms.ts` — `PhotoMeta` 타입 + 3개 atom 추가 (현재 불필요, 컴포넌트 로컬 state로 충분)
- `app/page.tsx` — 빠른 진입 카드에 "선교 사진" 카드 추가

---

## 토큰 흐름

```
1. POST /api/photos/auth { password }
   └─ 서버: password === process.env.PHOTOS_PASSWORD
   └─ 일치 시 HMAC 토큰 생성 반환
2. 클라이언트: sessionStorage.setItem("photos_token", token)
3. 이후 API 요청: X-Photos-Token: <token> 헤더
4. 서버: verifyPhotosToken() → 만료·서명 검증
5. 401 반환 시: sessionStorage 삭제 → 비밀번호 게이트 재표시
```

---

## UI 세부 사항

### PhotoPasswordGate
- Glass morphism 카드 (기존 `rgba(255,255,255,0.72)` 패턴)
- 자물쇠 아이콘 (`@heroicons/react/24/outline` — 이미 설치됨)
- 비밀번호 입력 + "입장하기" 버튼
- 실패 시 인라인 에러 메시지

### PhotoGallery
- `grid grid-cols-2 gap-3 p-4` 레이아웃
- 이미지: `<img loading="lazy">` (`/api/photos/image/[filename]` URL)
- 전체화면 모달: `fixed inset-0 z-[9999]` (기존 PrayerLetterDetailView 패턴)
- 이전/다음 버튼, 닫기(XMarkIcon), 다운로드(ArrowDownTrayIcon)
- iOS 다운로드: `isIOS()` 감지 후 alert("이미지를 길게 눌러 '사진에 저장'") 안내
- Android/PC: fetch blob → anchor 클릭

### 아이콘 사용
- `@heroicons/react/24/outline`: `CameraIcon`, `LockClosedIcon`, `XMarkIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ArrowDownTrayIcon`
- (CLAUDE.md에는 iconoir-react 명시되어 있으나, package.json에 실제 설치된 것은 `@heroicons/react`이므로 heroicons 사용)

---

## NAS Docker 배포 방법 (README 포함)

Synology DSM → Docker → 이미지 빌드:
```bash
# NAS SSH에서
cd /path/to/nas-docker
docker build -t nas-photos-api .
docker run -d \
  -p 8080:8080 \
  -v /volume1/photos:/data/photos:ro \
  -e API_KEY=<동일한 PHOTOS_NAS_API_KEY> \
  -e ALLOWED_ORIGIN=https://<vercel-url> \
  --name nas-photos-api \
  nas-photos-api
```

---

## 잠재적 이슈 및 대응

| 이슈 | 대응 |
|------|------|
| HEIC 파일 Android/Chrome 미지원 | NAS에서 jpeg만 필터링하거나 `.heic` 제외 옵션 제공 |
| Vercel 무료 응답 크기 / 타임아웃 | 고화질 원본 대신 NAS에서 리사이즈 엔드포인트 추후 추가 가능 |
| sessionStorage Private Mode 에러 | 모든 sessionStorage 접근 `try-catch`로 감싸기 |
| backdrop-filter + fixed 자식 버그 | 모달은 별도 `div`로 분리, 부모에 inline backdrop-filter 미적용 |
| NAS 오프라인 시 502 | PhotoGallery에서 에러 상태 처리 + 재시도 버튼 |

---

## 구현 순서

```
① nas-docker/ 3개 파일 작성
② lib/photos-auth.ts 작성
③ app/api/photos/* 4개 route 작성
④ components/PhotoPasswordGate.tsx
⑤ components/PhotoGallery.tsx
⑥ app/photos/page.tsx
⑦ app/page.tsx 카드 추가
```

---

## 검증 방법

1. **NAS Docker 로컬 테스트**: `node server.js` → `curl -H "X-Api-Key: test" http://localhost:8080/api/photos`
2. **인증 API 테스트**: `curl -X POST /api/photos/auth -d '{"password":"Isaiah 52:7"}'` → token 수신 확인
3. **갤러리 UI**: `yarn dev` → `/photos` 접속 → 비밀번호 입력 → 그리드 표시 → 모달 뷰어 → 다운로드
4. **잘못된 비밀번호**: 401 에러 메시지 표시 확인
5. **토큰 만료 시**: sessionStorage 삭제 + 게이트 재표시 확인
6. **iOS Safari**: 다운로드 alert 분기 확인
