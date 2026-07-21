import { hashStr } from "./hash.ts";
import type { Grid, SpriteOptions } from "./types.ts";
import { resolveCommon, renderSvg, type ResolvedSprite } from "./render.ts";

/** Hand-designed 8x8 creatures (one byte per row, MSB = left pixel).
    Curated so every id reads as a deliberate sprite; each is left-right
    symmetric. ORDER IS FROZEN — reordering changes users' avatars. */
export const INVADR_SPRITES: number[][] = [
  [0b00011000, 0b00111100, 0b01111110, 0b11011011, 0b11111111, 0b00100100, 0b01011010, 0b10100101], // invader
  [0b00100100, 0b01111110, 0b11011011, 0b11111111, 0b11111111, 0b01100110, 0b00100100, 0b01000010], // crab
  [0b00111100, 0b01111110, 0b11011011, 0b11111111, 0b11111111, 0b11111111, 0b11111111, 0b10100101], // ghost
  [0b00111100, 0b01000010, 0b10100101, 0b10000001, 0b10100101, 0b10011001, 0b01000010, 0b00111100], // smiley
  [0b00011000, 0b00011000, 0b01111110, 0b11111111, 0b11111111, 0b01100110, 0b01100110, 0b11100111], // mech
  [0b01000010, 0b00100100, 0b01111110, 0b11011011, 0b11111111, 0b10100101, 0b00100100, 0b01000010], // alien
  [0b11100111, 0b00111100, 0b01111110, 0b11011011, 0b11111111, 0b11011011, 0b01111110, 0b01100110], // robot
  [0b10000001, 0b11000011, 0b11111111, 0b11011011, 0b11111111, 0b11111111, 0b11111111, 0b10100101], // cat
  [0b00111100, 0b01111110, 0b11111111, 0b11011011, 0b11111111, 0b01111110, 0b01011010, 0b00100100], // skull
  [0b10011001, 0b01111110, 0b11111111, 0b11011011, 0b11111111, 0b11111111, 0b01111110, 0b10100101], // beetle
  [0b11000011, 0b11111111, 0b11011011, 0b11111111, 0b01111110, 0b00111100, 0b00011000, 0b00100100], // owl
  [0b00100100, 0b01111110, 0b11111111, 0b11100111, 0b11111111, 0b01111110, 0b00011000, 0b00011000], // flower
  [0b00011000, 0b00111100, 0b01111110, 0b11111111, 0b11111111, 0b01111110, 0b00111100, 0b00011000], // gem
  [0b01100110, 0b11111111, 0b11111111, 0b11111111, 0b01111110, 0b01111110, 0b00111100, 0b00011000], // heart
  [0b00111100, 0b01111110, 0b11111111, 0b11111111, 0b01011010, 0b00011000, 0b00011000, 0b00111100], // mushroom
  [0b00100100, 0b01011010, 0b11111111, 0b10111101, 0b11111111, 0b01011010, 0b10100101, 0b01000010], // amoeba
];

/** Expand a byte-per-row bitmap into an 8x8 boolean grid (MSB = left). */
export function byteRowsToGrid(rows: number[]): Grid {
  return rows.map((row) => {
    const cells: boolean[] = [];
    for (let x = 0; x < 8; x++) cells.push((row & (0x80 >> x)) !== 0);
    return cells;
  });
}

/** Pick the creature for a seed. Selection (`seed % 16`) is frozen. */
export function invadrGrid(seed: number): Grid {
  return byteRowsToGrid(INVADR_SPRITES[seed % INVADR_SPRITES.length]!);
}

/** Resolve a hand-drawn creature for an id (structured form). */
export function resolveInvadr(id: string, options?: SpriteOptions): ResolvedSprite {
  const seed = hashStr(id);
  return resolveCommon(seed, invadrGrid(seed), options);
}

/** A hand-drawn creature for an id, as an SVG string. */
export function invadr(id: string, options?: SpriteOptions): string {
  return renderSvg(resolveInvadr(id, options));
}
