import type { Palette, PaletteName, PaletteInput } from "./types.ts";

/** Built-in palettes. `tokyoNight` is the default and matches mr-board. */
export const palettes: Record<PaletteName, Palette> = {
  tokyoNight: { colors: ["#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7", "#7dcfff", "#f7768e"] },
  pico8:      { colors: ["#29adff", "#00e436", "#ffa300", "#ff77a8", "#ffec27", "#ff004d"] },
  gruvbox:    { colors: ["#83a598", "#b8bb26", "#fabd2f", "#d3869b", "#8ec07c", "#fb4934"] },
  catppuccin: { colors: ["#89b4fa", "#a6e3a1", "#f9e2af", "#cba6f7", "#94e2d5", "#f38ba8"] },
  mono:       { colors: ["#e6e6e6", "#bdbdbd", "#9e9e9e", "#757575", "#bdbdbd", "#e6e6e6"] },
  candy:      { colors: ["#ff6bd6", "#5be6a8", "#ffd166", "#a06bff", "#5bd8ff", "#ff5b6b"] },
};

/** Palette that emits CSS custom properties instead of literal colors so the
    host theme drives the sprite color. Order is frozen for mr-board parity. */
export const CSS_VARS: Palette = {
  colors: ["var(--accent)", "var(--green)", "var(--amber)", "var(--purple)", "var(--cyan)", "var(--red)"],
};

/** Resolve any PaletteInput to a concrete Palette. */
export function resolvePalette(input?: PaletteInput): Palette {
  if (input === undefined) return palettes.tokyoNight;
  if (input === "css-vars") return CSS_VARS;
  if (typeof input === "string") return palettes[input];
  if (Array.isArray(input)) return { colors: input };
  return input;
}

/** Deterministically pick a color from the palette for a given seed.
    Uses `seed >>> 4` so it is independent of the sprite index (`seed % n`). */
export function pickColor(seed: number, palette: Palette): string {
  return palette.colors[(seed >>> 4) % palette.colors.length]!;
}
