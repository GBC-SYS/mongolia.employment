"use client";

import { useAtom } from "jotai";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { guideOpenSectionsAtom } from "@/store/atoms";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  sectionKey: string;
  title: string;
  emoji: string;
  children: React.ReactNode;
}

export default function GuideAccordion({ sectionKey, title, emoji, children }: Props) {
  const [openSections, setOpenSections] = useAtom(guideOpenSectionsAtom);
  const open = !!openSections[sectionKey];

  const toggle = () =>
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));

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
        <ChevronDownIcon
          width={18}
          height={18}
          strokeWidth={2.5}
          className={cn(
            "text-gray-900 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </Card>
  );
}
