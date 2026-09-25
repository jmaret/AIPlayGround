import Link from "next/link";
import { LabShell } from "@/components/LabShell";
import type { AwsTwinMap } from "./aws";
import { AwsBoxes } from "./AwsBoxes";

type LabArchitectureProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  labHref: string;
  what: string;
  why: string;
  seeing: string;
  blurb: string;
  twins: Record<string, AwsTwinMap>;
  order: readonly string[];
};

export function LabArchitecture({
  eyebrow,
  title,
  subtitle,
  labHref,
  what,
  why,
  seeing,
  blurb,
  twins,
  order,
}: LabArchitectureProps) {
  return (
    <LabShell eyebrow={eyebrow} title={title} subtitle={subtitle} what={what} why={why} seeing={seeing}>
      <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{blurb}</p>
      <p className="mt-3">
        <Link href={labHref} className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Back to the lab
        </Link>
      </p>
      <div className="mt-5 max-w-3xl">
        <AwsBoxes twins={twins} order={order} />
      </div>
    </LabShell>
  );
}
