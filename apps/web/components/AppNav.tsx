"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/labs", label: "Labs", match: (path: string) => path.startsWith("/labs") },
  { href: "/privacy", label: "Privacy", match: (path: string) => path.startsWith("/privacy") },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Playground" className="flex min-w-max w-full rounded-lg border border-[var(--line)] bg-white/55 p-1">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm transition ${
              active
                ? "bg-white font-medium text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
