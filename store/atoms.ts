import { atom } from "jotai";

export const selectedLetterAtom = atom<string | null>(null);

export const guideOpenSectionsAtom = atom<Record<string, boolean>>({
  weather: true,
  checklist: false,
  safety: false,
  emergency: false,
});

export const checklistAtom = atom<Record<string, boolean>>({});
