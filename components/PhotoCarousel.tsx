"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-coverflow";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export interface PhotoMeta {
  filename: string;
  url: string;
  date: string;
}

const isIOS = () =>
  typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

const MOCK_PHOTOS: PhotoMeta[] = Array.from({ length: 12 }, (_, i) => ({
  filename: `mongolia_${String(i + 1).padStart(3, "0")}.jpg`,
  url: `https://picsum.photos/seed/mongolia${i + 1}/800/800`,
  date: "2026-06-29",
}));

export default function PhotoCarousel() {
  const photos = MOCK_PHOTOS;
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const photo = photos[activeIndex];
    if (isIOS()) {
      alert("이미지를 길게 눌러 '사진에 저장'을 선택해 주세요.");
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(photo.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("다운로드에 실패했습니다. 이미지를 길게 눌러 저장해 주세요.");
      window.open(photo.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const glass = {
    background: "rgba(255, 255, 255, 0.55)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col" style={glass}>
      {/* 컨트롤 바 */}
      <div className="px-4 pt-12 pb-2 flex-shrink-0 w-full max-w-sm mx-auto">
        <div
          className="rounded-3xl p-4"
          style={{
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1.5px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.10)",
          }}
        >
          <p
            className="text-center text-sm font-bold mb-3 tabular-nums"
            style={{ color: "#166534" }}
          >
            {activeIndex + 1} / {photos.length}
          </p>
          <div className="flex items-center justify-between px-4">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={activeIndex === 0}
              className="disabled:opacity-30 active:scale-90 transition-transform [touch-action:manipulation]"
              style={{ color: "#166534" }}
              aria-label="이전 사진"
            >
              <ChevronLeftIcon width={26} height={26} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation] disabled:opacity-50"
              style={{ background: "#166534" }}
              aria-label="다운로드"
            >
              <ArrowDownTrayIcon width={22} height={22} style={{ color: "white" }} />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={activeIndex === photos.length - 1}
              className="disabled:opacity-30 active:scale-90 transition-transform [touch-action:manipulation]"
              style={{ color: "#166534" }}
              aria-label="다음 사진"
            >
              <ChevronRightIcon width={26} height={26} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper 코드플로우 캐러셀 */}
      <div
        className="flex-1 flex items-center min-w-0"
        style={{ paddingBottom: "calc(256px + env(safe-area-inset-bottom))" }}
      >
        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          slidesPerView="auto"
          spaceBetween={20}
          grabCursor
          coverflowEffect={{
            rotate: 0,
            stretch: 20,
            depth: 120,
            modifier: 1,
            slideShadows: false,
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full"
        >
          {photos.map((photo, i) => (
            <SwiperSlide
              key={photo.filename}
              style={{ width: "78vw", maxWidth: "384px", flexShrink: 0 }}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl bg-gray-100">
                <Image
                  src={photo.url}
                  alt={`선교 사진 ${photo.date}`}
                  fill
                  unoptimized
                  loading={i === 0 ? "eager" : "lazy"}
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
