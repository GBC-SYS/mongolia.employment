---
name: 커밋 전 코드리뷰 필수 워크플로우
description: 커밋 전 code-reviewer 에이전트로 리뷰를 완료한 후 커밋해야 한다는 프로젝트 규칙
type: feedback
---

커밋·푸시 전에 반드시 code-reviewer 에이전트로 코드리뷰를 완료해야 한다.

**Why:** 프로젝트 스타일 가이드에 맞지 않는 코드나 지저분한 코드가 커밋되는 것을 방지하기 위해.

**How to apply:**
1. 코드리뷰가 완료된 상태에서만 커밋·푸시를 진행한다.
2. 리뷰 기준: CLAUDE.md 코딩 스타일 가이드 준수 여부 (Tailwind v4 @theme 방식, Jotai 패턴, ClientOnly 래퍼, glass morphism `const glass` 상수 패턴 등).
3. 수정이 필요한 부분이 있으면 반드시 수정 완료 후 커밋한다.
4. 기능은 동작하지만 코드가 지저분한 경우에도 정리(cleanup/refactor) 후 커밋한다.
