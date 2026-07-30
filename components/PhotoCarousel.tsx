"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Virtual } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/virtual";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface PhotoMeta {
  filename: string;
  url: string;
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

const TOTAL_PHOTOS = 785;
// 018.webp는 0바이트 깨진 파일이라 제외
const BROKEN_PHOTOS = new Set(["018"]);

const PHOTOS: PhotoMeta[] = Array.from({ length: TOTAL_PHOTOS }, (_, i) =>
  String(i + 1).padStart(3, "0"),
)
  .filter((num) => !BROKEN_PHOTOS.has(num))
  .map((num) => ({
    filename: `${num}.webp`,
    url: `/images/photos/${num}.webp`,
  }));

export default function PhotoCarousel() {
  const photos = PHOTOS;
  const swiperRef = useRef<SwiperType | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [autoplayOn, setAutoplayOn] = useState(false);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const enlargedPhoto = enlargedIndex !== null ? photos[enlargedIndex] : null;

  const showEnlarged = useCallback((index: number) => {
    setEnlargedIndex(index);
    setActiveIndex(index);
    swiperRef.current?.slideToLoop(index, 0, false);
  }, []);

  const openEnlarged = useCallback(
    (index: number) => {
      swiperRef.current?.autoplay.stop();
      showEnlarged(index);
    },
    [showEnlarged],
  );

  const closeEnlarged = () => {
    setEnlargedIndex(null);
    if (autoplayOn) swiperRef.current?.autoplay.start();
  };

  const showPrevEnlarged = () => {
    if (enlargedIndex === null) return;
    showEnlarged((enlargedIndex - 1 + photos.length) % photos.length);
  };

  const showNextEnlarged = () => {
    if (enlargedIndex === null) return;
    showEnlarged((enlargedIndex + 1) % photos.length);
  };

  const jumpSlides = (delta: number) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const target = (swiper.realIndex + delta + photos.length) % photos.length;
    swiper.slideToLoop(target);
  };

  const toggleAutoplay = () => {
    if (!swiperRef.current) return;
    if (autoplayOn) {
      swiperRef.current.autoplay.stop();
      if (progressBarRef.current) progressBarRef.current.style.width = "0%";
    } else {
      swiperRef.current.autoplay.start();
    }
    setAutoplayOn((prev) => !prev);
  };

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

  // 모바일: 위아래 스와이프 카드형 / PC(lg 이상): 기존 좌우 스와이프 유지
  const slides = useMemo(
    () =>
      photos.map((photo, i) => (
        <SwiperSlide
          key={photo.filename}
          className="shrink-0 aspect-[3/4] h-[min(48vh,380px)]! w-[min(36vh,285px)]! lg:h-auto! lg:w-[78vw]! lg:max-w-[384px]!"
        >
          <div
            className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl bg-gray-100 cursor-zoom-in"
            onClick={() => openEnlarged(i)}
          >
            <Image
              src={photo.url}
              alt={`몽골 선교 사진 ${i + 1}`}
              fill
              sizes="(max-width: 1023px) min(36vh, 285px), 78vw"
              loading={i === 0 ? "eager" : "lazy"}
              className="object-cover"
            />
          </div>
        </SwiperSlide>
      )),
    [photos, openEnlarged],
  );

  return (
    <>
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
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-sm font-bold tabular-nums"
                style={{ color: "#166534" }}
              >
                {activeIndex + 1} / {photos.length}
              </p>
              <button
                type="button"
                onClick={toggleAutoplay}
                className="flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5 active:scale-95 transition-transform [touch-action:manipulation]"
                style={{
                  background: autoplayOn
                    ? "#166534"
                    : "rgba(22, 101, 52, 0.12)",
                  color: autoplayOn ? "white" : "#166534",
                }}
                aria-label={autoplayOn ? "자동재생 끄기" : "자동재생 켜기"}
              >
                {autoplayOn ? (
                  <PauseIcon width={14} height={14} />
                ) : (
                  <PlayIcon width={14} height={14} />
                )}
                <span className="text-xs font-bold">
                  {autoplayOn ? "자동재생" : "정지됨"}
                </span>
              </button>
            </div>
            <div
              className="h-1 w-full rounded-full overflow-hidden mb-3"
              style={{ background: "rgba(22, 101, 52, 0.12)" }}
            >
              <div
                ref={progressBarRef}
                className="h-full rounded-full"
                style={{
                  width: "0%",
                  background: "#166534",
                  transition: "width 80ms linear",
                }}
              />
            </div>
            <div className="flex items-center justify-between px-4">
              <button
                type="button"
                onClick={() => jumpSlides(-3)}
                className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
                style={{ color: "#166534" }}
                aria-label="이전 사진 3장"
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
                <ArrowDownTrayIcon
                  width={22}
                  height={22}
                  style={{ color: "white" }}
                />
              </button>
              <button
                type="button"
                onClick={() => jumpSlides(3)}
                className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
                style={{ color: "#166534" }}
                aria-label="다음 사진 3장"
              >
                <ChevronRightIcon width={26} height={26} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* Swiper 캐러셀 */}
        <div
          className="flex-1 flex items-center min-w-0"
          style={{ paddingBottom: "calc(256px + env(safe-area-inset-bottom))" }}
        >
          <Swiper
            modules={[Autoplay, Virtual]}
            virtual
            direction="vertical"
            breakpoints={{
              1024: { direction: "horizontal" },
            }}
            centeredSlides
            slidesPerView="auto"
            spaceBetween={36}
            grabCursor
            loop
            loopAdditionalSlides={2}
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
              disableOnInteraction: false,
            }}
            onAutoplayTimeLeft={(_swiper, _timeLeft, percentage) => {
              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${(1 - percentage) * 100}%`;
              }
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              swiper.autoplay.stop();
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-[min(56vh,440px)] lg:h-auto"
          >
            {slides}
          </Swiper>
        </div>
      </div>

      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.9)" }}
          onClick={closeEnlarged}
        >
          <button
            type="button"
            onClick={closeEnlarged}
            className="absolute right-4 p-2 rounded-full active:scale-90 transition-transform [touch-action:manipulation]"
            style={{
              top: "calc(env(safe-area-inset-top) + 16px)",
              background: "rgba(255, 255, 255, 0.15)",
            }}
            aria-label="닫기"
          >
            <XMarkIcon width={22} height={22} className="text-white" />
          </button>

          <div
            className="relative w-full max-w-lg h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={enlargedPhoto.url}
              alt="몽골 선교 사진 확대"
              fill
              priority
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-contain"
            />

            <button
              type="button"
              onClick={showPrevEnlarged}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full active:scale-90 transition-transform [touch-action:manipulation]"
              style={{ background: "rgba(255, 255, 255, 0.15)" }}
              aria-label="이전 사진"
            >
              <ChevronLeftIcon width={26} height={26} className="text-white" />
            </button>

            <button
              type="button"
              onClick={showNextEnlarged}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full active:scale-90 transition-transform [touch-action:manipulation]"
              style={{ background: "rgba(255, 255, 255, 0.15)" }}
              aria-label="다음 사진"
            >
              <ChevronRightIcon width={26} height={26} className="text-white" />
            </button>
          </div>

          <p
            className="text-white/60 text-xs mt-4"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            배경을 탭하면 닫힙니다
          </p>
        </div>
      )}
    </>
  );
}
