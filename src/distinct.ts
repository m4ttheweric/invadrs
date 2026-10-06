import { seedFor } from "./hash.ts";
import { INVADR_SPRITES, spriteFor } from "./invadr.ts";
import { resolvePalette, colorIndex } from "./palettes.ts";
import type { PaletteInput } from "./types.ts";

/** A creature, a palette color index and the color it resolves to, ready to
    spread into options. `fill` is the exact paint the avatar is drawn with,
    for presence indicators and other UI that should match it. */
export type AvatarPick = { sprite: number; color: number; fill: string };

type Pair = Omit<AvatarPick, "fill">;

/** `"pair"`: no two ids share a creature and color pair. `"both"`: the first
    `min(16, palette size)` ids also never share a creature or a color, so a
    color alone identifies a person; later ids fall back to `"pair"`. */
export type Uniqueness = "pair" | "both";

/** One creature and color pair per id, distinct across the set while the
    `16 * palette size` pairs last (see `Uniqueness` for `unique: "both"`).
    Ids are taken in order, so appending an id never changes the pairs
    before it. Pass the same palette and salt you render with, or the color
    indices will not line up. */
export function distinctAvatars(
  ids: readonly string[],
  options?: { palette?: PaletteInput; salt?: string; unique?: Uniqueness },
): Map<string, AvatarPick> {
  const colors = resolvePalette(options?.palette).colors;
  const n = colors.length;
  const s = INVADR_SPRITES.length;
  const taken = new Set<number>();
  const isFree = (sprite: number, color: number) => !taken.has(sprite * n + color);
  const usedSprites = new Set<number>();
  const usedColors = new Set<number>();
  const strict = options?.unique === "both" ? Math.min(s, n) : 0;
  const firstFree = (own: number, used: Set<number>, count: number): number => {
    if (!used.has(own)) return own;
    for (let i = 0; i < count; i++) if (!used.has(i)) return i;
    return own;
  };

  const choose = (own: Pair): Pair | undefined => {
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
    const pick =
      out.size < strict
        ? { sprite: firstFree(own.sprite, usedSprites, s), color: firstFree(own.color, usedColors, n) }
        : (choose(own) ?? own);
    taken.add(pick.sprite * n + pick.color);
    usedSprites.add(pick.sprite);
    usedColors.add(pick.color);
    out.set(id, { ...pick, fill: colors[pick.color]! });
  }
  return out;
}
