import Link from "next/link";

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const size = compact ? 36 : 44;
  return (
    <Link href="/" className={`flex items-center gap-3 ${light ? "text-cream" : "text-ink"}`}>
      <img src="/brand/logo.svg" alt="" width={size} height={size} />
      <span className="font-display text-2xl font-semibold tracking-tight">Playground</span>
    </Link>
  );
}
