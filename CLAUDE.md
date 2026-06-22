# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ Next.js 버전 주의

이 프로젝트는 **Next.js 16** (breaking changes 포함)을 사용합니다.  
코드 작성 전 `node_modules/next/dist/docs/` 가이드를 읽을 것. 14/15 패턴과 다를 수 있습니다.

---

## ⚠️ 커밋 워크플로우 규칙

코드 변경 후 커밋 전에 **반드시 아래 순서를 따를 것.**

1. `code-reviewer` 에이전트 실행 → 이슈 확인 및 수정
2. 수정 완료 후 `git-workflow-manager` 에이전트로 커밋 & 푸시

> code-reviewer 없이 커밋하면 안 됨. 리뷰 결과를 받은 후 지적 사항을 실제 파일에 반영한 뒤 커밋할 것.

---

## ⚠️ 패키지 매니저

이 프로젝트는 **yarn**을 사용합니다. `npm` 대신 반드시 `yarn`을 사용할 것.

```bash
yarn add <package>     # 패키지 설치
yarn remove <package>  # 패키지 제거
```

---

## 명령어

```bash
yarn dev      # 개발 서버 (http://localhost:3000)
yarn build    # 프로덕션 빌드
yarn lint     # ESLint 실행
```

---

## 프로젝트 개요

**몽골 선교 2026** — 몽골 단기선교팀(2026년 6월 28일~7월 4일)을 위한 **모바일 전용** 웹앱.  
팀 내부(일정/가이드 확인)와 외부 후원자(기도편지 열람) 모두 사용. 백엔드 없음.

---

## 기술 스택

| 항목 | 라이브러리 | 비고 |
|------|-----------|------|
| 프레임워크 | Next.js 16 + React 19 | App Router, TypeScript |
| 스타일링 | Tailwind CSS v4 | `tailwind.config.ts` 없음, CSS `@theme` 방식 |
| UI 컴포넌트 | shadcn/ui (수동 작성) | `components/ui/` — Tailwind v4 호환 버전 |
| 아이콘 | iconoir-react | SVG 아이콘, `width/height/strokeWidth` props |
| 상태 관리 | **Jotai** | Recoil 대체 (React 19 호환) |

---

## 파일 구조

```
app/
  layout.tsx                # 루트 레이아웃: JotaiProvider(RecoilProvider.tsx) + BottomNav
  page.tsx                  # 홈: 카운트다운, 선교 일정, 빠른 진입 카드 [Static]
  prayer-letters/page.tsx   # 기도편지: 2열 그리드 + 전체화면 뷰어 [Dynamic]
  guide/page.tsx            # 가이드북: 날씨/체크리스트/안전수칙/긴급연락처 [Dynamic]
  globals.css               # Tailwind @import + @theme 커스텀 색상 정의

components/
  BottomNav.tsx             # 하단 고정 네비게이션 (usePathname 활성탭)
  Countdown.tsx             # D-day 카운트다운 — 출발일 2026-06-28 기준
  ImageViewer.tsx           # 기도편지 그리드 + 전체화면 모달
  GuideAccordion.tsx        # 아코디언 — Jotai guideOpenSectionsAtom
  Checklist.tsx             # 준비물 체크리스트 — Jotai + localStorage
  ClientOnly.tsx            # Jotai 컴포넌트 SSR 방지 래퍼 (mounted 상태 체크)
  RecoilProvider.tsx        # Jotai <Provider> 래퍼 (이름은 Recoil이지만 내부는 Jotai)
  ui/
    button.tsx              # shadcn Button (variant: default/outline/ghost/destructive)
    card.tsx                # shadcn Card, CardHeader, CardTitle, CardContent
    badge.tsx               # shadcn Badge

store/
  atoms.ts                  # Jotai atoms 정의

lib/
  utils.ts                  # cn() — clsx + tailwind-merge

data/
  prayer-letters.ts         # PrayerLetter[] 정적 배열 (수동 관리)
  guide-content.ts          # 가이드북 전체 정적 데이터

public/
  images/prayer-letters/    # 기도편지 이미지 파일 저장 위치
```

---

## 라우팅 & 렌더링 전략

### 결정 규칙

새 페이지 작성 시 아래 규칙으로 렌더링 전략을 결정할 것.

| 조건 | 전략 | 필수 선언 |
|------|------|----------|
| Jotai `useAtom` 사용 | Dynamic | `export const dynamic = "force-dynamic"` |
| `"use client"` + 로컬 state만 사용 | Client Component | 선언 불필요 (Next.js 자동 처리) |
| 서버 데이터 + `generateStaticParams` | Static SSG | `generateStaticParams()` export |
| 순수 정적 데이터만 표시 | Static | 선언 불필요 |

