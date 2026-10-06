import { hashStr } from "./hash.ts";
import type { Grid, SpriteOptions } from "./types.ts";
import { resolveCommon, renderSvg, type ResolvedSprite } from "./render.ts";

/** Hand-designed 11x11 creatures — `'#'` is a filled pixel, any other char is
    empty — in the retro pixel-alien style: antennae/ears up top, eyes as
    negative space, splayed legs below. Each is left-right symmetric. The set
    and its order define the avatar mapping, so changing them changes existing
    avatars: a versioned, semver-major change. */
export const INVADR_SPRITES: string[][] = [
  [ // squid
    "...#...#...", "....#.#....", "...#####...", "..#######..", ".##.###.##.",
    "###########", "###########", ".#.#####.#.", "..#.....#..", ".#..#.#..#.", "#...#.#...#",
  ],
  [ // crab
    "#....#....#", ".#...#...#.", "..#######..", ".#########.", "###.###.###",
    "###########", "###########", "#.#######.#", "#.#.....#.#", "...#...#...", "..##...##..",
  ],
  [ // octopus
    "..#######..", ".#########.", "###########", "##.#####.##", "##.#####.##",
    "###########", ".#.#.#.#.#.", ".#.#.#.#.#.", ".#.#.#.#.#.", "#..#.#.#..#", "#..#.#.#..#",
  ],
  [ // beetle
    "#..#...#..#", ".#.#...#.#.", "..#######..", ".####.####.", "###########",
    "###.###.###", "###########", "###########", ".#########.", "..#.....#..", ".#.......#.",
  ],
  [ // bunny
    "..#.....#..", "..#.....#..", "..#.#.#.#..", "..#######..", ".#########.",
    ".##.###.##.", ".#########.", ".#########.", "..#######..", "..#.....#..", ".##.....##.",
  ],
  [ // cat
    ".#.......#.", ".##.....##.", ".#########.", "###.###.###", "#####.#####",
    "###########", "###########", "#.#######.#", "..#######..", "...#...#...", "..#.....#..",
  ],
  [ // ghost
    "...#####...", "..#######..", ".#########.", ".##.###.##.", "###########",
    "###########", "###########", "###########", "###########", "#.##.#.##.#", "#..#.#.#..#",
  ],
  [ // skull
    "...#####...", "..#######..", ".#########.", "###########", "##..###..##",
    "##..###..##", "###########", ".#########.", ".#.#.#.#.#.", ".#########.", "..#.....#..",
  ],
  [ // robot
    "....#.#....", "...#####...", "..#######..", ".##.###.##.", ".#########.",
    ".#.#.#.#.#.", ".#########.", "..#######..", "..#.....#..", "..#.....#..", ".##.....##.",
  ],
  [ // horned
    "#.........#", "##.......##", ".##.....##.", "..#######..", ".##.###.##.",
    ".#########.", "..#######..", "..#######..", "...#...#...", "..#.....#..", ".##.....##.",
  ],
  [ // smiley
    "..#######..", ".#########.", "###########", "##.#####.##", "###########",
    "###########", "#.#.###.#.#", "##.#####.##", ".#########.", "..#######..", "..##...##..",
  ],
  [ // owl
    "##.......##", ".#########.", ".#########.", "#...###...#", "#.#.###.#.#",
    "#...###...#", ".#########.", ".#########.", "..#######..", "...#...#...", "..#.....#..",
  ],
  [ // alien
    ".#.......#.", "..#.....#..", "...#####...", "..#######..", ".##.###.##.",
    "..#######..", ".#.#####.#.", "#.#######.#", "#.#.....#.#", ".#.......#.", "#..#...#..#",
  ],
  [ // mushroom
    "...#####...", "..#######..", ".#########.", "###########", "###########",
    ".##.###.##.", "...#####...", "...#...#...", "...#...#...", "...#####...", "..#######..",
  ],
  [ // jellyfish
    "...#####...", "..#######..", ".#########.", ".##.###.##.", "###########",
    ".#########.", "..#.#.#.#..", ".#.#.#.#.#.", ".#..#.#..#.", "#...#.#...#", "#....#....#",
  ],
  [ // slime
    "...#####...", "..#######..", ".#########.", "####...####", "####.#.####",
    "####...####", ".#########.", ".#########.", "..#######..", ".#.#.#.#.#.", "#...#.#...#",
  ],
];

/** Parse a sprite's row strings into a boolean grid (`'#'` = filled). */
export function spriteToGrid(rows: string[]): Grid {
  return rows.map((row) => [...row].map((c) => c === "#"));
}

/** Pick the creature for a seed. Selection (`seed % 16`) is part of the mapping. */
export function invadrGrid(seed: number): Grid {
  return spriteToGrid(INVADR_SPRITES[seed % INVADR_SPRITES.length]!);
}

/** The creature index an id gets when no `sprite` option overrides it. */
export function spriteIndex(id: string): number {
  return hashStr(id) % INVADR_SPRITES.length;
}

/** One creature per id, distinct across the set while the 16 last. Ids are
    taken in order: each keeps its own creature unless an earlier id holds
    it, and otherwise takes the first free one, so appending an id never
    changes the creatures of the ids before it. Past 16 ids, creatures
    repeat from each id's own. */
export function distinctSprites(ids: readonly string[]): Map<string, number> {
  const taken = new Set<number>();
  const out = new Map<string, number>();
  for (const id of ids) {
    if (out.has(id)) continue;
    const own = spriteIndex(id);
    let pick = own;
    if (taken.has(own)) {
      const free = INVADR_SPRITES.findIndex((_, i) => !taken.has(i));
      if (free !== -1) pick = free;
    }
    taken.add(pick);
    out.set(id, pick);
  }
  return out;
}

/** Resolve a hand-drawn creature for an id (structured form). */
export function resolveInvadr(id: string, options?: SpriteOptions): ResolvedSprite {
  const seed = hashStr(id);
  const n = INVADR_SPRITES.length;
  const grid =
    options?.sprite === undefined
      ? invadrGrid(seed)
      : spriteToGrid(INVADR_SPRITES[((Math.trunc(options.sprite) % n) + n) % n]!);
  return resolveCommon(seed, grid, options);
}

/** A hand-drawn creature for an id, as an SVG string. */
export function invadr(id: string, options?: SpriteOptions): string {
  return renderSvg(resolveInvadr(id, options));
}
