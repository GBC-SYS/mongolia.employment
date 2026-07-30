---
name: PhotoCarousel Swiper loop 동기화 패턴
description: components/PhotoCarousel.tsx의 확대뷰-배경캐러셀 상태 동기화, Swiper v14 loop/virtual/autoplay, Tailwind v4 @layer가 swiper/css(unlayered)에 밀려 SwiperSlide 크기 클래스가 무력화되는 캐스케이드 레이어 충돌 이슈
type: project
---

`components/PhotoCarousel.tsx`(`/photos` 페이지, 785장 정적 이미지, Jotai 미사용 — 로컬 `useState`만 사용하므로 `ClientOnly`/`dynamic` 불필요)는 Swiper(`swiper: ^14.0.6`)를 `loop: true`로 사용하는 메인 캐러셀과, 탭하면 열리는 전체화면 확대 모달(`enlargedIndex: number | null` 기반)로 구성된다.

핵심 동기화 함수 `showEnlarged(index)`는 `setEnlargedIndex` + `setActiveIndex` + `swiperRef.current?.slideToLoop(index, 0, false)`를 함께 호출해 확대뷰/카운터("X / Y")/배경 캐러셀 위치 3곳을 동시에 맞춘다. `openEnlarged`는 `showEnlarged`를 재사용(수정 완료 확인됨, 2026-07-29). 확대 모달의 좌/우 이동 버튼도 `w-11 h-11`(44px, 수정 완료).

785장 슬라이드는 `modules={[Autoplay]}`만 사용하고 `Virtual` 모듈을 쓰지 않아, Swiper가 슬라이드 785개 전부를 DOM에 렌더링한다(각 슬라이드에 Next `<Image fill unoptimized>` 포함). 저사양 모바일에서 초기 렌더/스크립팅 부하 우려로 2026-07-29 리뷰에서 🟡로 지적.

**2026-07-30 수정 완료 확인: `Virtual` 모듈 도입 + `<Image>` unoptimized 제거.** iOS Safari에서 785장(410MB, 장당 500~700KB webp) 전체 DOM 마운트 + 원본 고화질 디코딩으로 인한 탭 크래시("문제가 반복적으로 발생했습니다") 버그 수정. 적용: `modules={[Autoplay, Virtual]}` + `virtual` prop 추가(현재 인덱스 근처만 DOM 렌더링), 메인/확대뷰 두 `<Image>` 모두 `unoptimized` 제거 + `sizes` prop 추가.

**Virtual + loop + centeredSlides + slidesPerView="auto" + autoplay 조합 안전성 — `node_modules/swiper` 소스 레벨로 검증(2026-07-30, swiper 14.0.6):**
- `swiper-react.mjs`의 `initSwiper()`에서 `instance.params.virtual?.enabled`이면 `virtual.slides`를 React children 배열로 자동 오버라이드하고 `renderExternal: setVirtualData`(React state 갱신 콜백)를 자동 주입함. 즉 `<Swiper virtual>` + `photos.map(photo => <SwiperSlide>...)`  패턴은 라이브러리 공식 지원 방식이며 별도로 슬라이드를 수동 슬라이싱할 필요 없음.
- `modules/virtual.mjs`의 `update()` 함수가 loop 모드일 때 `loopFrom = -slides.length`, `loopTo = slides.length * 2` 범위로 인덱스를 매핑하는 코드가 명시적으로 존재(`#8202` 이슈 대응 주석 포함) → loop+virtual 조합은 라이브러리 차원에서 지원됨.
- `renderExternal`이 설정된 경로(React 사용 시 항상 해당)에서는 `update()`가 DOM `append/prepend/remove`, `data-swiper-slide-index` 쿼리셀렉터 분기를 전부 스킵하고 곧바로 return하므로, `<SwiperSlide virtualIndex>` prop을 안 넘겨도(현재 코드가 그러함) React 경로에서는 문제가 되지 않음.
- 결론: 이 조합 자체로 인한 슬라이드 렌더링 범위 계산 오류나 인덱스 불일치 우려는 **기우로 판단**(소스 검증 완료). 단, 코어 loop의 물리적 슬라이드 복제(`loopAdditionalSlides`)가 virtual 활성 시 실제로 스킵되는지는 코어 번들(`shared/swiper-core.mjs`)이 너무 커 전체 확인은 못 함 — 실기기 QA(루프 경계 전환 시 유령 슬라이드/끊김 여부)로 최종 확인 권장(우선순위 낮음, 정황 증거상 안전할 가능성 높음).

