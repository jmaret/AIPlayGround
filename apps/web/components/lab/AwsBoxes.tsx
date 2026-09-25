"use client";

import type { AwsTwinMap } from "./aws";
import { AwsTwin } from "./AwsTwin";

type AwsBoxesProps = {
  twins: Record<string, AwsTwinMap>;
  order: readonly string[];
  activeId?: string | null;
};

export function AwsBoxes({ twins, order, activeId = null }: AwsBoxesProps) {
  const items = order.filter((id) => twins[id]);
  return (
    <div className="min-w-0">
      {items.map((id, index) => (
        <div key={id}>
          <AwsTwin map={twins[id]} active={activeId === id} compact={false} />
          {index < items.length - 1 ? <BoxArrow /> : null}
        </div>
      ))}
    </div>
  );
}

function BoxArrow() {
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <svg width="18" height="22" viewBox="0 0 18 22" className="text-[var(--accent)]">
        <path
          d="M9 1.5v16M3.5 13.5 9 19.5 14.5 13.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
