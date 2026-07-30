---
name: 핀치 줌 비활성화(app/layout.tsx viewport) — iOS Safari 미적용 사실
description: root layout viewport에 maximumScale/userScalable 추가해도 iOS Safari 일반 탭에서는 핀치 줌이 계속 동작함(iOS 10+ 접근성 오버라이드), WCAG 1.4.4 트레이드오프도 함께 기록
type: project
---

`app/layout.tsx`의 `export const viewport`에 `maximumScale: 1`, `userScalable: false`를 추가해 핀치 줌(확대/축소)을 막으려는 시도가 있었다(2026-07-30).

**핵심 사실 — iOS Safari는 iOS 10부터 일반 브라우저 탭에서 `user-scalable=no`/`maximum-scale`을 접근성 이유로 무시한다.** 즉 이 meta 태그만으로는 iOS Safari(카카오톡 인앱 브라우저가 아닌, 일반 사파리 탭으로 열었을 때)에서 핀치 줌을 막을 수 없다. 반면:
- Android Chrome: 정상적으로 핀치 줌이 막힘.
- 홈 화면에 추가한 PWA(standalone 모드, `public/manifest.json`의 `"display": "standalone"` + `appleWebApp.capable: true`로 이 프로젝트도 해당)나 카카오톡 인앱 브라우저 등 "embedded web view"는 일반 Safari 탭과 달리 이 meta 태그를 그대로 존중해 줌이 막힐 수 있음(플랫폼에 따라 편차).

**Why:** 사용자가 "모바일에서 핀치 줌 안 되게 해달라"고 요청했을 때, 코드는 정확히 작성됐고 빌드 산출물의 meta 태그도 올바르지만, CLAUDE.md의 주 타겟 브라우저(iOS Safari, Android Chrome, 카카오톡 인앱)에서 실제 동작이 브라우저/실행 방식(일반 탭 vs 홈 화면 추가 앱)에 따라 갈린다는 점은 코드만 봐서는 드러나지 않는 플랫폼 지식이다. 또한 이 설정은 WCAG 1.4.4(Resize Text, AA)의 잘 알려진 실패 패턴(저시력 사용자의 화면 확대 수단 차단)이라 접근성 트레이드오프로 남는다.

**How to apply:** 이후 이 프로젝트에서 viewport/줌 관련 변경을 리뷰할 때: (1) "핀치 줌을 막았다"는 주장이 나오면 반드시 iOS Safari 일반 탭 기준으로는 아직 줌이 가능하다는 점을 확인시킬 것(치명적 버그는 아니지만 기대와 실제가 다를 수 있음을 반드시 고지). (2) 이 변경이 `app/layout.tsx`(전역 적용)에 있으므로 스와이프 제스처가 있는 `/photos` 외의 페이지(기도편지, 가이드북, 구문집 등 텍스트 위주 페이지)에도 동일하게 적용된다는 점 — 접근성 다운사이드만 있고 실익이 없는 페이지까지 전역 적용되는 게 의도인지 확인 권장(스코프를 `/photos` 페이지 자체의 `viewport` export로 좁히는 것도 Next.js App Router에서 가능). (3) CLAUDE.md "주요 결정 사항" 표에 이 트레이드오프를 기록할지 여부 확인.
