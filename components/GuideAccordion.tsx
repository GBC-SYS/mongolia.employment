"use client";

import { useAtom } from "jotai";
import { ChevronDownIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { guideOpenSectionsAtom } from "@/store/atoms";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  sectionKey: string;
  title: string;
  emoji: string;
  children: React.ReactNode;
  openOverride?: boolean;
  onToggle?: () => void;
  audioSrc?: string;
  isAudioPlaying?: boolean;
  onAudioClick?: (e: React.MouseEvent) => void;
}

export default function GuideAccordion({
  sectionKey,
  title,
  emoji,
  children,
  openOverride,
  onToggle,
  audioSrc,
  isAudioPlaying,
  onAudioClick,
}: Props) {
  const [openSections, setOpenSections] = useAtom(guideOpenSectionsAtom);
  const open = openOverride !== undefined ? openOverride : !!openSections[sectionKey];

  const toggle = onToggle ?? (() =>
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] })));

  return (
    <Card
      className="overflow-hidden border-0 rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.95)",
      }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {audioSrc && onAudioClick && (
            <span
              role="button"
              aria-label={isAudioPlaying ? "재생 중지" : "전체 듣기"}
              onClick={(e) => { e.stopPropagation(); onAudioClick(e); }}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-90"
              style={{
                background: isAudioPlaying ? "rgba(22,101,52,0.85)" : "rgba(22,101,52,0.12)",
              }}
            >
              <SpeakerWaveIcon
                width={15}
                height={15}
                style={{ color: isAudioPlaying ? "#fff" : "#166534" }}
              />
            </span>
          )}
          <ChevronDownIcon
            width={18}
            height={18}
            strokeWidth={2.5}
            className={cn(
              "text-gray-900 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </Card>
  );
}
