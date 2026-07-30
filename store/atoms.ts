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

// /photos 확대뷰가 열려있는 동안 MusicPlayerDock을 숨기기 위한 atom.
// WebKit이 backdrop-filter가 걸린 fixed 요소를 z-index 무시하고 항상 위에
// 그리는 버그가 있어, 확대뷰의 어두운 배경 위로 플레이어가 비쳐 보이는 문제를 막는다.
export const photoEnlargedAtom = atom<boolean>(false);
