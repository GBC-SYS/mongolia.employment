---
name: PhotoCarousel Swiper loop 동기화 패턴
description: components/PhotoCarousel.tsx의 확대뷰-배경캐러셀 상태 동기화, Swiper v14 loop/virtual/autoplay, Tailwind v4 @layer vs unlayered swiper/css 충돌(!important로 해결), flex 자식 min-h-0 순환 높이 버그, 모바일 릴스형 풀스크린 재설계
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

**2026-07-30(3차) 리뷰: 모바일 릴스형 풀스크린 재설계 + 이전 회귀 최종 해소 확인.**

- 모바일 디자인이 카드형(`h-[min(48vh,380px)]`)에서 **인스타 릴스 스타일 세로 풀스크린**(`h-full! w-full!`, 뷰포트 전체를 채우는 1장)으로 재변경됨. 이에 따라 `sizes="(max-width: 1023px) 100vw, 78vw"`가 다시 실제 렌더 크기와 정확히 일치(모바일 100vw = 실측 정확). **이전에 지적했던 sizes 부정확 이슈는 이번 재설계로 자연 해소됨** — card 방식으로 되돌아가면 다시 어긋나므로 향후 재변경 시 재확인 필요.
- **🔴였던 "Tailwind 유틸리티가 unlayered `swiper/css`에 밀려 SwiperSlide 크기가 무력화될 위험" — `!` important 접미사(`h-full! w-full! lg:h-auto! lg:w-[78vw]! lg:max-w-[384px]!`) 적용으로 해소 확인.** CSS 스펙상 `!important` 선언은 layer 소속과 무관하게 모든 일반(non-important) 선언(인라인 style 포함)보다 항상 우선하므로, unlayered `swiper/css`의 인라인 강제(`slide.style.height/width`, virtual+slidesPerView="auto" 조합 시 Swiper가 무조건 주입)까지도 이걸로 확실히 이김. 재지적 불필요, 단 향후 이 `!` 접미사들을 실수로 제거하면 즉시 재발하므로 **왜 필요한지 설명하는 주석이 코드에 없다는 점은 유지보수 리스크로 남음(🟡, 제안: 한 줄 주석 추가)**.
- **신규 버그 A 확인(치명적, 수정 완료): flex 자식 퍼센트 높이 순환 참조.** 최상위 컨테이너를 `min-h-screen`(모바일에서도 무제한 성장 가능) → `h-dvh overflow-hidden`(모바일)로, Swiper를 감싸는 `flex-1` div에 `min-h-0` 추가로 수정. `min-h-0` 없으면 flex item 기본값 `min-height:auto`가 콘텐츠(가상 렌더링된 슬라이드들) 오버플로우를 막아 컨테이너가 무한정 부풀어 오름(실측 80,320px→844px, 개발자 보고). 데스크탑(`lg:min-h-screen lg:overflow-visible`, `lg:h-auto`)에는 부작용 없음 — 데스크탑에서는 Swiper 루트가 `lg:h-auto`라 퍼센트 연쇄가 애초에 발생하지 않고(슬라이드 자체 높이가 `aspect-[3/4]`로 콘텐츠 기반 확정), `.swiper-wrapper`의 `h-full!`도 결국 콘텐츠 기반 값으로 수렴함(순환이 아니라 단순 축소 위임). CSS 코드 리뷰로 재검증 완료, 실기기 재확인 불필요할 정도로 원리적으로 안전.
- **모바일 컨트롤 바 `hidden lg:block` 전체 은닉 — 코드 참조 무결성은 문제 없음.** `downloading`/`autoplayOn`/`progressBarRef` 모두 조건부 렌더링이 아니라 CSS `hidden` 클래스로만 숨겨져 있어 DOM/ref 자체는 유지됨 → `onAutoplayTimeLeft`, `toggleAutoplay` 등 참조 코드 깨지지 않음. **단, 제품 관점에서 이번 변경으로 비-iOS 모바일(Android 등) 사용자는 다운로드 버튼에 접근할 수 있는 유일한 경로를 완전히 잃음.** `handleDownload`의 `isIOS()` 분기 알림("길게 눌러 저장")도 애초에 버튼이 안 보이니 트리거될 일이 없음 — 네이티브 롱프레스 저장은 여전히 동작할 가능성이 높지만(next/image가 결국 `<img>`로 렌더), 앱이 아무 안내도 하지 않는 상태가 됨. 사용자가 명시적으로 요청한 사항이라 버그는 아니지만, 향후 리뷰 시 "안내 문구 추가 여부"를 확인할 것(🟡, 우선순위 낮음, 기획 확인 필요 사항으로 기록만).
- `spaceBetween={0}` + `breakpoints={{1024:{direction:"horizontal",spaceBetween:36}}}` — `shared/swiper-core.mjs`의 `setBreakpoint()`가 `directionChanged` 감지 시 `changeDirection()`, `needsReLoop` 시 `loopDestroy+loopCreate+updateSlides`를 호출하는 공식 지원 흐름이라 확인됨(2026-07-30 2차 리뷰 내용과 동일 결론, 재확인만).
- 닫기 버튼(38×38px)은 여전히 미수정(우선순위 낮음, 기존 이슈 반복 언급 불필요 — 다만 이번 리뷰에서 `onClick`에 `stopPropagation`이 없어 배경 클릭 핸들러(`closeEnlarged`)와 버블링으로 중복 호출됨을 신규 발견. 부작용은 없음(멱등), 우선순위 매우 낮은 코드 정리 제안).

