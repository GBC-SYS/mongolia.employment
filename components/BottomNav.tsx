"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, Book } from "iconoir-react";

const navItems = [
  { href: "/", label: "홈", Icon: Home },
  { href: "/prayer-letters", label: "기도편지", Icon: Mail },
  { href: "/guide", label: "가이드", Icon: Book },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:relative lg:bottom-auto lg:left-auto lg:right-auto border-t"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderColor: "rgba(255, 255, 255, 0.8)",
      }}
    >
      <div className="flex">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive ? "text-[#166534]" : "text-gray-400"
              }`}
            >
              <Icon width={22} height={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
