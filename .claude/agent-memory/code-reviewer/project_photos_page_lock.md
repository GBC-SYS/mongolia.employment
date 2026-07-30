---
name: /photos 페이지 비밀번호 잠금 + localStorage 언락 패턴
description: app/photos/page.tsx의 useSyncExternalStore 기반 hydration-safe localStorage 언락 상태 관리 구조
type: project
---

`app/photos/page.tsx`는 `PhotoPasswordGate`(비밀번호 입력) → `PhotoCarousel`(본문) 사이를 게이팅하는 컴포넌트로, 새로고침 시 매번 비밀번호를 다시 묻던 버그(2026-07-30 이전)를 `localStorage["mongol-photos-unlocked"] === "true"` 영속 저장으로 수정했다.

**구조:**
```ts
const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
const [manuallyUnlocked, setManuallyUnlocked] = useState(false);
if (!mounted) return null;
if (!manuallyUnlocked && !readUnlocked()) { return <PhotoPasswordGate onSuccess={...} />; }
return <PhotoCarousel />;
```
`components/ClientOnly.tsx`와 완전히 동일한 `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` 시그니처를 인라인으로 재구현한 것 — SSR에서는 `getServerSnapshot()`(false)과 첫 클라이언트 하이드레이션 렌더가 일치하므로 hydration mismatch 없음(React의 `useSyncExternalStore` 공식 동작). `readUnlocked()`는 `mounted`가 true로 확정된 이후에만 호출되므로 SSR 크래시(`localStorage is not defined`) 위험도 없음. 2026-07-30 리뷰에서 검증 완료.

`localStorage.getItem`/`setItem` 모두 try-catch로 감싸져 있어 iOS Safari Private Mode의 `SecurityError`에 안전(CLAUDE.md 크로스브라우징 규칙 준수). `setItem` 실패 시에도 `manuallyUnlocked` 로컬 state로 현재 세션 동안은 계속 언락 상태 유지(우아한 저하).

**Why:** 이 페이지는 Jotai를 쓰지 않으므로 `export const dynamic = "force-dynamic"`이나 `<ClientOnly>` wrapper가 CLAUDE.md 규칙상 강제되진 않지만, 로직상 `ClientOnly.tsx`와 100% 동일한 마운트 감지 코드를 파일 내에 중복 작성한 상태(DRY 위반, 2026-07-30 🟡로 지적). CLAUDE.md의 "라우트 인벤토리" 표에도 `/photos`가 아직 추가되지 않음(문서 갱신 필요, 규칙에 명시된 항목).

**How to apply:** 다음 리뷰 시 (1) `<ClientOnly>` 재사용 리팩터링 여부, (2) CLAUDE.md 라우트 인벤토리 표에 `/photos` 추가 여부를 확인. localStorage 언락 상태는 만료 없이 영속되는 설계(로그아웃/재잠금 기능 없음) — 의도된 동작으로 보이나 요구사항 변경 시 재확인 필요. `PHOTOS_PASSWORD`가 `NEXT_PUBLIC_` 환경변수라 클라이언트 번들에 이미 노출되어 있으므로, localStorage 언락 플래그 자체는 새로운 보안 취약점이 아님(원래도 클라이언트 사이드 소프트락).
