import { atom } from "jotai";

export const selectedLetterAtom = atom<string | null>(null);

export const guideOpenSectionsAtom = atom<Record<string, boolean>>({
  weather: true,
  checklist: true,
  safety: true,
  emergency: true,
});

export const checklistAtom = atom<Record<string, boolean>>({});