**jumpSlides(±3) / openEnlarged / showEnlarged / showPrevEnlarged / showNextEnlarged의 `slideToLoop()` 기반 인덱스 — virtual 모드에서도 정상 확인(2026-07-30).** `getChildren()`이 `<Swiper>`의 전체 children(785개 SwiperSlide 전부)을 추출한 뒤 그중 일부만 실제 렌더링하는 구조이므로, `photos.map((photo, i) => ...)`의 `onClick={() => openEnlarged(i)}`에 캡처된 `i`는 항상 원본 배열 전체 인덱스(0~784)와 일치. virtual 모드가 인덱스 공간 자체를 바꾸지 않으므로 `slideToLoop(index)` 호출과도 어긋나지 않음.

**신규 성능/사이징 지적 (2026-07-30, 다음 리뷰 시 재확인):**
- `photos.map(...)`(785개 SwiperSlide/Image 엘리먼트 생성)이 `activeIndex` state가 바뀔 때마다(자동재생 3초 간격, 슬라이드 전환마다) 매 렌더링에서 재생성됨. 실제 DOM 마운트는 virtual 덕분에 ~5개뿐이지만 JS 엘리먼트 생성 자체는 여전히 785회 반복 — `useMemo(() => photos.map(...), [])`로 감싸는 것을 제안(미수정 상태, 우선순위 중간).
- 메인 슬라이드 `sizes="384px"` 고정값이 실제 렌더 크기(`78vw`, 이 프로젝트는 375px 기준 모바일 전용이라 78vw는 항상 384px 미만: 320px 뷰포트 기준 249.6px, 428px 기준 333.8px)보다 커서, 이번 수정의 목적(메모리 절감)을 일부 상쇄함. `sizes="78vw"`로 조정 권장(미수정 상태).
- 확대뷰 `sizes="(max-width: 512px) 100vw, 512px"`는 실제 렌더 크기(모바일 전용이라 항상 100vw 분기 적용)와 일치 — 문제 없음.
- Vercel Hobby 플랜 이미지 최적화 무료 한도는 월 1,000장의 "고유 소스 이미지"(초과 시 402 에러, 과금은 안 됨). unoptimized 제거로 이제 785장이 처음으로 이 한도 집계에 포함되며, 기도편지 31장 등 다른 이미지까지 합치면 800장을 넘어 한도에 근접 — 향후 이미지 추가 시 반드시 재확인 필요 사항으로 기록.

**메인 컨트롤 바 3장씩 이동(`jumpSlides`) — 2026-07-30 재확인: 레이스 컨디션 해결 완료.**
```ts
const jumpSlides = (delta: number) => {
  const swiper = swiperRef.current;
  if (!swiper) return;
  const target = (swiper.realIndex + delta + photos.length) % photos.length;
  swiper.slideToLoop(target);
};
```
2026-07-29 리뷰에서 지적했던 "React state(`activeIndex`) 대신 `swiper.realIndex`를 읽어야 함" 문제가 **이미 해당 방식으로 수정되어 있음을 확인**(2026-07-30). 재지적 불필요.

메인 컨트롤 바 이전/다음 버튼(`w-11 h-11`, 44px)과 닫기 버튼(38x38px, 미수정, 우선순위 낮음) 상태는 기존과 동일.

**autoplay 시작/정지 타이밍 검증 (2026-07-30, `autoplayOn` 기본값 true→false 변경 커밋 리뷰 시 소스 레벨로 확인):**

`onSwiper` 콜백에서 `swiper.autoplay.stop()`을 호출해 첫 렌더 시 autoplay가 자동 시작되지 않도록 막는 패턴은 **레이스 컨디션 없이 안전함**. `node_modules/swiper/swiper-react.mjs`와 `shared/update-on-virtual-data.mjs` 확인 결과:
- `getParams()`에서 `params.init = false`로 강제 설정되어 있어 `new Swiper$1(passParams)` 생성자 시점에는 초기화가 실행되지 않음.
- 실제 초기화는 `useIsomorphicLayoutEffect` 내부의 `mountSwiper()` → `swiper.init(el)` 호출 시점에 동기적으로 실행되며, 이 호출이 Autoplay 모듈의 시작 훅(첫 `setTimeout` 예약)까지 동기적으로 트리거함.
- 같은 `useIsomorphicLayoutEffect` 콜백 안에서 `mountSwiper()` 직후 곧바로 `onSwiper(swiperRef.current)`가 호출됨(같은 동기 실행 틱, 이벤트 루프로 양보(yield)하지 않음) → `onSwiper`에서 부르는 `.autoplay.stop()`이 예약된 `setTimeout`이 발화하기 전에 반드시 취소됨.
- 결론: JS는 싱글 스레드이므로 이 두 호출 사이에 `setTimeout` 콜백이 끼어들 수 없음. `onSwiper`에서 `.autoplay.stop()` 호출하는 패턴은 Swiper v14 기준으로 신뢰할 수 있는 정지 방법.

