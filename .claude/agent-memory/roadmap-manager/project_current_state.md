---
name: 프로젝트 현재 상태
description: 2026-06-16 기준 전도 구문집 완료 후 전체 Phase 진행 현황
type: project
---

전도 구문집(`/phrasebook`) 완성으로 Phase 2 핵심 기능 구현이 전부 완료된 상태.

**Why:** 선교 출발일(2026-06-28)까지 D-12 시점에서 기능 추가는 사실상 마무리되었고, 이후는 QA와 운영 대응 중심.

**How to apply:** 새 기능 추가 요청이 들어오면 "런치 전 필수 여부"를 먼저 확인. Phase 4(QA/트래픽 대비)와 Phase 5(아카이빙)가 다음 우선순위.

## 완성된 페이지 목록 (2026-06-16 기준)

| 경로 | 페이지 | 상태 |
|------|--------|------|
| `/` | 홈 (카운트다운 + 진입 카드) | 완료 |
| `/prayer-letters` | 기도편지 그리드 | 완료 |
| `/prayer-letters/[id]` | 기도편지 상세 뷰어 | 완료 |
| `/guide` | 가이드북 아코디언 | 완료 |
| `/song` | 합창곡 한·몽 대역 가사 | 완료 |
| `/group-prayer` | 공동 기도제목 | 완료 |
| `/phrasebook` | 전도 구문집 (커밋 fe1e79d) | 완료 |

## 최근 완료 작업 (fe1e79d)

- `/phrasebook` 페이지 신규 추가
- 4개 섹션: 기본 인사 & 자기소개, 축복 & 사랑의 표현, 복음 핵심 메시지(10단계), 일상 표현
- `PhraseEnlargeModal` 컴포넌트 — 몽골어 전체화면 오버레이
- Jotai atoms: `phrasebookOpenSectionsAtom`, `enlargedPhraseAtom` (`store/atoms.ts`)
- 홈 페이지 진입 카드에 전도 구문집 추가
- `GuideAccordion`에 `openOverride`/`onToggle` 선택적 props 추가
