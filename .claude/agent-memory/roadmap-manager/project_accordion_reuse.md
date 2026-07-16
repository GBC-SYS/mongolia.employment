---
name: GuideAccordion 재사용 패턴
description: openOverride/onToggle props로 외부 Jotai atom과 GuideAccordion을 연동하는 방법
type: project
---

`GuideAccordion` 컴포넌트는 원래 내부 `guideOpenSectionsAtom`에 종속된 구조였으나, 전도 구문집(`/phrasebook`) 추가 시 `phrasebookOpenSectionsAtom`이라는 별도 atom이 필요해졌다.

**Why:** 섹션 열림 상태를 페이지마다 독립적으로 관리해야 하는데, 컴포넌트를 복제하면 유지보수 부담이 생기므로 props로 외부 제어를 허용하는 방식으로 개선.

**How to apply:** 새 페이지에서 `GuideAccordion`을 사용할 때는 `openOverride={open}` + `onToggle={toggle}` props를 넘겨 해당 페이지 전용 atom과 연동한다. props 미전달 시 내부 기본 동작(기존 가이드북 방식)으로 폴백.
