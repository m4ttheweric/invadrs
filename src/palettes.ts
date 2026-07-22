import type { Palette, PaletteName, PaletteInput } from "./types.ts";

/** Built-in palettes. `tokyoNight` is the default and matches mr-board.
    Each palette is its own colour mood (not the same rainbow re-shaded), so a
    given id looks distinct from one palette to the next. */
export const palettes: Record<PaletteName, Palette> = {
  // balanced rainbow (default) — the Tokyo Night editor colours
  tokyoNight: { colors: ["#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7", "#7dcfff", "#f7768e"] },
  // electric high-saturation — reads best on dark backgrounds
  neon:       { colors: ["#ff2e97", "#00eaff", "#39ff14", "#b026ff", "#faff00", "#ff5900"] },
  // warm only — crimson, vermilion, orange, gold, rose, deep red
  sunset:     { colors: ["#e5383b", "#ff6b35", "#f77f00", "#ffca3a", "#ff5c8a", "#c1121f"] },
  // cool only — navy, teal, sky, seafoam, blue, aqua
  ocean:      { colors: ["#1d3557", "#2a9d8f", "#48cae4", "#56e39f", "#4361ee", "#7bdff2"] },
  // greens and earth — pine, leaf, lime-olive, fern, bark, tan
  forest:     { colors: ["#386641", "#6a994e", "#a7c957", "#588157", "#b08968", "#dda15e"] },
  // grayscale
  mono:       { colors: ["#e6e6e6", "#bdbdbd", "#9e9e9e", "#757575", "#bdbdbd", "#e6e6e6"] },
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
