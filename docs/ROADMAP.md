# 몽골 선교 2026 — 프로젝트 로드맵

> **선교 기간**: 2026년 6월 28일(일) ~ 7월 4일(토)  
> **플랫폼**: 모바일 전용 웹앱 (iOS Safari / Android Chrome)  
> **배포**: Vercel Hobby — `main` 브랜치 push 시 자동 배포

---

## 프로젝트 목적

강남중앙침례교회 2026 나감 2000 단기선교팀을 위한 내부용 가이드 + 외부 후원자(기도편지 열람) 통합 앱.  
백엔드 없이 정적 데이터 중심으로 운영하되, 기도 카운트·기도응답은 Upstash Redis로 실시간 처리.

---

## 주요 아키텍처 결정 히스토리

| 날짜 | 결정 | 이유 |
|------|------|------|
| 초기 | Recoil → **Jotai** 교체 | Recoil이 React 19 내부 API(`ReactCurrentDispatcher`) 호환 불가 |
| 초기 | shadcn CLI → **수동 작성** | Tailwind v4는 shadcn CLI 생성 config 방식과 충돌 |
| 초기 | `/guide`, `/prayer-letters` **force-dynamic** | Jotai `useAtom`의 SSR 충돌 방지 |
| 초기 | `ClientOnly` 래퍼 도입 | Jotai 컴포넌트 서버 사이드 실행 방지 |
| 초기 | GitHub 레포 **public** 전환 | Vercel Hobby 플랜은 Organization private 레포 배포 불가 |
| 중기 | iconoir-react → **heroicons** 마이그레이션 | BottomNav 슬라이딩 pill 디자인 적용, 아이콘 품질 개선 |
| 중기 | **Upstash Redis** 도입 | 기도 하트(카운트) + 기도응답 저장 — 서버리스 환경에 적합 |
| 중기 | **Pretendard** 고정 웨이트 9종 전체 적용 | next/font/local, public/fonts 경로, 한국어 줄바꿈 개선 |

---

## Phase 1 — 기반 구축 ✅ 완료

- [x] Next.js 16 + Tailwind v4 + Jotai 프로젝트 초기 세팅
- [x] Glass Morphism 디자인 시스템 정립 (`rgba(255,255,255,0.55)` + `backdropFilter`)
- [x] `BottomNav` — 슬라이딩 pill 디자인, 5탭 (홈/기도편지/가이드북/합창곡/공동기도제목)
- [x] `ClientOnly` + `RecoilProvider(Jotai)` SSR 방지 구조
- [x] shadcn 수동 컴포넌트: `Button`, `Card`, `Badge`
- [x] Vercel 배포 파이프라인 (CI/CD, 환경변수 설정)
- [x] Pretendard 폰트 적용 (100~900 전 웨이트)

---

## Phase 2 — 핵심 기능 구현 ✅ 완료

### 홈 페이지 (`/`)
- [x] D-Day 카운트다운 (출발일 2026-06-28 기준)
- [x] 이사야 52:7 성경 말씀 카드
- [x] 선교 일정 (6/28~7/4)
- [x] 빠른 진입 카드 (기도편지 / 가이드북 / 합창곡 / 공동기도제목)
- [x] OG 썸네일 이미지 설정 (`thumbnail2.webp`)
- [x] 카카오 공유 버튼 (`KakaoShareButton`)

### 기도편지 (`/prayer-letters`)
- [x] 기도편지 그리드 (2열, `ImageViewer`)
- [x] 기도편지 상세 페이지 (`/prayer-letters/[id]`) — 전체화면 뷰어
- [x] 이미지 저장 버튼 (iOS 감지 후 분기 처리)
- [x] 기도응답 기능 (`PrayerAnswerSection`) — Upstash Redis 저장
- [x] 기도 하트 버튼 (`PrayerHeartButton`) — Redis 카운트 실시간 반영
- [x] 기도편지 이미지 031장 등록 (`001~031.webp`)

### 가이드북 (`/guide`)
- [x] 아코디언 UI (`GuideAccordion`) — Jotai `guideOpenSectionsAtom`
- [x] 날씨 / 체크리스트 / 안전수칙 / 긴급연락처 섹션
- [x] 체크리스트 `localStorage` 동기화 (`checklistAtom`)
- [x] 체크리스트 의약품 섹션 안내문 분리

### 합창곡 (`/song`)
- [x] 한·몽 대역 가사 (한국어 / 몽골어 / 발음)

### 공동 기도제목 (`/group-prayer`)
- [x] 10개 공동 기도제목 목록
- [x] 후원 계좌 복사 버튼 (카카오뱅크, iOS Private Mode 대응)

---

## Phase 3 — 크로스 브라우징 및 품질 개선 ✅ 완료

- [x] iOS Safari `safe-area-inset` 대응 (노치/홈바)
- [x] iOS 이미지 저장 실패 → alert 안내 분기
- [x] Android Chrome `position: fixed` + `backdrop-filter` 충돌 해결
- [x] 카카오 인앱 브라우저 뒤로가기 버그 수정 (`document.referrer` 기준)
- [x] 기도편지 상세 뷰어 Android 오버레이 전체화면 버그 수정
- [x] 카카오 SDK 초기화 전 호출 방어 처리

---

## Phase 4 — 선교 기간 대응 🔄 진행 예정

> **선교 시작 D-12** (2026-06-16 기준)

- [ ] 기도편지 이미지 추가 (선교 기간 중 실시간 업로드 대응)
- [ ] 선교 현지 소식 업데이트 방안 검토 (정적 데이터 vs 동적)
- [ ] 트래픽 급증 대비 확인 (Vercel Hobby 한도: 월 100GB 대역폭)
- [ ] 최종 QA — 실기기 iOS/Android 검증

---

## Phase 5 — 선교 이후 아카이빙 📋 계획

- [ ] 선교 종료 후 D-Day 카운트다운 → 감사 메시지로 교체
- [ ] 기도응답 데이터 백업 (Redis → JSON export)
- [ ] 사역 결과 페이지 추가 검토
- [ ] 레포 archive 처리 또는 다음 선교 시즌을 위한 템플릿화

---

## 크리티컬 이슈 트래커

> 작업 중 발견된 중요 이슈를 여기에 기록. 해결 시 ✅ 표시.

| 날짜 | 이슈 | 상태 | 비고 |
|------|------|------|------|
| — | — | — | 현재 크리티컬 이슈 없음 |

---

## 환경변수 체크리스트

| 키 | 로컬 (`.env.local`) | Vercel |
|----|---------------------|--------|
| `NEXT_PUBLIC_KAKAO_APP_KEY` | ✅ | ✅ |
| `KV_REST_API_URL` | ✅ | ✅ |
| `KV_REST_API_TOKEN` | ✅ | ✅ |

---

## 총 커밋 수

약 **50 commits** (2026-06-16 기준)