**2026-07-30(4차) 리뷰: `breakpoints` 제거 후 `isDesktop` 상태로 PC/모바일 `<Swiper>`를 별개 JSX로 분기하는 재설계 — 🔴 치명적 재발 위험 소스 레벨 확인.**

- 의도: `direction`을 런타임에 바꾸면 virtual+loop 조합에서 `realIndex`가 깨지는 버그(기존 `breakpoints` prop에서 발견)를 피하려고, `isDesktop ? <Swiper direction="horizontal" .../> : <Swiper direction="vertical" .../>` 형태로 **두 개의 별개 JSX 엘리먼트**를 조건부 렌더링하도록 변경.
- **`node_modules/swiper/swiper-react.mjs`, `shared/update-swiper.mjs` 소스 레벨로 확인한 결과, 이 방식은 근본 문제를 해결하지 못함.** React의 재조정(reconciliation)은 "같은 트리 위치 + 같은 컴포넌트 타입"이면 언마운트/재마운트 없이 **기존 인스턴스를 재사용하고 props만 갱신**한다(React 공식 diffing 알고리즘). 두 삼항연산자 분기 모두 동일한 `Swiper`(같은 import, 같은 함수 참조) 컴포넌트이고 부모 트리 내 같은 위치에 있으므로, `isDesktop`이 토글돼도 React는 **완전히 같은 Fiber/인스턴스를 유지**하며 `direction`, `virtual`, `slidesPerView`, `spaceBetween` 등이 바뀐 props로 전달될 뿐이다.
- `swiper-react.mjs`의 두 번째 `useIsomorphicLayoutEffect`(deps 없음, 매 렌더 후 실행)가 `getChangedParams(passedParams, oldPassedParamsRef.current, ...)`로 이전 props와 diff하고, 바뀐 게 있으면 `updateSwiper()`를 호출한다. `update-swiper.mjs`의 `updateSwiper()` 안에 `if (changedParams.includes('direction')) { swiper.changeDirection(passed.direction, false); }` 코드가 명시적으로 존재 — 이것이 바로 기존에 `breakpoints`로 재현했던, **virtual+loop 조합에서 `realIndex`를 깨뜨리는 그 코드 경로와 100% 동일**하다. 트리거 지점만 "Swiper 내부 breakpoint 로직"에서 "React props 재조정"으로 바뀌었을 뿐, 실제 버그 재현 메커니즘은 그대로 남아있다.
- **재현 조건**: 최초 페이지 로드 시점(첫 렌더)에는 문제 없음 — `initSwiper()`가 `if (!swiperElRef.current) initSwiper()` 가드로 오직 최초 1회만 실행되고, 이때 이미 올바른 고정 `direction`으로 Swiper 인스턴스가 생성되기 때문. 문제는 **세션 도중 실제로 1024px 경계를 넘는 리사이즈/회전이 한 번이라도 발생했을 때만** 트리거된다(PC 브라우저 창 크기 조절, 폴더블/태블릿 회전 등). 사용자가 설명한 Playwright 검증("모바일/PC 각각 최초 로드 후 realIndex:0 확인, 자동재생·스와이프 스트레스 테스트")은 이 "세션 도중 실제 리사이즈로 경계를 넘는" 시나리오를 포함하지 않았을 가능성이 높다 — 즉 테스트가 통과한 것이 이 설계가 안전함을 증명하지 않는다.
- **수정 방법**: 두 `<Swiper>` 분기에 서로 다른 `key`를 부여해 React가 강제로 언마운트/재마운트하게 만들어야 함 — `<Swiper key="desktop" .../>` / `<Swiper key="mobile" .../>`. `key`가 다르면 React는 이전 Fiber를 버리고(`swiper-react.mjs`의 마운트 이펙트 cleanup에서 `swiper.destroy(true, false)` 호출) 완전히 새 Swiper$1 인스턴스를 생성하므로, `updateSwiper()`/`changeDirection()` 경로 자체가 절대 실행되지 않는다. **`key` prop 없이 "두 개의 별개 JSX 엘리먼트"라고 서술하는 것은 React 재조정 관점에서 사실이 아님 — 이 패턴(같은 컴포넌트 타입의 조건부 렌더링으로 "인스턴스 분리"를 의도하는 경우) 자체를 이 프로젝트의 다른 곳에서도 만나면 항상 `key` 유무를 확인할 것.**
- `key` 추가에 따른 부수 조정 필요: (1) 리마운트 시 새 인스턴스는 기본적으로 slide 0에서 시작하므로 `initialSlide={activeIndex}`를 양쪽 분기에 추가해 위치 연속성 보존 권장. (2) `onSwiper`가 항상 `swiper.autoplay.stop()`을 호출하므로, 리마운트 시점에 `autoplayOn` state가 `true`였다면 UI(재생 버튼 라벨)와 실제 재생 상태가 어긋남 — 리마운트 후에도 `autoplayOn`이 true면 autoplay를 이어서 시작하도록 보정 필요(우선순위 낮음, 위 key 수정과 함께 처리 권장).

