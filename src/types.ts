/** A square pixel grid, row-major; `grid[y][x]` true = filled. */
export type Grid = boolean[][];

/** A color set (and optional background) used to paint a sprite. */
export type Palette = { colors: string[]; background?: string };

/** Names of the built-in palettes. */
export type PaletteName =
  | "tokyoNight"
  | "pico8"
  | "gruvbox"
  | "catppuccin"
  | "mono"
  | "candy";

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
};
