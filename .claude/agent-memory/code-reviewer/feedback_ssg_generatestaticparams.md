---
name: SSG 페이지 generateStaticParams 누락 패턴
description: SW additionalPrecacheEntries에 등록된 동적 라우트 페이지에 generateStaticParams가 없으면 Static이 아닌 Dynamic으로 빌드되어 precache 전략과 충돌함
type: feedback
---

`/prayer-letters/[id]` 같은 동적 라우트를 SW `additionalPrecacheEntries`에 등록할 때 해당 페이지에 `generateStaticParams()`가 없으면 Dynamic 렌더링이 되어 오프라인에서 HTML을 제공받을 수 없다.

**Why:** Serwist precache는 빌드 타임에 생성된 HTML 파일을 캐시한다. Dynamic 렌더링 페이지는 빌드 산출물로 HTML 파일이 없어 precache가 동작하지 않는다.

**How to apply:** SW `additionalPrecacheEntries`에 `/경로/[id]` 패턴을 추가할 때는 반드시 해당 페이지에 `generateStaticParams()`가 선언되어 있는지 확인할 것. 없으면 함께 추가해야 한다.