**2026-07-30(2차) 리뷰: 이전 지적 사항 해결 확인 + 신규 치명적 이슈 발견 (모바일 vertical / 데스크탑 horizontal 방향 전환 기능 추가 시).**

- `photos.map(...)` → `useMemo(() => ..., [photos, openEnlarged])`로 감싸짐. **해결 확인.**
- `sizes="78vw"`로 조정 완료. **단, 이번 변경으로 재차 부정확해짐** — 모바일에서 `direction="vertical"`로 전환하면서 SwiperSlide 크기가 더 이상 `78vw` 기반이 아니라 `h-[min(48vh,380px)]` + `aspect-[3/4]`(높이 기준, 너비는 `min(36vh, 285px)`로 자동 계산됨) 구조로 바뀜. 뷰포트 높이에 따라 실제 렌더 너비가 78vw보다 훨씬 작아질 수 있어(예: 900px 높이 기기에서 285px 폭인데 78vw는 335px) `sizes`가 과다 요청됨. `sizes="(max-width: 1023px) min(36vh, 285px), 78vw"` 형태로 재조정 권장(재지적, 우선순위 중간 — 성능 최적화 목적 상쇄되는 게 반복되는 패턴이므로 향후 sizes 관련 변경 시 항상 실제 CSS 크기 계산식과 대조할 것).

**🔴 치명적 신규 발견 — Tailwind v4 `@layer` 캐스케이드가 Swiper 기본 CSS(`swiper/css`, unlayered)에 항상 짐. SwiperSlide에 Tailwind 너비/높이 클래스를 직접 쓰면 무력화될 수 있음.**

- `app/globals.css`가 `@import "tailwindcss";`(1번째 줄)를 사용 → Tailwind v4는 이걸 `@layer theme, base, components, utilities;` + 각 레이어 import로 확장. 즉 `h-[...]`, `w-auto`, `lg:h-auto` 등 모든 유틸리티 클래스는 `@layer utilities` 안에 있음.
- `node_modules/swiper/swiper.css`를 직접 확인(소스 레벨): `.swiper-slide { flex-shrink: 0; width: 100%; height: 100%; ... }` — `@layer` 없이 선언된 **unlayered(레이어 미지정) 일반 CSS**.
- CSS Cascade Layers 스펙: **unlayered 일반 선언은 특이도(specificity)·소스 순서와 무관하게 항상 모든 layered 일반 선언을 이김.** 따라서 `SwiperSlide`의 `className`에 넣은 Tailwind 너비/높이 클래스(`h-[min(48vh,380px)]`, `w-auto`, `lg:w-[78vw]`, `lg:h-auto`, `lg:max-w-[384px]`)는 이론상 전부 `.swiper-slide`의 `width:100%; height:100%`에 무력화되어 슬라이드가 항상 wrapper 100%×100%로 늘어날 위험이 있음(카드 미리보기/종횡비 효과 소실).
- **왜 이번에 처음 문제가 되는가**: 기존(변경 전) 코드는 이 크기를 **인라인 `style`**로 지정했었음(이번 diff에서 "인라인 style → Tailwind 클래스 전환"이 명시적으로 이뤄짐). 인라인 style은 레이어 개념과 무관하게 항상 최우선 적용되므로 지금까지는 이 문제가 가려져 있었음. 이번에 Tailwind 클래스로 전환하면서 처음 노출된 회귀 위험.
- `.swiper`(Swiper 루트 엘리먼트, `<Swiper className="w-full h-full lg:h-auto">`) 쪽은 `swiper.css`에 `.swiper` 자체의 width/height 규칙이 없어 이 문제에서 안전함 — 오직 `.swiper-slide`(`SwiperSlide`의 className)만 해당.
- **수정 방법**: Tailwind v4의 `!` important 접미사 사용 — `!important`는 레이어 여부와 무관하게 일반 선언보다 항상 우선하므로 안전하게 이김. 예: `className="shrink-0 aspect-[3/4] h-[min(48vh,380px)]! w-auto! lg:h-auto! lg:w-[78vw]! lg:max-w-[384px]!"` (aspect-ratio는 swiper.css에 경쟁 선언이 없어 `!` 불필요). 또는 DevTools로 실제 computed style을 찍어서 어느 규칙이 이겼는지 먼저 확인 후 반영.
- **일반화**: 이 프로젝트(Tailwind v4, `@import "tailwindcss"` 사용)에서 서드파티 라이브러리의 plain CSS(`@layer` 미사용, 예: swiper/css 외에도 향후 추가될 다른 캐러셀/데이트피커/차트 라이브러리 CSS 등)가 스타일링하는 엘리먼트에 Tailwind 클래스로 같은 속성(특히 width/height/display 등 레이아웃 속성)을 지정할 때는 항상 이 캐스케이드 레이어 충돌 가능성을 확인할 것. 인라인 style로 되어있던 걸 Tailwind 클래스로 "리팩터링"하는 변경은 특히 위험(겉보기엔 동등해 보이지만 우선순위가 뒤바뀜).

