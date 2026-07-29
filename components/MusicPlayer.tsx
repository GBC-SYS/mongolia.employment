"use client";

import { useRef, useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

interface MusicPlayerProps {
  src: string;
  title: string;
  artist?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onShuffleToggle?: () => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer({
  src,
  title,
  artist,
  onPrevious,
  onNext,
  onShuffleToggle,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackedSrc, setTrackedSrc] = useState(src);

  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="w-full rounded-3xl p-3"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1.5px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.10)",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="text-center mb-1">
        <p className="text-base font-bold" style={{ color: "#166534" }}>
          {title}
        </p>
        {artist && <p className="text-xs text-gray-500 mt-0.5">{artist}</p>}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-500 w-10 text-left">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="music-player-seek flex-1 h-1 rounded-full cursor-pointer [touch-action:manipulation]"
          style={{
            background: `linear-gradient(to right, #166534 ${progressPercent}%, rgba(0,0,0,0.1) ${progressPercent}%)`,
          }}
        />
        <span className="text-xs text-gray-500 w-10 text-right">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-1 px-2">
        <button
          type="button"
          onClick={onShuffleToggle}
          className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
          style={{ color: "#166534" }}
          aria-label="셔플"
        >
          <ArrowsRightLeftIcon width={20} height={20} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={onPrevious}
          className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
          style={{ color: "#166534" }}
          aria-label="이전 곡"
        >
          <BackwardIcon width={24} height={24} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
          style={{ background: "#166534" }}
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? (
            <PauseIcon width={20} height={20} style={{ color: "white" }} />
          ) : (
            <PlayIcon
              width={20}
              height={20}
              style={{ color: "white" }}
              className="ml-0.5"
            />
          )}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
          style={{ color: "#166534" }}
          aria-label="다음 곡"
        >
          <ForwardIcon width={24} height={24} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform [touch-action:manipulation]"
          style={{ color: "#166534" }}
          aria-label="재생목록"
        >
          <Bars3Icon width={20} height={20} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
