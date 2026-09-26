import Link from "next/link";
import { LabShell } from "@/components/LabShell";
import type { AwsTwinMap } from "./aws";
import { AwsBoxes } from "./AwsBoxes";
import { AwsRegionPicture, type AwsRegionPictureSpec } from "./AwsRegionPicture";

type LabArchitectureProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  labHref: string;
  what: string;
  why: string;
  seeing: string;
  blurb: string;
  picture: AwsRegionPictureSpec;
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
  picture,
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
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">Region picture</h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Browser to edge, then named lab steps inside a region, then metrics and egress.
      </p>
      <div className="mt-4">
        <AwsRegionPicture spec={picture} />
      </div>
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">Stage boxes</h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">The same twin, grouped the way the live Flow column lights.</p>
      <div className="mt-4 max-w-3xl">
        <AwsBoxes twins={twins} order={order} />
      </div>
    </LabShell>
  );
}