**direction breakpoint(1024px) + virtual + loop 동시 전환 — 소스 레벨 확인(2026-07-30):**
- `shared/swiper-core.mjs`의 `setBreakpoint()`: `directionChanged`(breakpointParams.direction !== params.direction) 감지 시 `swiper.changeDirection()` 호출, `needsReLoop`(direction 변경 포함) 시 `loopDestroy()` + `loopCreate()` + `updateSlides()` 호출 — 이는 공식 지원 흐름.
- 단, `loopCreate`/`loopDestroy` 둘 다 `if (swiper.virtual && swiper.params.virtual?.enabled) return;`로 virtual 활성 시 즉시 no-op함 → breakpoint의 "re-loop" 로직 자체는 virtual 모드에서 실질적으로 아무 것도 안 함.
- 하지만 `modules/virtual.mjs`의 `update()`가 `'setTranslate'` 이벤트마다(즉 `changeDirection()` 이후 이어지는 `updateSlides()`/`slideTo()` 호출로 트리거됨) `swiper.isHorizontal()` 기준으로 offsetProp/from/to를 매번 재계산하므로, 방향 전환 후에도 index 매핑 자체는 재적응 가능 — 정황상 안전할 가능성이 높음.
- **실사용 리스크는 낮음**(모바일 기기가 세션 중 뷰포트 폭 1024px를 실제로 넘나드는 경우는 거의 없음 — 폴더블/태블릿 회전, 데스크탑 창 리사이즈 정도). 폴더블/태블릿 실기기 QA로 1024px 경계 통과 시 유령 슬라이드·깜빡임 여부 확인 권장(우선순위 낮음, 코드 자체를 막을 필요는 없음).

**Tailwind v4 arbitrary value 안의 콤마 포함 CSS 함수(`h-[min(48vh,380px)]`) — 정상 파싱됨.** 스페이스만 `_`로 이스케이프하면 되고 콤마는 이스케이프 불필요(`grid-cols-[repeat(3,minmax(0,1fr))]` 같은 공식 문서 예시와 동일 패턴). 재확인 불필요.

**Why:** 향후 이 컴포넌트나 유사한 갤러리/캐러셀 컴포넌트를 리뷰할 때 동일한 이슈를 반복 조사하지 않도록. [[모바일 아이콘 버튼 터치 타겟 크기 체크]]

**How to apply:** jumpSlices의 realIndex 사용, 메인 컨트롤 바 버튼 크기, `Virtual` 모듈 도입, jumpSlides/openEnlarged 계열 인덱스 정합성, `useMemo` 적용은 모두 검증 완료 — 재지적 불필요. **다음 리뷰 시 최우선 확인**: (1) SwiperSlide의 Tailwind 너비/높이 클래스가 `!` 등으로 실제 적용되는지(cascade layer 충돌 수정 여부) — DevTools computed style로 확인 권장, (2) `sizes` prop이 vertical(모바일)/horizontal(데스크탑) 각 모드의 실제 렌더 크기와 일치하는지, (3) Vercel Hobby 이미지 최적화 월 1,000장 한도 근접 이슈, (4) 닫기 버튼 38x38px 개선 여부(낮은 우선순위). Swiper `onSwiper` 콜백에서 autoplay/기타 모듈을 즉시 정지·설정하는 패턴, `virtual` + React 조합 지식(React wrapper의 `renderExternal` 자동 주입, loop 인덱스 매핑)은 이 컴포넌트 외 다른 캐러셀에도 적용 가능. **Tailwind v4 cascade layers vs 서드파티 unlayered CSS 충돌 패턴은 이 프로젝트의 다른 라이브러리 통합(향후 차트/데이트피커 등)에도 일반 적용 가능한 체크포인트로 기억할 것.**
