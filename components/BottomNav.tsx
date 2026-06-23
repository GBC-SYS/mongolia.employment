"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HomeIcon as HomeOutline, EnvelopeIcon as MailOutline, BookOpenIcon as BookOutline, MusicalNoteIcon as MusicOutline, HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HomeIcon as HomeSolid, EnvelopeIcon as MailSolid, BookOpenIcon as BookSolid, MusicalNoteIcon as MusicSolid, HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const navItems = [
  { href: "/", label: "홈", Icon: HomeOutline, IconActive: HomeSolid },
  { href: "/prayer-letters", label: "기도편지", Icon: MailOutline, IconActive: MailSolid },
  { href: "/group-prayer", label: "공동기도", Icon: HeartOutline, IconActive: HeartSolid },
  { href: "/song", label: "합창곡", Icon: MusicOutline, IconActive: MusicSolid },
  { href: "/guide", label: "가이드", Icon: BookOutline, IconActive: BookSolid },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    navItems.forEach(({ href }) => router.prefetch(href));
  }, [router]);

  useEffect(() => {
    const idx = navItems.findIndex((item) => item.href === pathname);
    const el = tabRefs.current[idx];
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const pad = 8;
    setPillStyle({
      left: rect.left - parentRect.left - pad,
      width: rect.width + pad * 2,
    });
  }, [pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:relative lg:bottom-auto lg:left-auto lg:right-auto"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        paddingBottom: "env(safe-area-inset-bottom)",
        borderTop: "1px solid rgba(255,255,255,0.8)",
      }}
    >
      <div className="relative flex items-center px-2 py-2">
        {/* 슬라이딩 pill 배경 */}
        {pillStyle && (
          <span
            className="absolute top-2 rounded-full"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              height: "calc(100% - 16px)",
              background: "rgba(0,0,0,0.13)",
              transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1), width 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              pointerEvents: "none",
            }}
          />
        )}

        {navItems.map(({ href, label, Icon, IconActive }, i) => {
          const isActive = pathname === href;
          const IconComponent = isActive ? IconActive : Icon;
          return (
            <Link
              key={href}
              href={href}
              ref={(el) => { tabRefs.current[i] = el; }}
              className="relative flex items-center justify-center gap-1.5 py-2.5 flex-1 [touch-action:manipulation]"
              style={{ color: isActive ? "#111" : "#6b7280" }}
            >
              <IconComponent
                width={22}
                height={22}
                strokeWidth={1.5}
              />
              {/* 활성 탭만 라벨 표시 */}
              {isActive && (
                <span className="text-sm font-semibold whitespace-nowrap">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