### 라우트 인벤토리

| 경로 | 파일 | 렌더링 | 비고 |
|------|------|--------|------|
| `/` | `app/page.tsx` | Static | 카운트다운, 빠른 진입 카드 |
| `/prayer-letters` | `app/prayer-letters/page.tsx` | Dynamic | Jotai `selectedLetterAtom` |
| `/prayer-letters/[id]` | `app/prayer-letters/[id]/page.tsx` | Static SSG | `generateStaticParams` |
| `/guide` | `app/guide/page.tsx` | Dynamic | Jotai `guideOpenSectionsAtom`, `checklistAtom` |
| `/qt` | `app/qt/page.tsx` | Dynamic | Jotai 사용 |
| `/group-prayer` | `app/group-prayer/page.tsx` | Dynamic | Jotai 사용 |
| `/phrasebook` | `app/phrasebook/page.tsx` | Dynamic | Jotai 사용 |
| `/cuesheet` | `app/cuesheet/page.tsx` | Client | `"use client"` + `useState` |
| `/song` | `app/song/page.tsx` | Client | `"use client"` + `useRouter` |

> 새 라우트 추가 시 이 표를 반드시 업데이트할 것.

---

## 상태 관리 (Jotai)

> **Recoil은 React 19와 호환 불가** (`__SECRET_INTERNALS` API 제거됨). Jotai로 대체.  
> API 차이: `atom({ key, default })` → `atom(default)` / `useRecoilState` → `useAtom`

### atoms (`store/atoms.ts`)

```ts
selectedLetterAtom      // 기도편지 전체화면에서 선택된 이미지 id (string | null)
guideOpenSectionsAtom   // 가이드북 섹션 열림 상태 { weather, checklist, safety, emergency }
checklistAtom           // 체크리스트 체크 상태 Record<string, boolean>
                        // → localStorage "mongol-checklist" 키에 동기화
```

### SSR 충돌 방지 규칙

- Jotai `useAtom`을 쓰는 컴포넌트는 반드시 `<ClientOnly>`로 감쌀 것
- 해당 컴포넌트를 포함하는 페이지(`/guide`, `/prayer-letters`)는 `export const dynamic = "force-dynamic"` 필수

---

## 코드 스타일 규칙

### 스타일링

- 색상 팔레트: 그린(`#16A34A`) + 베이지(`#FAFAF5`) 기조 — `globals.css`의 `@theme`에 정의
- 모바일 전용 (375px 기준). 데스크탑 대응 불필요
- 전 페이지 `pb-20` — `layout.tsx`의 `<main>` 에 적용 (하단 네비 높이 확보)
- shadcn 컴포넌트는 `components/ui/`에 수동 작성. 새 컴포넌트 추가 시 `cn()` 유틸 사용

### Glass Morphism 패턴

프로젝트 전체에서 유리 질감 UI를 일관되게 사용한다. 새 컴포넌트 작성 시 아래 패턴을 따를 것.

```tsx
// 배경 (카드, 오버레이 등)
style={{
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",  // iOS Safari 필수
  borderColor: "rgba(255, 255, 255, 0.8)",
}}
```

- `backdropFilter`와 `WebkitBackdropFilter`는 **반드시 쌍으로** 작성 (iOS Safari 15 이하 대응)
- `backdrop-filter`를 인라인 style로 쓸 경우, 해당 요소가 `position: fixed` 자식의 **조상**이 되면 안 됨 → Tailwind `lg:` 반응형 클래스로 분리하거나 구조 변경

### Tailwind v4 작성 규칙

- `tailwind.config.ts` 없음. 커스텀 색상/값은 `globals.css`의 `@theme {}` 블록에 정의
- arbitrary property: `[property:value]` 문법 사용 (예: `[scrollbar-width:none]`)
- 반응형 arbitrary: `lg:[property:value]` 형태로 작성

---

## 크로스 브라우징 규칙 (iOS Safari / Android Chrome)

이 앱의 주 타겟은 **iOS Safari**와 **Android Chrome** 모바일 브라우저다.  
카카오톡 인앱 브라우저, 삼성 인터넷 브라우저에서도 동작해야 한다.

### ❌ 금지 패턴

