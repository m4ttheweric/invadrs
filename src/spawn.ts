import { hashStr } from "./hash.ts";
import type { Grid, SpriteOptions } from "./types.ts";
import { resolveCommon, renderSvg, type ResolvedSprite } from "./render.ts";

/** Fill probability per cell. Frozen — part of the procedural contract. */
const DENSITY = 0.5;

/** Small, fast, deterministic PRNG. Frozen: changing it changes spawn output. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a left-right symmetric square grid from a seed. `resolution` must
    be even so the mirrored halves meet cleanly. */
export function spawnGrid(seed: number, resolution: number): Grid {
  const n = resolution;
  const half = n / 2;
  const rng = mulberry32(seed);
  const grid: Grid = [];
  for (let y = 0; y < n; y++) {
    const row: boolean[] = new Array(n).fill(false);
    for (let x = 0; x < half; x++) {
      const on = rng() < DENSITY;
      row[x] = on;
      row[n - 1 - x] = on;
    }
    grid.push(row);
  }
  return grid;
}

/** Resolve a procedural creature for an id (structured form). */
export function resolveSpawn(id: string, options?: SpriteOptions): ResolvedSprite {
  const seed = hashStr(id);
  const resolution = options?.resolution ?? 8;
  return resolveCommon(seed, spawnGrid(seed, resolution), options);
}

/** A procedural symmetric creature for an id, as an SVG string. */
export function spawn(id: string, options?: SpriteOptions): string {
  return renderSvg(resolveSpawn(id, options));
}
