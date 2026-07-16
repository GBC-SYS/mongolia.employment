---
name: Glass Morphism 스타일 패턴
description: 프로젝트에서 glass morphism 인라인 스타일을 다루는 방식 — 페이지 파일에는 const glass 상수 패턴이 있으나 컴포넌트 파일에는 혼용 중
type: project
---

glass morphism 스타일(`background: rgba(255,255,255,0.55)`, `backdropFilter`, `WebkitBackdropFilter`)은 프로젝트 전반에서 인라인 스타일로 적용되며, Tailwind v4 @theme에는 별도 변수로 등록되어 있지 않다.

페이지 파일(`app/page.tsx`, `app/song/page.tsx`, `app/prayer-letters/page.tsx`)은 파일 상단에 `const glass = { ... } as React.CSSProperties` 상수를 정의하고 `style={glass}`로 재사용하는 패턴을 사용한다.

컴포넌트 파일(`components/ImageViewer.tsx`)에는 이 패턴이 적용되지 않고 jsx 내 인라인 객체 리터럴로 직접 삽입되어 있어 일관성 부재 및 매 렌더마다 객체 재생성 문제가 있다.

`app/song/page.tsx`는 파일 상단에 `const glass`를 정의했음에도 일부 요소에는 인라인 객체 리터럴을 그대로 사용하는 혼용 패턴이 존재한다 — 리뷰 시 지적 포인트.

**Why:** glass 상수를 별도로 분리하지 않으면 매 렌더마다 동일한 스타일 객체가 새로 생성되어 불필요한 리렌더링 가능성이 있고, 값 변경 시 여러 곳을 수정해야 하는 유지보수 문제가 생긴다.

**How to apply:** 컴포넌트/페이지 파일에서 glass 스타일을 발견하면 파일 상단 상수 추출 여부를 확인하고, 인라인 객체 리터럴이 있으면 상수 참조 방식으로 변경 제안한다.
