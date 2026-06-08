"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { Check } from "iconoir-react";
import { checklistAtom } from "@/store/atoms";
import { checklistData } from "@/data/guide-content";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mongol-checklist";

export default function Checklist() {
  const [checked, setChecked] = useAtom(checklistAtom);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, [setChecked]);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const totalItems = checklistData.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">
          {checkedCount} / {totalItems} 완료
        </p>
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${(checkedCount / totalItems) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {checklistData.categories.map((cat) => (
          <div key={cat.name}>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <span>{cat.emoji}</span>
              {cat.name}
            </h4>
            <div className="flex flex-col gap-2">
              {cat.items.map((item) => {
                const key = `${cat.name}-${item}`;
                const isChecked = !!checked[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex items-start gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isChecked
                          ? "bg-blue-500 border-blue-500"
                          : "border-white/20"
                      )}
                    >
                      {isChecked && (
                        <Check width={11} height={11} className="text-white" strokeWidth={3} />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm leading-relaxed transition-colors",
                        isChecked ? "text-slate-600 line-through" : "text-slate-300"
                      )}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
