---
name: PhotoCarousel Swiper loop 동기화 패턴
description: components/PhotoCarousel.tsx의 확대뷰-배경캐러셀 상태 동기화 구조와 Swiper v14 loop API 사용법
type: project
---

`components/PhotoCarousel.tsx`(`/photos` 페이지, 785장 정적 이미지, Jotai 미사용 — 로컬 `useState`만 사용하므로 `ClientOnly`/`dynamic` 불필요)는 Swiper(`swiper: ^14.0.6`)를 `loop: true`로 사용하는 메인 캐러셀과, 탭하면 열리는 전체화면 확대 모달(`enlargedIndex: number | null` 기반)로 구성된다.

핵심 동기화 함수 `showEnlarged(index)`는 `setEnlargedIndex` + `setActiveIndex` + `swiperRef.current?.slideToLoop(index, 0, false)`를 함께 호출해 확대뷰/카운터("X / Y")/배경 캐러셀 위치 3곳을 동시에 맞춘다. `slideToLoop(index, speed, runCallbacks)`는 core.d.ts 기준 v14에도 존재하는 정식 API이며 loop 모드에서 `slideTo`(내부 중복 슬라이드 인덱스 기준) 대신 realIndex 기준으로 정확히 이동하는 올바른 선택.

2026-07-29 리뷰에서 지적됐던 `openEnlarged`의 `activeIndex` 미동기화 edge case는 **수정 완료**(같은 날 후속 커밋). `openEnlarged`가 이제 `showEnlarged(index)`를 그대로 호출해 `setEnlargedIndex`+`setActiveIndex`+`slideToLoop`가 한 번에 실행된다. 확대 모달의 좌/우 이동 버튼도 `w-11 h-11`(44px)로 수정 완료.

785장 슬라이드는 `modules={[Autoplay]}`만 사용하고 `Virtual` 모듈을 쓰지 않아, Swiper가 슬라이드 785개 전부를 DOM에 렌더링한다(각 슬라이드에 Next `<Image fill unoptimized>` 포함). 저사양 모바일에서 초기 렌더/스크립팅 부하 우려로 2026-07-29 리뷰에서 🟡로 지적, 아직 미수정.

메인 컨트롤 바(확대 모달이 아닌 캐러셀 상단 고정 바)의 이전/다음 버튼(`ChevronLeftIcon`/`ChevronRightIcon`)은 `width/height=26`만 있고 고정 크기 클래스나 패딩이 없어 실제 터치 영역이 26x26px에 불과 — 확대 모달 버튼과는 별개 위치의 터치 타겟 미달 이슈, 2026-07-29 리뷰에서 신규 발견, 아직 미수정. 닫기(X) 버튼은 `p-2`+icon22px=38x38px로 여전히 44px에 근소 미달(우선순위 낮음, 기존 버튼).

**Why:** 향후 이 컴포넌트나 유사한 갤러리/캐러셀 컴포넌트를 리뷰할 때 동일한 동기화 함수 통합 여부 및 남은 이슈의 해결 여부를 확인해야 함. [[모바일 아이콘 버튼 터치 타겟 크기 체크]]

**How to apply:** `openEnlarged`가 `showEnlarged`를 재사용하는지는 이제 항상 통과할 것으로 기대되므로 재차 지적할 필요 없음. 대신 (1) `Virtual` 모듈 도입 여부, (2) 메인 컨트롤 바 좌우 버튼의 44px 고정 여부를 다음 리뷰에서 확인할 것. 다른 파일에서 Swiper loop 모드를 새로 쓰는 경우 `slideTo` 대신 `slideToLoop` 사용 여부를 체크.
