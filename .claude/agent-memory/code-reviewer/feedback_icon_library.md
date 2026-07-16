---
name: 아이콘 라이브러리 실제 사용 현황
description: CLAUDE.md는 iconoir-react 명시하지만 실제 코드는 @heroicons/react를 사용 중
type: feedback
---

CLAUDE.md 문서는 `iconoir-react`를 아이콘 라이브러리로 명시하고 있으나, 실제 코드베이스는 전부 `@heroicons/react/24/outline` 및 `@heroicons/react/24/solid`를 사용하고 있다.

**Why:** 구현 과정에서 heroicons으로 통일된 것으로 보이며, 문서가 갱신되지 않았다.

**How to apply:** 리뷰 시 아이콘 props(`width/height/strokeWidth`)는 heroicons 패턴 기준으로 평가한다. iconoir 미사용을 이슈로 지적하지 말 것.
