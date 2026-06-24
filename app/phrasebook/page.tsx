"use client";

export const dynamic = "force-dynamic";

import { useAtom } from "jotai";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SpeakerWaveIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import GuideAccordion from "@/components/GuideAccordion";
import ClientOnly from "@/components/ClientOnly";
import { phrasebookData } from "@/data/phrasebook";
import { phrasebookOpenSectionsAtom } from "@/store/atoms";

const brandDark = "#14532d";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as React.CSSProperties;

const SECTION_AUDIO: Record<string, string> = {
  blessing:   "/audio/phrasebook/section_blessing.mp3",
  confession: "/audio/phrasebook/section_confession.mp3",
  gospel:     "/audio/phrasebook/section_gospel.mp3",
  vocab:      "/audio/phrasebook/section_vocab.mp3",
};


function PhrasebookContent() {
  const [openSections, setOpenSections] = useAtom(phrasebookOpenSectionsAtom);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [playingWordIdx, setPlayingWordIdx] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playingSectionKey, setPlayingSectionKey] = useState<string | null>(null);
  const sectionAudioRef = useRef<HTMLAudioElement | null>(null);

  // 언마운트 시 재생 중인 오디오·interval 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (sectionAudioRef.current) { sectionAudioRef.current.pause(); sectionAudioRef.current = null; }
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const stopSectionAudio = () => {
    sectionAudioRef.current?.pause();
    sectionAudioRef.current = null;
    setPlayingSectionKey(null);
  };

  const stopAll = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPlayingKey(null);
    setPlayingWordIdx(-1);
    stopSectionAudio();
  };

  const handleSectionAudio = (sectionKey: string) => {
    const wasPlaying = playingSectionKey === sectionKey;
    stopAll();
    if (wasPlaying) return;

    const src = SECTION_AUDIO[sectionKey];
    if (!src) return;

    setPlayingSectionKey(sectionKey);
    const audio = new Audio(src);
    sectionAudioRef.current = audio;
    audio.onended = () => {
      audio.onended = null;
      stopSectionAudio();
    };
    audio.play().catch(() => stopSectionAudio());
  };

  const playAudio = (src: string, pron: string, key: string) => {
    const audio = new Audio(src);
    audioRef.current = audio;
    const pronWords = pron.trim().split(/\s+/);
    setPlayingKey(key);
    setPlayingWordIdx(0);

    const startInterval = () => {
      if (intervalRef.current) return;
      if (!isFinite(audio.duration) || audio.duration === 0) return;
      const wordDuration = audio.duration / pronWords.length;
      intervalRef.current = setInterval(() => {
        const idx = Math.min(Math.floor(audio.currentTime / wordDuration), pronWords.length - 1);
        setPlayingWordIdx(idx);
      }, 80);
    };

    // 캐시된 파일은 loadedmetadata가 이미 완료된 상태일 수 있음
    if (audio.readyState >= 1) {
      startInterval();
    } else {
      const handleMetadata = () => {
        audio.removeEventListener("loadedmetadata", handleMetadata);
        startInterval();
      };
      audio.addEventListener("loadedmetadata", handleMetadata);
    }

    audio.onended = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setPlayingKey(null);
      setPlayingWordIdx(-1);
    };
    audio.play().catch(() => stopAll());
  };

  const speakMongolian = (mn: string, pron: string, key: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(mn);
    utterance.lang = "mn-MN";
    utterance.rate = 0.82;
    const voices = window.speechSynthesis.getVoices();
    const mnVoice = voices.find((v) => v.lang.startsWith("mn"));
    if (mnVoice) utterance.voice = mnVoice;
    const pronWords = pron.trim().split(/\s+/);
    let wordCount = 0;
    utterance.onboundary = (e) => {
      if (e.name === "word" && wordCount < pronWords.length) {
        setPlayingWordIdx(wordCount);
        wordCount++;
      }
    };
    utterance.onend = () => { setPlayingKey(null); setPlayingWordIdx(-1); };
    utterance.onerror = () => { setPlayingKey(null); setPlayingWordIdx(-1); };
    setPlayingKey(key);
    setPlayingWordIdx(0);
    window.speechSynthesis.speak(utterance);
  };

  const handleAudio = (phrase: { mn: string; pron: string; audio?: string }, key: string) => {
    // stopAll 전에 현재 재생 중인지 캡처 → 토글 정지 버그 방지
    const wasPlaying = playingKey === key;
    stopAll();
    if (wasPlaying) return;

    if (phrase.audio) {
      playAudio(phrase.audio, phrase.pron, key);
    } else {
      speakMongolian(phrase.mn, phrase.pron, key);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {phrasebookData.map((section) => {
        const open = !!openSections[section.key];
        const toggle = () =>
          setOpenSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }));

        return (
          <GuideAccordion
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            emoji={section.emoji}
            openOverride={open}
            onToggle={toggle}
            audioSrc={SECTION_AUDIO[section.key]}
            isAudioPlaying={playingSectionKey === section.key}
            onAudioClick={() => handleSectionAudio(section.key)}
          >
            <div className="flex flex-col gap-2">
              {section.phrases.map((phrase, i) => {
                const audioKey = `${section.key}_${i}`;
                const isPlaying = playingKey === audioKey;
                return (
                  <div
                    key={`${section.key}_${i}`}
                    className="rounded-xl px-4 py-3 transition-[background] duration-150"
                    style={{ background: "rgba(255,255,255,0.65)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {section.numbered && (
                            <span
                              className="flex-shrink-0 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center border"
                              style={{
                                background: "rgba(22,101,52,0.1)",
                                color: brandDark,
                                borderColor: "rgba(22,101,52,0.3)",
                              }}
                            >
                              {i + 1}
                            </span>
                          )}
                          <p className="text-xs text-gray-500 leading-relaxed">{phrase.ko}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">
                          {phrase.mn}
                        </p>
                        <p className="text-xs leading-relaxed">
                          {isPlaying
                            ? phrase.pron.trim().split(/\s+/).map((word, wi) => (
                                <span
                                  key={wi}
                                  className="transition-all duration-150"
                                  style={
                                    wi === playingWordIdx
                                      ? {
                                          background: "linear-gradient(120deg, #bbf7d0 0%, #86efac 100%)",
                                          color: "#14532d",
                                          fontWeight: 700,
                                          borderRadius: "3px",
                                          padding: "1px 3px",
                                        }
                                      : { color: "#9ca3af" }
                                  }
                                >
                                  {word}{" "}
                                </span>
                              ))
                            : <span style={{ color: "#9ca3af" }}>{phrase.pron}</span>
                          }
                        </p>
                      </div>
                      {phrase.audio && (
                        <button
                          onClick={() => handleAudio(phrase, audioKey)}
                          className="flex-shrink-0 p-2 rounded-lg active:scale-90 transition-all"
                          style={{
                            background: isPlaying ? "rgba(22,101,52,0.85)" : "rgba(22,101,52,0.1)",
                          }}
                          aria-label="발음 듣기"
                        >
                          <SpeakerWaveIcon
                            width={16}
                            height={16}
                            style={{ color: isPlaying ? "#fff" : brandDark }}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GuideAccordion>
        );
      })}
    </div>
  );
}

export default function PhrasebookPage() {
  const router = useRouter();

  const handleBack = () => {
    const isSameOrigin =
      document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (isSameOrigin) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={glass}>
      <div
        className="px-5 pt-14 pb-6"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
            style={{ background: "rgba(243, 244, 246, 0.9)" }}
            aria-label="뒤로가기"
          >
            <ChevronLeftIcon width={16} height={16} style={{ color: "#374151" }} />
          </button>
          <div>
            <p className="text-xs font-medium" style={{ color: brandDark }}>몽골 선교팀</p>
            <h1 className="text-2xl font-bold text-gray-900">전도 구문집</h1>
          </div>
        </div>
      </div>

      <ClientOnly>
        <PhrasebookContent />
      </ClientOnly>
    </div>
  );
}
