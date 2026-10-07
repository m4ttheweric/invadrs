/** A square pixel grid, row-major; `grid[y][x]` true = filled. */
export type Grid = boolean[][];

/** A color set (and optional background) used to paint a sprite. */
export type Palette = { colors: string[]; background?: string };

/** Names of the built-in palettes. */
export type PaletteName =
  | "tokyoNight"
  | "neon"
  | "sunset"
  | "ocean"
  | "forest"
  | "mono";

/** Anything accepted for the `palette` option. `"css-vars"` emits
    `var(--...)` fills so the host theme drives the color. */
export type PaletteInput = PaletteName | "css-vars" | string[] | Palette;

/** Options shared by both primitives. `resolution` applies to `spawn` only. */
export type SpriteOptions = {
  size?: number;
  palette?: PaletteInput;
  padding?: number;
  background?: string;
  title?: string;
  resolution?: number;
  /** `invadr` only: the creature to draw (0-15, wrapping), instead of the
      one the id hashes to. `spawn` ignores it. */
  sprite?: number;
  /** Shifts every avatar to a different one. Empty means no salt. */
  salt?: string;
  /** The body color as a palette index (wrapping), instead of the one the
      id hashes to. */
  color?: number;
  /** Fill the creature's enclosed holes (eyes, mouth) with a second color. */
  accent?: boolean;
  /** A faint background in a palette color. A `background` wins over it. */
  tint?: boolean;
  /** The screen's device pixel ratio. With `size`, every cell edge lands on
      a whole device pixel, so Safari's crispEdges cannot grow the cells over
      one-cell holes at sizes that do not divide evenly. `<Invadr>` and
      `<Spawn>` measure this themselves. */
  pixelRatio?: number;
};
