import Link from "next/link";
import { Logo } from "./Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-cream/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
        <Logo compact />
        <nav className="hidden items-center gap-8 text-base font-semibold md:flex">
          <Link href="/labs">Labs</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <Link
          href="/labs"
          className="rounded-full bg-apricot px-5 py-2.5 text-sm font-semibold text-ink md:px-6 md:text-base"
        >
          Open a lab
        </Link>
      </div>
    </header>
  );
}