**같은 회차 확인: 이전 리뷰 항목 재확인.**
- 닫기 버튼 `onClick`에 `e.stopPropagation()` 추가됨 — **이전에 지적했던 배경 클릭 핸들러와의 중복 호출 이슈 해결 확인.** 재지적 불필요.
- 닫기 버튼 크기는 여전히 38×38px(`p-2` + 22px 아이콘) — 44px 미만, 기존 지적 유지(우선순위 낮음, 반복 언급 불필요).
- `useState(() => typeof window !== "undefined" && window.innerWidth >= 1024)` lazy init — hydration mismatch 우려 없음 확인. `app/photos/page.tsx`가 `<ClientOnly><PhotosGate /></ClientOnly>`로 감싸고, `ClientOnly`는 `useSyncExternalStore`(`getServerSnapshot` → false)로 구현되어 있어 SSR 및 하이드레이션 매칭 패스에서는 항상 `null`을 렌더링하고, `PhotoCarousel`은 마운트 이후에야 처음 렌더링됨 — 즉 서버에서 생성된 HTML과 대조(hydrate)되는 대상 자체가 아니므로 안전.
- `window.matchMedia` change 리스너 — `addEventListener`/`removeEventListener` 정상 대칭, 메모리 누수 없음.
- `virtual` prop이 PC는 객체(`{slidesPerViewAutoSlideSize: 384}`), 모바일은 `boolean`(`virtual`) — Swiper의 다른 모듈 옵션(pagination/navigation/autoplay 등)과 동일하게 `boolean | Options` 유니언 타입 패턴이라 타입 충돌 없음(정확한 `.d.ts` 유니언 선언은 번들 구조상 직접 확인은 어려웠으나, `update-swiper.mjs`의 `paramsList`에 `virtual`이 다른 모듈 옵션과 동일하게 취급되는 것으로 간접 확인).
- 패딩 wrapper div(`p-4 pb-6` 카드 느낌) — `onClick={() => openEnlarged(i)}`가 안쪽 카드 div에만 있어 패딩 영역 탭은 확대 뷰를 열지 않음(의도된 여백으로 보이며 버그 아님). 레이아웃도 `w-full h-full` 중첩이라 퍼센트 연쇄에 문제 없음.
- PC용 `sizes="(max-width: 1023px) 100vw, 78vw"` — 데스크탑 분기의 실제 렌더 폭은 `lg:max-w-[384px]!`로 캡되어 있는데, `isDesktop` 임계값이 1024px이므로 데스크탑에서 `78vw`는 항상 799px 이상(1024×0.78)으로 실제 384px 캡보다 훨씬 큼 — 이전 회차에 지적했던 "sizes가 실제 렌더 크기와 어긋나는" 패턴이 모바일은 해소됐지만 PC 쪽은 여전히(그리고 이번에 처음 명시적으로) 과다 요청 상태. `sizes="(max-width: 1023px) 100vw, 384px"`로 조정 권장(🟡, 중간 우선순위, 성능/대역폭).
- 코드 중복: PC/모바일 두 `<Swiper>`의 `autoplay`, `onAutoplayTimeLeft`, `onSwiper`, `onSlideChange` 콜백이 완전히 동일 — 공통 props 객체로 추출 권장(🟡, key 리팩터링과 함께 처리하면 좋음).

