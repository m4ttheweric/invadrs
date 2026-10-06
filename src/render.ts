import type { Grid, SpriteOptions } from "./types.ts";
import { resolvePalette, wrapIndex, colorIndex, accentIndex, tintIndex } from "./palettes.ts";
import { holes } from "./holes.ts";

/** A fully-resolved sprite: geometry + paint + presentation, ready to render. */
export type ResolvedSprite = {
  grid: Grid;
  color: string;
  size?: number;
  padding: number;
  background?: string;
  title?: string;
  accent?: { color: string; cells: [number, number][] };
  tint?: string;
};

/** Escape the five XML special characters for safe inclusion in <title>. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Merge a seed + grid + options into a ResolvedSprite, applying palette,
    color selection, and defaults (padding 1). Shared by both primitives. */
export function resolveCommon(seed: number, grid: Grid, options?: SpriteOptions): ResolvedSprite {
  const palette = resolvePalette(options?.palette);
  const n = palette.colors.length;
  const body = wrapIndex(options?.color, n) ?? colorIndex(seed, n);
  const background = options?.background ?? palette.background;
  const accentAt = options?.accent ? accentIndex(seed, n, body) : undefined;
  const cells = accentAt === undefined ? [] : holes(grid);
  return {
    grid,
    color: palette.colors[body]!,
    size: options?.size,
    padding: options?.padding ?? 1,
    background,
    title: options?.title,
    tint: options?.tint && background === undefined ? palette.colors[tintIndex(seed, n)] : undefined,
    accent: cells.length > 0 ? { color: palette.colors[accentAt!]!, cells } : undefined,
  };
}

/** Render a ResolvedSprite to a standalone SVG string. */
export function renderSvg(s: ResolvedSprite): string {
  const n = s.grid.length;
  const min = -s.padding;
  const span = n + s.padding * 2;

  const rects: string[] = [];
  if (s.background) {
    rects.push(`<rect x="${min}" y="${min}" width="${span}" height="${span}" fill="${s.background}"/>`);
  }
  if (s.tint) {
    rects.push(`<rect x="${min}" y="${min}" width="${span}" height="${span}" fill="${s.tint}" fill-opacity="0.18"/>`);
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (s.grid[y]![x]) rects.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  }

  if (s.accent) {
    const cells = s.accent.cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join("");
    rects.push(`<g fill="${s.accent.color}">${cells}</g>`);
  }

  const dims = s.size !== undefined ? ` width="${s.size}" height="${s.size}"` : "";
  const a11y = s.title ? `role="img"` : `aria-hidden="true"`;
  const titleEl = s.title ? `<title>${escapeXml(s.title)}</title>` : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min} ${min} ${span} ${span}"${dims}` +
    ` shape-rendering="crispEdges" fill="${s.color}" ${a11y}>${titleEl}${rects.join("")}</svg>`
  );
}

/** Wrap an SVG string as a data: URI usable in `src`/`background-image`. */
export function dataUri(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
