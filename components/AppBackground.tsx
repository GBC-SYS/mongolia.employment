"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function AppBackground() {
  const pathname = usePathname();
  const isPhotos = pathname === "/photos";

  return (
    <div className={`fixed inset-0 -z-10 ${isPhotos ? "" : "lg:hidden"}`}>
      <Image
        src="/images/bg.webp"
        alt=""
        fill
        className="object-cover object-center"
        quality={90}
        priority
      />
    </div>
  );
}