**2026-07-30(6차) 리뷰: 모바일 전용 뒤로가기 버튼 추가(`handleBack`, `useRouter`) — 커밋 승인, 치명적 이슈 없음.**

- **`handleBack` 로직이 `components/BackButton.tsx`와 100% 동일 로직(`document.referrer` same-origin 체크 → `router.back()`/`router.replace("/")`)으로 인라인 복제됨.** BackButton은 시각 스타일(32x32px, 헤더 인라인, 회색 배경)이 하드코딩되어 있어 이번 요구사항(46x46px, `fixed` 오버레이, 반투명 흰 배경, safe-area 대응)에는 그대로 재사용 불가 — CLAUDE.md의 "뒤로가기(인앱 브라우저 안전)" 섹션이 이 로직 자체를 보일러플레이트로 예시하고 있어 인라인 복제가 프로젝트 문서상 용인되는 패턴이긴 하나, 이상적으로는 로직만(`useBackNavigation()` 같은 훅으로) 추출하고 BackButton과 PhotoCarousel 둘 다 그 훅을 쓰는 게 DRY에 더 부합함(🟡, 우선순위 낮음, 블로킹 아님).
- **🟡 신규 발견: 새 뒤로가기 버튼(`fixed left-4 ...`)이 `backdrop-filter`를 인라인으로 건 최상위 `glass` div(`<div style={glass}>`, 파일 최상위 컨테이너) 안에 자식으로 중첩되어 있음.** 이는 CLAUDE.md "크로스 브라우징 규칙"에 명시적으로 금지된 패턴("position: fixed 조상에 backdrop-filter 인라인 적용" → 조상이 fixed 자손의 containing block이 되어버림, CSS 스펙상 backdrop-filter도 filter/transform과 동일하게 containing block을 만듦)과 문자 그대로 일치. **다만 소스 레벨 분석 결과 이번 경우는 실제 시각적 버그로 이어지지 않음**: 이 glass div 자체가 `h-dvh overflow-hidden`(모바일)이라 뷰포트와 정확히 같은 크기·위치를 가지고 내부 스크롤도 없어, containing block이 조상으로 바뀌어도 좌표가 실제 뷰포트 기준과 동일하게 계산됨(체인 위 `#app-panel`은 `/photos` 라우트에서 모바일 시 backdrop-filter 없음(`AppPanel.tsx` 확인), body는 모바일에서 `flex` 미적용이라 정상 문서 흐름). 확대뷰 모달(`fixed inset-0 z-[60]`)은 이 glass div의 형제(fragment 레벨)라 애초에 이 문제에서 자유로움 — 그 배치와 대조하면, 새 버튼도 같은 자리(형제)로 옮기는 게 규칙 준수 + 방어적 설계 관점에서 더 안전함(🟡, 기능적으로 급하진 않으나 프로젝트 명시 규칙 위반이라 정리 권장, 리팩터링은 트리비얼함).
- **🟡 버튼 위 주석의 자기모순 + 실제 스코프 갭 발견.** 새로 추가된 주석: "PC는 별도 컨트롤 바에 뒤로가기가 필요 없음 (DesktopHero 등 다른 진입 경로 존재)" — 그러나 `components/DesktopHero.tsx`는 `if (pathname === "/photos") return null;`로 `/photos`에서 완전히 렌더링되지 않음(같은 주석의 바로 앞 문장이 "BottomNav/DesktopHero가 모두 숨겨져 있어"라고 이미 명시하고 있어 자기모순). 즉 PC에서도 `/photos`에서 홈으로 돌아갈 방법이 실제로 전혀 없는 상태(BottomNav `hidden = pathname === "/photos"`는 브레이크포인트 무관 전체 숨김, DesktopHero도 전체 숨김) — 이번 수정(`lg:hidden`)은 모바일만 고치고 동일한 UX 단절을 데스크탑에 그대로 남겨둠. 사용자가 "모바일"만 명시적으로 요청했으므로 버그는 아니고 스코프 확인 사항이지만, 주석의 근거 자체가 코드와 불일치하므로 반드시 정정 또는 데스크탑도 함께 고려할 것.

