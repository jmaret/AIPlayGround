/** Same teaching hash as `apps/api/app/providers/hashed.py`. No network. */

export const DIM = 64;

const TOKEN = /[a-z0-9]+/g;
const STOP = new Set([
  "a",
  "an",
  "and",
  "does",
  "for",
  "how",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "what",
  "when",
  "why",
]);

const MASK = 0xffffffffffffffffn;
const IV = [
  0x6a09e667f3bcc908n,
  0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn,
  0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n,
  0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn,
  0x5be0cd19137e2179n,
];

const SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 10, 5, 4],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
];

function add(a: bigint, b: bigint): bigint {
  return (a + b) & MASK;
}

function rotr(x: bigint, n: bigint): bigint {
  return ((x >> n) | (x << (64n - n))) & MASK;
}

function mix(v: bigint[], a: number, b: number, c: number, d: number, x: bigint, y: bigint) {
  v[a] = add(add(v[a], v[b]), x);
  v[d] = rotr(v[d] ^ v[a], 32n);
  v[c] = add(v[c], v[d]);
  v[b] = rotr(v[b] ^ v[c], 24n);
  v[a] = add(add(v[a], v[b]), y);
  v[d] = rotr(v[d] ^ v[a], 16n);
  v[c] = add(v[c], v[d]);
  v[b] = rotr(v[b] ^ v[c], 63n);
}

function load64(bytes: Uint8Array, offset: number): bigint {
  let value = 0n;
  for (let i = 0; i < 8; i += 1) {
    value |= BigInt(bytes[offset + i] ?? 0) << BigInt(8 * i);
  }
  return value;
}

/** BLAKE2b with an 8-byte digest — matches Python `hashlib.blake2b(..., digest_size=8)`. */
export function blake2b8(data: Uint8Array): Uint8Array {
  const h = IV.slice();
  h[0] ^= 0x01010008n;
  const block = new Uint8Array(128);
  let offset = 0;
  let t = 0n;
  while (offset + 128 <= data.length) {
    block.set(data.subarray(offset, offset + 128));
    t += 128n;
    compress(h, block, t, false);
    offset += 128;
  }
  block.fill(0);
  block.set(data.subarray(offset));
  t += BigInt(data.length - offset);
  compress(h, block, t, true);
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i += 1) {
    out[i] = Number((h[0] >> BigInt(8 * i)) & 0xffn);
  }
  return out;
}

function compress(h: bigint[], block: Uint8Array, t: bigint, last: boolean) {
  const v = h.concat(IV);
  v[12] ^= t;
  v[13] ^= t >> 64n;
  if (last) v[14] ^= MASK;
  const m = Array.from({ length: 16 }, (_, i) => load64(block, i * 8));
  for (let round = 0; round < 12; round += 1) {
    const s = SIGMA[round % 10];
    mix(v, 0, 4, 8, 12, m[s[0]], m[s[1]]);
    mix(v, 1, 5, 9, 13, m[s[2]], m[s[3]]);
    mix(v, 2, 6, 10, 14, m[s[4]], m[s[5]]);
    mix(v, 3, 7, 11, 15, m[s[6]], m[s[7]]);
    mix(v, 0, 5, 10, 15, m[s[8]], m[s[9]]);
    mix(v, 1, 6, 11, 12, m[s[10]], m[s[11]]);
    mix(v, 2, 7, 8, 13, m[s[12]], m[s[13]]);
    mix(v, 3, 4, 9, 14, m[s[14]], m[s[15]]);
  }
  for (let i = 0; i < 8; i += 1) {
    h[i] ^= v[i] ^ v[i + 8];
  }
}

export function hashedNgramEmbed(text: string, dim = DIM): number[] {
  const vec = Array.from({ length: dim }, () => 0);
  const tokens = (text.toLowerCase().match(TOKEN) ?? []).filter((token) => !STOP.has(token));
  if (tokens.length === 0) return vec;
  const encoder = new TextEncoder();
  for (const token of tokens) {
    const digest = blake2b8(encoder.encode(token));
    const slot = (digest[0]! | (digest[1]! << 8) | (digest[2]! << 16) | (digest[3]! << 24)) >>> 0;
    const index = slot % dim;
    vec[index] += digest[4]! & 1 ? 1 : -1;
  }
  const norm = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vec.map((value) => value / norm);
}

export function cosineDistance(left: number[], right: number[]): number {
  return 1 - left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
}
