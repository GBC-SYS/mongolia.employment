"use client";

export const dynamic = "force-dynamic";

import { useAtom } from "jotai";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import GuideAccordion from "@/components/GuideAccordion";
import PhraseEnlargeModal from "@/components/PhraseEnlargeModal";
import { phrasebookData } from "@/data/phrasebook";
import { phrasebookOpenSectionsAtom, enlargedPhraseAtom } from "@/store/atoms";

const brandDark = "#14532d";

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as React.CSSProperties;

function PhrasebookContent() {
  const [openSections, setOpenSections] = useAtom(phrasebookOpenSectionsAtom);
  const [, setEnlarged] = useAtom(enlargedPhraseAtom);

  return (
    <>
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
            >
              <div className="flex flex-col gap-2">
                {section.phrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3"
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
                        <p className="text-xs text-gray-400 leading-relaxed">{phrase.pron}</p>
                      </div>
                      <button
                        onClick={() => setEnlarged({ mn: phrase.mn, pron: phrase.pron })}
                        className="flex-shrink-0 p-2 rounded-lg active:scale-90 transition-transform"
                        style={{ background: "rgba(22,101,52,0.1)" }}
                        aria-label="크게 보기"
                      >
                        <ArrowsPointingOutIcon
                          width={16}
                          height={16}
                          strokeWidth={2}
                          style={{ color: brandDark }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GuideAccordion>
          );
        })}
      </div>
      <PhraseEnlargeModal />
    </>
  );
}

export default function PhrasebookPage() {
  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={glass}>
      <div
        className="px-5 pt-14 pb-6"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}
      >
        <h1 className="text-2xl font-bold text-gray-900">전도 구문집</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: brandDark }}>
          한·몽 표현 모음
        </p>
      </div>

      <PhrasebookContent />
    </div>
  );
}
