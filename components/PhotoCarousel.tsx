"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  // Swiper의 virtual+loop 모드는 direction을 런타임에 바꾸면(breakpoints 포함)
  // realIndex가 깨지는 라이브러리 버그가 있어, PC/모바일 Swiper 인스턴스를
  // 아예 분리해서(direction 고정) 렌더링한다 — 1024px 경계를 넘을 때만 리마운트됨
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
          className="shrink-0 h-full! w-full! lg:aspect-[3/4] lg:h-auto! lg:w-[78vw]! lg:max-w-[384px]!"
        >
          <div className="w-full h-full p-4 pb-6 lg:p-0">
            <div
              className="relative w-full h-full rounded-3xl shadow-xl overflow-hidden bg-gray-100 cursor-zoom-in"
              onClick={() => openEnlarged(i)}
            >
              <Image
                src={photo.url}
                alt={`몽골 선교 사진 ${i + 1}`}
                fill
                sizes="(max-width: 1023px) 100vw, 384px"
                loading={i === 0 ? "eager" : "lazy"}
                className="object-cover"
              />
            </div>
          </div>
        </SwiperSlide>
      )),
    [photos, openEnlarged],
  );

  const commonSwiperProps = {
    modules: [Autoplay, Virtual],
    centeredSlides: true,
    grabCursor: true,
    loop: true,
    autoplay: {
      delay: 3000,
      pauseOnMouseEnter: true,
      disableOnInteraction: false,
    },
    onAutoplayTimeLeft: (
      _swiper: SwiperType,
      _timeLeft: number,
      percentage: number,
    ) => {
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${(1 - percentage) * 100}%`;
      }
    },
    onSwiper: (swiper: SwiperType) => {
      swiperRef.current = swiper;
      if (autoplayOn) swiper.autoplay.start();
      else swiper.autoplay.stop();
    },
    onSlideChange: (swiper: SwiperType) => setActiveIndex(swiper.realIndex),
  };

  return (
    <>
      <div
        className="h-dvh overflow-hidden flex flex-col lg:h-auto lg:min-h-screen lg:overflow-visible"
        style={glass}
      >
        {/* 컨트롤 바: 모바일에서는 릴스형 전체화면 뷰를 위해 숨김, PC는 기존 유지 */}
        <div className="hidden lg:block px-4 pt-6 pb-2 flex-shrink-0 w-full max-w-sm mx-auto">
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
        <div className="flex-1 flex items-center min-w-0 min-h-0 pt-[env(safe-area-inset-top)] pb-[calc(166px+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-[calc(256px+env(safe-area-inset-bottom))]">
          {/*
            PC/모바일 Swiper를 key로 강제 구분해서 완전히 다른 인스턴스로 만든다.
            key 없이 삼항으로만 분기하면 React가 같은 타입/같은 위치라 인스턴스를
            재사용해버리고, 그러면 direction prop이 바뀔 때 Swiper 내부적으로
            swiper.changeDirection()이 호출되는데 이게 virtual+loop 조합에서
            realIndex를 깨뜨리는 라이브러리 버그 경로다(PC 카드 중앙정렬 버그 원인).
            key로 완전 리마운트시켜 이 경로 자체를 타지 않게 한다.
          */}
          {isDesktop ? (
            <Swiper
              key="desktop"
              initialSlide={activeIndex}
              {...commonSwiperProps}
              virtual={{ slidesPerViewAutoSlideSize: 384 }}
              direction="horizontal"
              slidesPerView="auto"
              spaceBetween={36}
              className="w-full h-auto"
            >
              {slides}
            </Swiper>
          ) : (
            <Swiper
              key="mobile"
              initialSlide={activeIndex}
              {...commonSwiperProps}
              virtual
              direction="vertical"
              slidesPerView={1}
              spaceBetween={0}
              className="w-full h-full [&_.swiper-wrapper]:h-full!"
            >
              {slides}
            </Swiper>
          )}
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
            onClick={(e) => {
              e.stopPropagation();
              closeEnlarged();
            }}
            className="absolute right-4 p-3 rounded-full active:scale-90 transition-transform [touch-action:manipulation]"
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