**Why:** 향후 이 컴포넌트나 유사한 갤러리/캐러셀 컴포넌트를 리뷰할 때 동일한 이슈를 반복 조사하지 않도록. [[모바일 아이콘 버튼 터치 타겟 크기 체크]]

**How to apply:** jumpSlices의 realIndex 사용, 메인 컨트롤 바 버튼 크기, `Virtual` 모듈 도입, jumpSlides/openEnlarged 계열 인덱스 정합성, `useMemo` 적용, `!important` cascade 수정, flex 순환 높이 버그(`min-h-0`) 수정, 닫기 버튼 stopPropagation은 모두 검증/수정 완료 — 재지적 불필요. **다음 리뷰 시 확인(최우선)**: `isDesktop` 삼항연산자 분기에 `key` prop이 추가됐는지(추가 전이라면 여전히 🔴), 추가됐다면 `initialSlide`/`autoplayOn` 연속성 보정이 함께 됐는지. 그 외: (1) PC `sizes`를 `384px` 캡 기준으로 수정했는지, (2) 두 Swiper 분기 공통 props 추출 여부, (3) Vercel Hobby 이미지 최적화 월 1,000장 한도 근접 이슈, (4) 닫기 버튼 38x38px 개선 여부(낮은 우선순위), (5) 모바일 다운로드 버튼 완전 은닉 기획 의도(안내 문구 추가 여부), (6) 모바일 뒤로가기 버튼이 여전히 `glass` div 안에 중첩돼 있는지(형제로 이동했는지), (7) PC `/photos` 뒤로가기 갭이 해소됐는지/주석이 정정됐는지, (8) `handleBack` 로직이 훅으로 추출됐는지. Swiper `onSwiper` 콜백에서 autoplay/기타 모듈을 즉시 정지·설정하는 패턴, `virtual` + React 조합 지식(React wrapper의 `renderExternal` 자동 주입, loop 인덱스 매핑), percentage-height-against-auto-parent가 auto로 폴백하는 CSS 스펙 동작은 이 컴포넌트 외 다른 캐러셀/레이아웃에도 적용 가능. **Tailwind v4 cascade layers vs 서드파티 unlayered CSS 충돌 패턴, 그리고 `!important`가 이를 해결하는 근거(스펙상 importance가 layer보다 먼저 비교됨)는 이 프로젝트의 다른 라이브러리 통합에도 일반 적용 가능한 체크포인트로 기억할 것.** **신규 일반 원칙: 같은 컴포넌트 타입을 조건부 삼항연산자로 렌더링해 "서로 다른 인스턴스"를 의도하는 패턴은 `key` prop이 없으면 React가 인스턴스를 재사용해 props diff/update만 발생시킨다 — 이 프로젝트의 다른 컴포넌트에서도 "완전히 분리했다"는 주장이 나오면 항상 `key` 유무부터 확인할 것.** **신규 일반 원칙 2: `backdrop-filter`/`filter`/`transform`을 인라인 style로 건 조상 안에 `position: fixed` 자손을 넣는 패턴을 볼 때마다, 그 조상이 실제로 뷰포트와 항상 동일한 크기·위치·비스크롤 상태(`h-dvh`/`h-screen` + `overflow-hidden` 등)인지부터 확인할 것 — 그렇다면 CLAUDE.md 금지 패턴이라도 실제 시각적 버그로 이어지지 않을 수 있으나(이번 케이스), 그래도 규칙 위반 자체는 지적하고 형제로 옮기는 트리비얼한 수정을 권장. 조상 크기가 콘텐츠에 따라 변하거나 스크롤 가능하면 반드시 🔴로 격상.**

