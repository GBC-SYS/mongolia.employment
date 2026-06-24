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
| 2026-06-16 | `GuideAccordion`에 `openOverride`/`onToggle` props 추가 | 구문집 전용 atom을 별도로 두면서도 기존 컴포넌트 재사용 필요 |
| 2026-06-16 | 구문집 오디오 — MP3 우선, TTS 폴백 구조 | MP3 존재 시 `playAudio()`, 없으면 `speakMongolian()` — 단일 `handleAudio()`로 분기 |
| 2026-06-16 | 가라오케 하이라이팅 — 타임스탬프 없이 균등 분할 | 오디오 duration ÷ 단어 수로 단어당 구간 추정, `setInterval 80ms`로 `currentTime` 폴링 |

---

## Phase 1 — 기반 구축 ✅ 완료

- [x] Next.js 16 + Tailwind v4 + Jotai 프로젝트 초기 세팅
- [x] Glass Morphism 디자인 시스템 정립 (`rgba(255,255,255,0.55)` + `backdropFilter`)
- [x] `BottomNav` — 슬라이딩 pill 디자인, 6탭 (홈/기도편지/가이드북/합창곡/공동기도제목/전도 구문집)
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
- [x] 빠른 진입 카드 (기도편지 / 가이드북 / 합창곡 / 공동기도제목 / 전도 구문집)
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

### 전도 구문집 (`/phrasebook`) — 2026-06-16 추가 (커밋 fe1e79d)
- [x] 4개 섹션: 기본 인사 & 자기소개 / 축복과 사랑의 표현 / 전도팀 복음 용어 / 일상 표현
- [x] 전도팀 복음 용어 섹션 — 번호 있는 10단계 전도 시퀀스
- [x] Jotai atoms 추가: `phrasebookOpenSectionsAtom` (`store/atoms.ts`)
- [x] `GuideAccordion`에 `openOverride`/`onToggle` 선택적 props 추가 (별도 atom 재사용 가능)
- [x] 외부 API 없는 순수 정적 구문집 — 오프라인 동작
- [x] iOS safe-area, Android Chrome `backdrop-filter` 크로스브라우징 규칙 준수

### 전도 구문집 오디오 기능

> 2026-06-16 추가 — MP3 파일 네이밍 규칙: `{섹션키}_{인덱스}.mp3` (예: `gospel_0.mp3`)

- [x] MP3 오디오 재생 — 전도팀 복음 용어 10문장 (`gospel_0.mp3` ~ `gospel_9.mp3`)
- [x] MP3 오디오 재생 — 축복과 사랑의 표현 6문장 (`blessing_0.mp3` ~ `blessing_5.mp3`)
- [x] Web Speech API TTS — MP3 없는 구문(기본 인사·일상 표현) 대상 `mn-MN` 음성 합성
- [x] 가라오케 하이라이팅 — MP3 재생 중 발음 텍스트 단어별 형광 강조 (`setInterval` 80ms)
- [x] TTS 가라오케 — `onboundary` 이벤트 기반 단어별 실시간 강조
- [x] 재생 토글 버그 수정 — `wasPlaying` 캡처로 stale closure 해결
- [x] 캐시 오디오 대응 — `readyState >= 1` 확인 후 `loadedmetadata` 이벤트 조건부 등록
- [x] 언마운트 cleanup — interval + Audio + speechSynthesis 메모리 누수 방지
- [x] `public/audio/phrasebook/` 디렉터리 — MP3 파일 보관 위치

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

> **선교 시작 D-12** (2026-06-16 기준) — 핵심 기능 구현 완료, 최종 QA 단계

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

## 개발 워크플로우 규칙

프로젝트 루트 `CLAUDE.md`의 **"커밋 워크플로우 규칙"** 섹션 참조.  
요약: `code-reviewer` 에이전트 실행 → 수정 → `git-workflow-manager`로 커밋 & 푸시.

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

약 **51+ commits** (2026-06-16 기준, 전도 구문집 fe1e79d 포함)
