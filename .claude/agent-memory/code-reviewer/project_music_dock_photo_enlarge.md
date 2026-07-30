---
name: MusicPlayerDock와 /photos 확대뷰 간 상호작용 패턴
description: photoEnlargedAtom으로 확대뷰 중 MusicPlayerDock을 숨기는 구조 — unmount 방식의 오디오 재생 중단 위험 기록
type: project
---

2026-07-30 커밋(store/atoms.ts에 `photoEnlargedAtom` 추가)에서 `/photos` 확대뷰(전체화면 모달, z-[60])가 열릴 때 `MusicPlayerDock`(z-50, `backdrop-filter` 적용된 `fixed`)이 WebKit에서 z-index를 무시하고 모달 위에 그려지는 버그를 고쳤다. `components/PhotoCarousel.tsx`가 `useSetAtom(photoEnlargedAtom)`으로 확대뷰 열림/닫힘을 쓰고, `components/MusicPlayerDock.tsx`가 `useAtomValue(photoEnlargedAtom)`로 읽어서 열려있으면 컴포넌트 전체를 `return null`(완전 언마운트)한다.

**문제:** `MusicPlayerDockInner`가 `return null`하면 내부의 `<MusicPlayer>`가 렌더링하는 `<audio>` 엘리먼트까지 통째로 언마운트된다. `components/MusicPlayer.tsx`는 재생 상태(`isPlaying`, `currentTime`)를 전부 로컬 `useState`로 갖고 있어서, 확대뷰를 열 때마다 음악이 끊기고 닫으면 처음부터(0:00, 정지 상태) 다시 마운트된다 — "전역 고정 뮤직 플레이어"라는 설계 의도(layout.tsx 주석)와 배치되는 회귀. z-index/컴포지팅 버그는 `return null` 대신 컨테이너 div에 Tailwind `hidden`(display:none) 클래스만 조건부로 주는 방식으로도 동일하게 해결되면서(display:none 엘리먼트는 컴포지팅 레이어를 만들지 않음) `<audio>`를 계속 마운트 상태로 유지해 재생이 끊기지 않는다. 2026-07-30 리뷰에서 🔴로 지적, 수정 여부는 다음 리뷰 시 확인 필요.

**부수 이슈:** `photoEnlargedAtom`은 PhotoCarousel의 로컬 `enlargedIndex`(useState)와 별도로 유지되는 상태라 두 곳에서 수동 동기화해야 한다(openEnlarged/closeEnlarged 두 지점에서만 set). 사용자가 확대뷰를 연 채로 브라우저/OS 뒤로가기 등으로 `/photos`를 완전히 벗어나면(닫기 버튼을 거치지 않음) `photoEnlargedAtom`이 `true`로 남아, 이후 `/photos`에 재진입해도 MusicPlayerDock이 계속 숨겨진 채로 있는 엣지케이스가 있다(다시 사진을 열었다 닫으면 자연 복구됨). PhotoCarousel에 `useEffect(() => () => setPhotoEnlarged(false), [setPhotoEnlarged])` 언마운트 클린업을 추가하면 해결됨.

**Why:** 이 프로젝트는 WebKit `backdrop-filter` + `fixed` 컴포지팅 버그를 CLAUDE.md에 "금지 패턴"으로 이미 문서화해뒀지만(고정 조상 밑 자식 케이스), 이번 건은 "형제 관계의 두 fixed 오버레이 사이 z-index 무시"라는 변종이라 documented 패턴만으로는 안 걸러진다. 또한 "숨김 = 언마운트"로 해결하면 살아있는 재생 상태를 가진 컴포넌트(오디오/비디오 플레이어, 타이머 등)에서는 항상 회귀 위험이 있다는 게 이번 케이스의 일반화 가능한 교훈.

**How to apply:** 이후 `/photos`, `MusicPlayerDock`, `photoEnlargedAtom` 관련 diff를 볼 때: (1) 오디오 언마운트 문제가 실제로 고쳐졌는지(hidden 클래스 방식으로 전환됐는지) 확인, (2) PhotoCarousel 언마운트 시 atom 초기화 클린업이 추가됐는지 확인, (3) 다른 곳에서도 "숨김 필요 = return null" 패턴을 쓰려는 코드가 있으면 내부에 재생/타이머/포커스 등 살아있는 상태가 있는지부터 먼저 물어볼 것.
