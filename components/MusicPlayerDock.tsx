"use client";

import { useAtomValue } from "jotai";
import { usePathname } from "next/navigation";
import ClientOnly from "@/components/ClientOnly";
import MusicPlayer from "@/components/MusicPlayer";
import { songData } from "@/data/guide-content";
import { photoEnlargedAtom } from "@/store/atoms";

function MusicPlayerDockInner() {
  const pathname = usePathname();
  const isPhotos = pathname === "/photos";
  const isPhotoEnlarged = useAtomValue(photoEnlargedAtom);
  if (!isPhotos) return null;

  // 확대뷰가 열려있을 때는 return null로 언마운트하지 않고 display:none으로만
  // 숨긴다 — 언마운트하면 <audio> 재생 중이던 음악이 끊긴다. display:none
  // 요소는 컴포지팅/페인트 대상에서 제외되므로, 애초에 이 컴포넌트를 숨기게 만든
  // WebKit의 backdrop-filter fixed 요소 z-index 무시 버그도 함께 회피된다.
  return (
    <div
      className={`fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none ${isPhotoEnlarged ? "hidden" : ""}`}
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      <div className="w-full max-w-sm pointer-events-auto">
        <MusicPlayer
          src="/audio/songs/song.mp3"
          title="다시 밤이 없겠고"
          artist={songData.title}
        />
      </div>
    </div>
  );
}

export default function MusicPlayerDock() {
  return (
    <ClientOnly>
      <MusicPlayerDockInner />
    </ClientOnly>
  );
}
