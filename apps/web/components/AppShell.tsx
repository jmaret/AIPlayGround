import type { ReactNode } from "react";
import Link from "next/link";
import { AppNav } from "./AppNav";
import { Logo } from "./Logo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--line)]/80 bg-[rgba(238,243,245,0.86)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <div className="flex shrink-0 items-center justify-end gap-2">
              <Link href="/labs" className="btn-accent">
                Open a lab
              </Link>
            </div>
          </div>
          <div className="mt-3 min-w-0 overflow-x-auto">
            <AppNav />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
      <footer className="mx-auto w-full max-w-3xl px-4 pb-8 text-sm text-[var(--ink-muted)] sm:px-6">
        Local only. No accounts. No newsletter. Docs live in the repo under docs/.
      </footer>
    </div>
  );
}
