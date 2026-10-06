import { seedFor } from "./hash.ts";
import { INVADR_SPRITES, spriteFor } from "./invadr.ts";
import { resolvePalette, colorIndex } from "./palettes.ts";
import type { PaletteInput } from "./types.ts";

/** A creature and a palette color index, ready to spread into options. */
export type AvatarPick = { sprite: number; color: number };

/** One creature and color pair per id, distinct across the set while the
    `16 * palette size` pairs last. Ids are taken in order, so appending an
    id never changes the pairs before it. Pass the same palette and salt you
    render with, or the color indices will not line up. */
export function distinctAvatars(
  ids: readonly string[],
  options?: { palette?: PaletteInput; salt?: string },
): Map<string, AvatarPick> {
  const n = resolvePalette(options?.palette).colors.length;
  const s = INVADR_SPRITES.length;
  const taken = new Set<number>();
  const isFree = (sprite: number, color: number) => !taken.has(sprite * n + color);

  const choose = (own: AvatarPick): AvatarPick | undefined => {
    if (isFree(own.sprite, own.color)) return own;
    for (let color = 0; color < n; color++) if (isFree(own.sprite, color)) return { sprite: own.sprite, color };
    for (let sprite = 0; sprite < s; sprite++) if (isFree(sprite, own.color)) return { sprite, color: own.color };
    for (let sprite = 0; sprite < s; sprite++)
      for (let color = 0; color < n; color++) if (isFree(sprite, color)) return { sprite, color };
    return undefined;
  };

  const out = new Map<string, AvatarPick>();
  for (const id of ids) {
    if (out.has(id)) continue;
    const seed = seedFor(id, options?.salt);
    const own = { sprite: spriteFor(seed), color: colorIndex(seed, n) };
    const pick = choose(own) ?? own;
    taken.add(pick.sprite * n + pick.color);
    out.set(id, pick);
  }
  return out;
}
