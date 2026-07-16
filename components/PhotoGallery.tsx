"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  XMarkIcon,
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

export default function PhotoGallery() {
  const photos = MOCK_PHOTOS;
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async (photo: PhotoMeta) => {
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

  const closeModal = () => setSelectedIndex(-1);
  const goPrev = () => setSelectedIndex((i) => Math.max(0, i - 1));
  const goNext = () => setSelectedIndex((i) => Math.min(photos.length - 1, i + 1));

  const glass = {
    background: "rgba(255, 255, 255, 0.55)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
  } as React.CSSProperties;

  // mounted 가드 — SSR 단계에서 document.body 접근 방지
  const modal =
    mounted && selectedIndex >= 0
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ background: "#000" }}
          >
            {/* 상단 버튼 바 */}
            <div
              className="flex items-center justify-between px-4 pb-2 flex-shrink-0"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
            >
              <button
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 [touch-action:manipulation]"
                aria-label="닫기"
              >
                <XMarkIcon width={22} height={22} />
              </button>
              <p className="text-white/70 text-sm tabular-nums">
                {selectedIndex + 1} / {photos.length}
              </p>
              <button
                onClick={() => handleDownload(photos[selectedIndex])}
                disabled={downloading}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 disabled:opacity-50 [touch-action:manipulation]"
                aria-label="다운로드"
              >
                <ArrowDownTrayIcon width={20} height={20} />
              </button>
            </div>

            {/* 이미지 영역 */}
            <div className="flex-1 relative min-h-0">
              <Image
                key={selectedIndex}
                src={photos[selectedIndex].url}
                alt=""
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {/* 이전/다음 버튼 */}
            <div
              className="flex items-center justify-between px-6 pt-3 flex-shrink-0"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            >
              <button
                onClick={goPrev}
                disabled={selectedIndex === 0}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 disabled:opacity-20 [touch-action:manipulation]"
                aria-label="이전"
              >
                <ChevronLeftIcon width={24} height={24} />
              </button>
              <p className="text-white/40 text-xs truncate max-w-[160px]">
                {photos[selectedIndex].filename}
              </p>
              <button
                onClick={goNext}
                disabled={selectedIndex === photos.length - 1}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 disabled:opacity-20 [touch-action:manipulation]"
                aria-label="다음"
              >
                <ChevronRightIcon width={24} height={24} />
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="min-h-screen pb-20" style={glass}>
        {/* 헤더 */}
        <div
          className="px-5 pt-12 pb-3"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}
        >
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-gray-900">선교 사진</h1>
            <span className="text-xs text-gray-400">{photos.length}장</span>
          </div>
        </div>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-3 gap-0.5">
          {photos.map((photo, index) => (
            <button
              key={photo.filename}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-square overflow-hidden bg-gray-100 active:opacity-75 transition-opacity [touch-action:manipulation]"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                unoptimized
                loading="lazy"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {modal}
    </>
  );
}
