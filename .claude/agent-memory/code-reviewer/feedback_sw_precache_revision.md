---
name: SW precache revision 고정 문자열 금지
description: additionalPrecacheEntries의 revision을 "v1" 고정 문자열로 쓰면 파일 변경 시 SW가 재다운로드하지 않는 버그 발생
type: feedback
---

`revision: "v1"` 고정 문자열은 SW 설치 후 파일 내용이 바뀌어도 SW가 변경을 감지하지 못해 낡은 파일을 오프라인에서 계속 제공한다.

**Why:** SW precache는 revision 값 변경 여부로 캐시 무효화를 판단한다. 고정 문자열은 항상 동일하므로 재검증이 발생하지 않는다.

**How to apply:** `additionalPrecacheEntries`의 revision은 반드시 빌드마다 달라지는 값을 사용할 것.
```ts
const BUILD_REVISION = Date.now().toString();
// 또는 process.env.VERCEL_GIT_COMMIT_SHA 사용 (Vercel 환경에서 더 명확)
```
