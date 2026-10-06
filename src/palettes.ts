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
  // grayscale — mid greys, 6 distinct, legible on both light and dark backgrounds
  mono:       { colors: ["#a8a8a8", "#969696", "#848484", "#727272", "#606060", "#545454"] },
};

/** Palette that emits CSS custom properties instead of literal colors so the
    host theme drives the sprite color. Order is frozen for mr-board parity. */
export const CSS_VARS: Palette = {
  colors: ["var(--accent)", "var(--green)", "var(--amber)", "var(--purple)", "var(--cyan)", "var(--red)"],
};

/** Resolve any PaletteInput to a concrete Palette. */
export function resolvePalette(input?: PaletteInput): Palette {
  const p =
    input === undefined ? palettes.tokyoNight
    : input === "css-vars" ? CSS_VARS
    : typeof input === "string" ? palettes[input]
    : Array.isArray(input) ? { colors: input }
    : input;
  if (p.colors.length === 0) throw new RangeError("invadrs: a palette needs at least one color");
  return p;
}

/** Wrap an index option into [0, n). Non-finite input means "not given". */
export function wrapIndex(i: number | undefined, n: number): number | undefined {
  if (i === undefined || !Number.isFinite(i)) return undefined;
  return ((Math.trunc(i) % n) + n) % n;
}

/** The body color index for a seed. Frozen: bits 4 and up, independent of
    the creature (`seed % 16`). */
export function colorIndex(seed: number, n: number): number {
  return (seed >>> 4) % n;
}

/** The accent color index: a pick among the colors other than `body`.
    Frozen: bits 12 and up. Undefined with fewer than two colors. */
export function accentIndex(seed: number, n: number, body: number): number | undefined {
  if (n < 2) return undefined;
  const k = (seed >>> 12) % (n - 1);
  return k >= body ? k + 1 : k;
}

/** The tint color index. Frozen: bits 20 and up. */
export function tintIndex(seed: number, n: number): number {
  return (seed >>> 20) % n;
}

/** Deterministically pick a color from the palette for a given seed. */
export function pickColor(seed: number, palette: Palette): string {
  return palette.colors[colorIndex(seed, palette.colors.length)]!;
}