| 패턴 | 이유 | 대안 |
|------|------|------|
| `position: fixed` 조상에 `backdrop-filter` / `transform` / `filter` 인라인 적용 | Android Chrome에서 fixed 자식의 containing block이 뷰포트가 아닌 해당 조상이 됨 | `lg:` 클래스로 데스크탑 전용 적용 |
| `fetch` + `<a>.click()` 파일 다운로드 | iOS Safari 보안 정책으로 완전 차단 | iOS 감지 후 alert 안내로 분기 |
| `window.history.length`로 이전 페이지 여부 판단 | 카카오 인앱 브라우저 등에서 신뢰 불가 | `document.referrer`로 same-origin 확인 |
| `localStorage` 예외처리 없이 직접 접근 | iOS Safari Private Mode에서 `SecurityError` | try-catch로 감싸기 |

### ✅ 필수 패턴

**safe-area (노치/홈바 대응)**

`layout.tsx`에 `export const viewport = { viewportFit: "cover" }` 가 선언되어 있어야 `env(safe-area-inset-*)` 값이 0이 아닌 실제 값을 반환한다.

```tsx
// 하단 고정 요소 (BottomNav 등)
style={{ paddingBottom: "env(safe-area-inset-bottom)" }}

// 상단 고정 오버레이 닫기 버튼 등
style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
```

**iOS 감지**

```tsx
const isIOS = () =>
  typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
```

**뒤로가기 (인앱 브라우저 안전)**

```tsx
const isSameOrigin =
  document.referrer && new URL(document.referrer).origin === window.location.origin;
if (isSameOrigin) { router.back(); } else { router.replace("/이전경로"); }
```

**외부 SDK 초기화 전 호출 방어**

```tsx
if (!window.Kakao?.isInitialized()) {
  alert("준비 중입니다. 잠시 후 다시 시도해 주세요.");
  return;
}
```

---

## 아이콘 사용 현황 (iconoir-react)

| 컴포넌트 | 아이콘 |
|---------|--------|
| BottomNav | `Home`, `Mail`, `Book` |
| Countdown | `Calendar` |
| ImageViewer | `Mail` (빈 상태), `Xmark` (닫기) |
| GuideAccordion | `NavArrowDown` |
| Checklist | `Check` |
| guide/page.tsx | `Phone`, `WarningTriangle` |
| app/page.tsx | `Mail`, `Book`, `Calendar` |

---

## 기도편지 이미지 추가 방법

1. 이미지 파일을 `public/images/prayer-letters/` 폴더에 저장
2. `data/prayer-letters.ts` 배열에 항목 추가:

```ts
{ id: "1", src: "/images/prayer-letters/파일명.jpg", title: "1차 기도편지", date: "2026년 6월" }
```

---

## 배포 (Vercel)

- **플랫폼**: Vercel Hobby (무료) — GitHub `GBC-SYS/mongolia.employment` public 레포 연결
- **CI/CD**: `main` 브랜치 push 시 자동 배포
- **Node.js**: `package.json`의 `engines` 필드에 `>=20.0.0` 명시 (Vercel 빌드 환경 고정)

### 환경변수

| 키 | 설명 | 위치 |
|----|------|------|
| `NEXT_PUBLIC_KAKAO_APP_KEY` | 카카오 JavaScript SDK 키 | Vercel 대시보드 + `.env.local` |

- 로컬: 프로젝트 루트에 `.env.local` 파일 생성 후 위 키 추가
- Vercel: 대시보드 → 프로젝트 → Settings → Environment Variables에 등록

### 카카오 공유 도메인 등록

`components/KakaoShareButton.tsx` — 카카오 공유 버튼 구현체  
공유 기능이 동작하려면 [카카오 Developers](https://developers.kakao.com) → 앱 → **플랫폼** → Web 사이트 도메인에 배포 URL 등록 필수.  
(도메인 미등록 시 "잘못된 요청으로 인증에 실패" 오류 발생)

---

## 주요 결정 사항 (히스토리)

| 결정 | 이유 |
|------|------|
| Recoil → Jotai 교체 | Recoil이 React 19 내부 API 호환 불가 (`ReactCurrentDispatcher` 오류) |
| shadcn CLI 대신 수동 작성 | Tailwind v4는 shadcn CLI가 생성하는 config 방식과 충돌 |
| `/guide`, `/prayer-letters` Dynamic 렌더링 | Jotai 클라이언트 컴포넌트의 SSR 충돌 방지 |
| `ClientOnly` 래퍼 도입 | Jotai useAtom 호출 시 서버 사이드 실행 방지 |
| GitHub 레포 public 전환 | Vercel Hobby 플랜은 GitHub Organization private 레포 배포 불가 |
| `package.json` engines 필드 추가 | Vercel 빌드 환경 Node.js 버전 불일치로 인한 설치 실패 방지 |
