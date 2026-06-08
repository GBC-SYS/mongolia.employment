# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ Next.js 버전 주의

이 프로젝트는 **Next.js 16** (breaking changes 포함)을 사용합니다.  
코드 작성 전 `node_modules/next/dist/docs/` 가이드를 읽을 것. 14/15 패턴과 다를 수 있습니다.

---

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
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

## 스타일링

- 색상 팔레트: 그린(`#16A34A`) + 베이지(`#FAFAF5`) 기조 — `globals.css`의 `@theme`에 정의
- 모바일 전용 (375px 기준). 데스크탑 대응 불필요
- 전 페이지 `pb-20` — `layout.tsx`의 `<main>` 에 적용 (하단 네비 높이 확보)
- shadcn 컴포넌트는 `components/ui/`에 수동 작성. 새 컴포넌트 추가 시 `cn()` 유틸 사용

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

## 주요 결정 사항 (히스토리)

| 결정 | 이유 |
|------|------|
| Recoil → Jotai 교체 | Recoil이 React 19 내부 API 호환 불가 (`ReactCurrentDispatcher` 오류) |
| shadcn CLI 대신 수동 작성 | Tailwind v4는 shadcn CLI가 생성하는 config 방식과 충돌 |
| `/guide`, `/prayer-letters` Dynamic 렌더링 | Jotai 클라이언트 컴포넌트의 SSR 충돌 방지 |
| `ClientOnly` 래퍼 도입 | Jotai useAtom 호출 시 서버 사이드 실행 방지 |
