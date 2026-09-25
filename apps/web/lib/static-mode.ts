export const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC === "1";

export function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

export function fixtureUrl(path: string): string {
  return publicUrl(`/fixtures/${path}`);
}

export function normalizeQuestion(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

const DELAYS: Record<string, number> = {
  bind: 450,
  embed: 700,
  route: 550,
  retrieve: 850,
  template: 700,
  ground: 600,
  invoke: 1600,
  draft: 1600,
  generate: 1600,
  critique: 1500,
  parse: 700,
  cite: 650,
  answer: 1100,
  hash: 500,
  index: 400,
  query: 700,
  rank: 650,
  intake: 550,
  retrieve_policy: 850,
  check_script: 700,
  safety: 700,
  decide: 550,
  await_human: 500,
  review: 1400,
  act: 1100,
};

export function delayFor(step: string): number {
  return DELAYS[step] ?? 600;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
