import { atom } from "jotai";

export const selectedLetterAtom = atom<string | null>(null);

export const guideOpenSectionsAtom = atom<Record<string, boolean>>({
  weather: true,
  checklist: true,
  accommodation: true,
  safety: true,
  emergency: true,
});

export const checklistAtom = atom<Record<string, boolean>>({});

export const phrasebookOpenSectionsAtom = atom<Record<string, boolean>>({
  greeting: true,
  blessing: true,
  confession: false,
  gospel: false,
  vocab: false,
  daily: false,
});

export const enlargedPhraseAtom = atom<{ mn: string; pron: string } | null>(null);

export const qtSelectedDayAtom = atom<number>(1);
export const qtVerseOpenAtom = atom<boolean>(false);
