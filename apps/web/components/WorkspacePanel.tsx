import type { ReactNode } from "react";

const PANEL =
  "w-full overflow-x-auto rounded-xl border border-[var(--line)] bg-white/85 shadow-[0_18px_50px_-36px_rgba(15,40,50,0.55)] backdrop-blur-sm";

export function WorkspacePanel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={`${PANEL} ${padded ? "p-5 sm:p-7" : ""} ${className}`.trim()}>{children}</div>;
}
