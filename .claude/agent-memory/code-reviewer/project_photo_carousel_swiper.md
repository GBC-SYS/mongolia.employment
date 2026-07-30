---
name: PhotoCarousel Swiper loop 동기화 패턴
description: components/PhotoCarousel.tsx의 확대뷰-배경캐러셀 상태 동기화 구조, Swiper v14 loop API 사용법, autoplay 제어 타이밍
type: project
---

`components/PhotoCarousel.tsx`(`/photos` 페이지, 785장 정적 이미지, Jotai 미사용 — 로컬 `useState`만 사용하므로 `ClientOnly`/`dynamic` 불필요)는 Swiper(`swiper: ^14.0.6`)를 `loop: true`로 사용하는 메인 캐러셀과, 탭하면 열리는 전체화면 확대 모달(`enlargedIndex: number | null` 기반)로 구성된다.

핵심 동기화 함수 `showEnlarged(index)`는 `setEnlargedIndex` + `setActiveIndex` + `swiperRef.current?.slideToLoop(index, 0, false)`를 함께 호출해 확대뷰/카운터("X / Y")/배경 캐러셀 위치 3곳을 동시에 맞춘다. `openEnlarged`는 `showEnlarged`를 재사용(수정 완료 확인됨, 2026-07-29). 확대 모달의 좌/우 이동 버튼도 `w-11 h-11`(44px, 수정 완료).

785장 슬라이드는 `modules={[Autoplay]}`만 사용하고 `Virtual` 모듈을 쓰지 않아, Swiper가 슬라이드 785개 전부를 DOM에 렌더링한다(각 슬라이드에 Next `<Image fill unoptimized>` 포함). 저사양 모바일에서 초기 렌더/스크립팅 부하 우려로 2026-07-29 리뷰에서 🟡로 지적, **아직 미수정**(2026-07-30 재확인, diff 범위 밖).

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

**Why:** 향후 이 컴포넌트나 유사한 갤러리/캐러셀 컴포넌트를 리뷰할 때 동일한 이슈를 반복 조사하지 않도록. [[모바일 아이콘 버튼 터치 타겟 크기 체크]]

**How to apply:** jumpSlides의 realIndex 사용, 메인 컨트롤 바 버튼 크기는 이제 항상 통과로 간주하고 재지적 불필요. 다음 리뷰 시 확인할 것: (1) `Virtual` 모듈 도입 여부(785장 DOM 전체 렌더, 아직 미수정), (2) 닫기 버튼 38x38px 개선 여부(낮은 우선순위). Swiper `onSwiper` 콜백에서 autoplay/기타 모듈을 즉시 정지·설정하는 패턴을 다른 곳에서도 볼 경우, 이 문서에 정리된 근거로 레이스 컨디션 우려 없이 안전하다고 판단 가능(동일 `useIsomorphicLayoutEffect` 동기 실행 내에서 처리되는 한).
