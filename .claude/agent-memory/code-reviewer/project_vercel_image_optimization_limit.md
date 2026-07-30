---
name: Vercel Hobby 이미지 최적화 무료 한도
description: 이 프로젝트(Vercel Hobby 무료 플랜)에서 next/image unoptimized 제거 시 반드시 확인해야 할 월간 고유 소스 이미지 한도
type: project
---

Vercel Hobby(무료) 플랜의 Image Optimization은 **월 1,000장의 "고유 소스 이미지(unique source images)"** 까지 무료이며, 초과 시 새로 최적화 요청되는 이미지는 402 에러로 실패한다(과금은 되지 않음, 2026-07-30 WebSearch로 확인: https://vercel.com/docs/image-optimization/limits-and-pricing).

2026-07-30 `components/PhotoCarousel.tsx` 리뷰에서 `<Image unoptimized>` 제거(785장 사진 갤러리, `/photos` 페이지)로 인해 이 한도 집계에 785장이 처음 포함되게 됨. 기도편지 이미지(31장, `/api/thumbnail/[id]` 및 `data/prayer-letters.ts`) 등 기존에 이미 최적화 대상이던 이미지까지 합치면 800장을 훌쩍 넘어 1,000장 한도에 근접.

**Why:** 이 프로젝트는 GitHub public 레포 + Vercel Hobby 무료 배포로 명시적으로 결정되어 있음(CLAUDE.md "주요 결정 사항"). 유료 플랜 업그레이드 계획이 없다면 이미지 소스 개수 자체가 배포 비용/가용성에 직접 영향을 주는 제약 조건이 됨.

**How to apply:** 앞으로 `next/image`의 `unoptimized`를 제거하거나 새 정적 이미지 세트(사진첩, 갤러리 등)를 추가하는 변경을 리뷰할 때마다, 프로젝트 전체에서 최적화 대상이 되는 고유 이미지 총 개수가 1,000장에 근접/초과하는지 반드시 계산해서 지적할 것. 초과가 우려되면 대안으로 (1) 일부 이미지만 `unoptimized` 유지, (2) 사전 리사이즈된 정적 파일을 별도 크기로 미리 생성해 next/image 최적화 자체를 우회, (3) Pro 플랜(5,000장) 업그레이드 검토를 제안할 것.
