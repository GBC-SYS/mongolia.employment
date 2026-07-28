"use client";

import { usePathname } from "next/navigation";

export default function AppPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPhotos = pathname === "/photos";

  return (
    <div
      id="app-panel"
      className={
        isPhotos
          ? "w-full lg:relative lg:h-screen lg:flex lg:flex-col"
          : "w-full lg:absolute lg:right-[190px] lg:top-0 lg:w-[390px] lg:h-screen lg:flex lg:flex-col lg:z-10 lg:[backdrop-filter:blur(2px)]"
      }
    >
      {children}
    </div>
  );
}