**2026-07-30(5차) 리뷰: 이전 회차 🔴 최종 해소 확인, 새 치명적 이슈 없음 — 커밋 승인.**

- `key="desktop"`/`key="mobile"` 추가 확인 + 양쪽 모두 `initialSlide={activeIndex}`, `onSwiper`에서 `autoplayOn` 값 기준 `autoplay.start()/stop()` 복원 로직 확인. **4차 리뷰에서 지적한 🔴(key 없이 삼항 분기)는 완전히 해소됨.**
- PC `sizes="(max-width: 1023px) 100vw, 384px"`로 수정 확인 — 데스크탑 실제 렌더 캡(`lg:max-w-[384px]!`)과 정확히 일치. **해소 확인.**
- 닫기 버튼 `p-3`(12px) + 22px 아이콘 = 46px — 44px 터치 타겟 기준 충족으로 수정됨(기존 38×38px에서 개선). **해소 확인.**
- 두 Swiper 분기의 `autoplay` 옵션 객체, `onAutoplayTimeLeft`, `onSwiper`, `onSlideChange` 콜백이 여전히 완전 중복 — 4차 리뷰와 동일 지적 유지(🟡, 우선순위 낮음, 공통 props 객체로 추출 제안, 블로킹 아님).
- 신규 발견(🟢, 매우 낮은 우선순위): `key` 리마운트 시 React가 이전 Swiper unmount(destroy) → 신규 mount를 같은 커밋 내에서 처리하므로 실사용 리스크는 거의 없으나, 이론상 리사이즈가 1024px 경계를 넘는 그 찰나에 사용자가 컨트롤 버튼을 탭하면 `swiperRef.current`가 방금 destroy된 인스턴스를 가리킬 수 있는 아주 좁은 윈도우가 존재. 실제로 막을 필요는 없음(참고만).
- `MusicPlayerDock.tsx`: `usePathname() === "/photos"` 조건으로 `/photos` 외 라우트에서 `return null`(하위 `<MusicPlayer>`와 `<audio>` 완전 언마운트) — 커밋 메시지(d27d6ed)에 명시된 의도된 동작. 부작용: `/photos`를 벗어났다가 돌아오면 재생 위치/재생 상태가 초기화됨(의도된 것으로 보임, 버그 아님). Hook은 조건부 return 이전에 호출되어 rules-of-hooks 위반 없음.
- ESLint 7종 패턴(react-hooks/*, @next/next/*, @typescript-eslint/*, react/*) 육안 검사 결과 위반 없음(unused vars/any/img element/key 누락 등 전부 클린).
- **결론: 이번 diff는 커밋을 막을 치명적 이슈 없음.** 남은 항목은 전부 🟡/🟢 수준(중복 코드 추출, 매우 낮은 확률의 edge case)으로 선택적 개선 사항.

**2026-07-30(7차) 리뷰: 뒤로가기 버튼을 glass div 형제로 이동 + PC(`lg:hidden` 제거)까지 노출 확장 — 커밋 승인, 치명적 이슈 없음.**

- **5차/6차에서 지적했던 두 항목 모두 해소 확인.** (1) 버튼이 `<div style={glass}>`의 자식에서 Fragment 최상위 형제로 이동됨 — CLAUDE.md "position: fixed 조상에 backdrop-filter 인라인 금지" 규칙 위반이 방어적으로 제거됨. (2) `lg:hidden` 제거로 PC에서도 버튼이 노출되어, `BottomNav`(`hidden = pathname === "/photos"`, 브레이크포인트 무관 전체 숨김)와 `DesktopHero`(`if (pathname === "/photos") return null`, 브레이크포인트 무관 전체 숨김) 때문에 PC에서 `/photos` → 홈 이동 수단이 전혀 없던 갭이 해소됨. 버튼 위 주석도 "PC/모바일 모두 숨겨져 있어"로 정정되어 이전 자기모순(6차 지적) 해소.
- **PC 확장에 따른 신규 레이아웃/z-index 충돌 없음 — 좌표 계산으로 확인.** `AppPanel.tsx`의 `/photos` 분기(`w-full lg:relative lg:h-screen lg:flex lg:flex-col`, backdrop-filter 없음)는 `position: relative`만 있어 `position: fixed` 자손의 containing block에 영향 없음 → 버튼은 진짜 브라우저 뷰포트 기준 `left:16px, top:16px`(safe-area 0 가정)에 고정. PC 컨트롤 바(`w-full max-w-sm mx-auto`, 최대 384px)는 뷰포트 중앙 정렬이라, 1024px(최소 lg 폭)에서도 좌측 시작점이 약 320px로 버튼(우측 끝 약 62px)과 절대 겹치지 않음. z-index 명시 없이도 겹칠 공간적 여지 자체가 없어 안전.
- **🟡 신규 발견: PC에서 버튼이 사진이 아니라 옅은 frosted-glass 배경 위에 얹히는 경우가 대부분이라 대비(contrast)가 약할 수 있음.** 모바일은 버튼이 `pt-[env(safe-area-inset-top)]`만큼 내려온 지점이라 실제 사진(Swiper slide, `h-full! w-full!`) 위에 얹히지만, PC는 `centeredSlides` + `slidesPerView="auto"`(카드 최대 384px, `spaceBetween 36`)라서 1400px 같은 넓은 뷰포트에서는 버튼 위치(x:16~62px)가 이전/다음 카드 미리보기 범위(계산상 대략 x:88px부터 시작)보다도 왼쪽이라 사진이 전혀 닿지 않고, 항상 `glass`(`rgba(255,255,255,0.55)` + `blur(20px) saturate(180%)`) 배경 위에만 얹힘. 실제 `public/images/bg.webp`를 열어보면 상단 좌측이 밝은 하늘색(옅은 파스텔톤)이라, 55% 흰색 블러 오버레이까지 더해지면 버튼 배경(`rgba(255,255,255,0.15)`)과 흰색 아이콘(`text-white`, drop-shadow 없음)의 대비가 낮아질 수 있음. 같은 스타일(`rgba(255,255,255,0.15)` bg + 흰 아이콘)을 쓰는 확대뷰 닫기/이동 버튼은 항상 `rgba(0,0,0,0.9)`(어두운 오버레이) 위에서만 쓰이는 것과 대조됨 — 이 프로젝트의 확립된 패턴은 "흰 아이콘 오버레이 버튼 = 어두운 배경 전제"인데, 이번 PC 확장으로 처음으로 밝은 배경 위에 이 스타일이 쓰이게 됨. 사용자가 Playwright 스크린샷으로 "보인다"는 것까지는 확인했으나 명시적 대비/가독성 확인은 아니었음 — 블로킹은 아니지만(🟡), `drop-shadow` 아이콘 필터나 버튼 배경 불투명도 상향(`rgba(0,0,0,0.35)` 등으로 색 반전) 등으로 배경 밝기와 무관하게 보이도록 보강 권장. `bg.webp`를 교체할 경우 이 리스크가 재확인 필요.
- ESLint 7종 패턴 재확인 — 위반 없음(변경분은 JSX 위치 이동 + className 문자열 수정뿐, 새 import/변수/훅 없음).
- **결론: 이번 diff도 커밋을 막을 치명적 이슈 없음.** 유일한 신규 지적은 PC 대비(contrast) 관련 🟡 하나.
