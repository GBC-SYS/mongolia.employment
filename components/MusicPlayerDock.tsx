"use client";

import { usePathname } from "next/navigation";
import MusicPlayer from "@/components/MusicPlayer";
import { songData } from "@/data/guide-content";

export default function MusicPlayerDock() {
  const pathname = usePathname();
  const isPhotos = pathname === "/photos";
  if (!isPhotos) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ bottom: "env(safe-area-inset-bottom)" }}
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
