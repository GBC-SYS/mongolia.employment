---
name: PhotoCarousel Swiper loop 동기화 패턴
description: components/PhotoCarousel.tsx의 확대뷰-배경캐러셀 상태 동기화 구조와 Swiper v14 loop API 사용법
type: project
---

`components/PhotoCarousel.tsx`(`/photos` 페이지, 785장 정적 이미지, Jotai 미사용 — 로컬 `useState`만 사용하므로 `ClientOnly`/`dynamic` 불필요)는 Swiper(`swiper: ^14.0.6`)를 `loop: true`로 사용하는 메인 캐러셀과, 탭하면 열리는 전체화면 확대 모달(`enlargedIndex: number | null` 기반)로 구성된다.

핵심 동기화 함수 `showEnlarged(index)`는 `setEnlargedIndex` + `setActiveIndex` + `swiperRef.current?.slideToLoop(index, 0, false)`를 함께 호출해 확대뷰/카운터("X / Y")/배경 캐러셀 위치 3곳을 동시에 맞춘다. `slideToLoop(index, speed, runCallbacks)`는 core.d.ts 기준 v14에도 존재하는 정식 API이며 loop 모드에서 `slideTo`(내부 중복 슬라이드 인덱스 기준) 대신 realIndex 기준으로 정확히 이동하는 올바른 선택.

2026-07-29 리뷰에서 지적됐던 `openEnlarged`의 `activeIndex` 미동기화 edge case는 **수정 완료**(같은 날 후속 커밋). `openEnlarged`가 이제 `showEnlarged(index)`를 그대로 호출해 `setEnlargedIndex`+`setActiveIndex`+`slideToLoop`가 한 번에 실행된다. 확대 모달의 좌/우 이동 버튼도 `w-11 h-11`(44px)로 수정 완료.

785장 슬라이드는 `modules={[Autoplay]}`만 사용하고 `Virtual` 모듈을 쓰지 않아, Swiper가 슬라이드 785개 전부를 DOM에 렌더링한다(각 슬라이드에 Next `<Image fill unoptimized>` 포함). 저사양 모바일에서 초기 렌더/스크립팅 부하 우려로 2026-07-29 리뷰에서 🟡로 지적, 아직 미수정.

메인 컨트롤 바(확대 모달이 아닌 캐러셀 상단 고정 바)의 이전/다음 버튼(`ChevronLeftIcon`/`ChevronRightIcon`)은 원래 `width/height=26`만 있고 고정 크기 클래스가 없어 26x26px에 불과했으나(2026-07-29 최초 발견), **3장씩 이동(`jumpSlides`) 기능 추가 커밋에서 `w-11 h-11`(44px)로 함께 수정 완료**(2026-07-29 후속 확인). 닫기(X) 버튼은 `p-2`+icon22px=38x38px로 여전히 44px에 근소 미달(우선순위 낮음, 기존 버튼, 미수정).

**메인 컨트롤 바 3장씩 이동(`jumpSlides`) 로직 (2026-07-29 추가):**
```ts
const jumpSlides = (delta: number) => {
  const target = (activeIndex + delta + photos.length) % photos.length;
  swiperRef.current?.slideToLoop(target);
};
```
- wraparound 모듈로 계산(`(idx + delta + length) % length`) 자체는 delta=±3, length=784(785장 중 018 제외)에서 off-by-one/음수나머지 없이 정확함 — 여러 경계값(0, 1, 2, 781, 783 등)으로 검산 완료.
- **잠재 이슈**: `showEnlarged`(같은 파일의 확대뷰 이동)는 `slideToLoop(index, 0, false)` + `setActiveIndex`를 함께 호출해 React state와 Swiper 내부 상태를 명시적으로 동기화하는 안전한 패턴을 쓰는 반면, `jumpSlides`는 React state(`activeIndex`, 클로저로 캡처)만 읽고 `slideToLoop`은 기본 speed/runCallbacks로 호출 → `onSlideChange`가 비동기 재렌더를 거쳐야 `activeIndex`가 갱신됨. 빠른 연타 시 두 번째 클릭이 아직 갱신되지 않은 `activeIndex`를 읽어 동일한 target을 다시 계산할 이론적 레이스 가능성이 있음 (785장 전체가 DOM에 렌더링되어 재렌더 비용이 있는 구조라 위험이 더 커짐 — 아래 Virtual 모듈 이슈와 연결). 근본적 해결은 `activeIndex` 대신 `swiperRef.current.realIndex`(Swiper 내부 동기 상태)를 직접 읽어 target을 계산하는 것 — `onSlideChange`에서도 이미 `swiper.realIndex`를 쓰고 있어 기존 패턴과 일관됨.
- `loopAdditionalSlides={2}` 설정에서 3칸 점프는 Swiper의 `loopFix()`가 내부적으로 처리하므로 구조적으로는 문제없음(임의 인덱스로 `slideToLoop` 가능하도록 설계됨). 다만 여유 버퍼가 크지 않으므로 loop 경계(인덱스 0 ↔ 783 부근) 왕복 시 실기기 육안 QA 권장.

**Why:** 향후 이 컴포넌트나 유사한 갤러리/캐러셀 컴포넌트를 리뷰할 때 동일한 동기화 함수 통합 여부 및 남은 이슈의 해결 여부를 확인해야 함. [[모바일 아이콘 버튼 터치 타겟 크기 체크]]

**How to apply:** `openEnlarged`가 `showEnlarged`를 재사용하는지는 이제 항상 통과할 것으로 기대되므로 재차 지적할 필요 없음. 메인 컨트롤 바 버튼은 44px로 수정 완료 확인됨(재지적 불필요). 다음 리뷰 시 (1) `jumpSlides`가 `activeIndex` 대신 `swiper.realIndex`를 쓰도록 수정됐는지, (2) `Virtual` 모듈 도입 여부(785장 DOM 전체 렌더 이슈, 아직 미수정)를 확인할 것. 다른 파일에서 Swiper loop 모드를 새로 쓰는 경우 `slideTo` 대신 `slideToLoop` 사용 여부를 체크.
