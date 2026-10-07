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
  pixelRatio?: number;
};

/** Where the sprite's grid lines land, counted from the padded edge: line
    `i` runs from 0 to `n + 2 * padding`. Without a size and pixel ratio the
    lines are the grid coordinates themselves. With both, the sprite is drawn
    in CSS pixels and each line is rounded to a whole device pixel. */
export type Layout = { viewBox: string; line: (i: number) => number };

export function layout(n: number, padding: number, size?: number, pixelRatio?: number): Layout {
  const span = n + padding * 2;
  if (!(size! > 0) || !(pixelRatio! > 0)) {
    return { viewBox: `${-padding} ${-padding} ${span} ${span}`, line: (i) => i - padding };
  }
  const device = size! * pixelRatio!;
  return {
    viewBox: `0 0 ${size} ${size}`,
    line: (i) => Math.round((i * device) / span) / pixelRatio!,
  };
}

/** A grid cell's rect in layout coordinates. */
export function cellRect(l: Layout, padding: number, x: number, y: number) {
  const x0 = l.line(x + padding);
  const y0 = l.line(y + padding);
  return { x: x0, y: y0, width: l.line(x + padding + 1) - x0, height: l.line(y + padding + 1) - y0 };
}

/** Escape the five XML special characters for safe inclusion in text and attribute values. */
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
    pixelRatio: options?.pixelRatio,
  };
}

/** Render a ResolvedSprite to a standalone SVG string. */
export function renderSvg(s: ResolvedSprite): string {
  const n = s.grid.length;
  const l = layout(n, s.padding, s.size, s.pixelRatio);
  const min = l.line(0);
  const span = l.line(n + s.padding * 2) - min;
  const cell = (x: number, y: number) => {
    const r = cellRect(l, s.padding, x, y);
    return `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}"/>`;
  };

  const rects: string[] = [];
  if (s.background) {
    rects.push(`<rect x="${min}" y="${min}" width="${span}" height="${span}" fill="${escapeXml(s.background)}"/>`);
  }
  if (s.tint) {
    rects.push(`<rect x="${min}" y="${min}" width="${span}" height="${span}" fill="${escapeXml(s.tint)}" fill-opacity="0.18"/>`);
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (s.grid[y]![x]) rects.push(cell(x, y));
    }
  }

  if (s.accent) {
    const cells = s.accent.cells.map(([x, y]) => cell(x, y)).join("");
    rects.push(`<g fill="${escapeXml(s.accent.color)}">${cells}</g>`);
  }

  const dims = s.size !== undefined ? ` width="${s.size}" height="${s.size}"` : "";
  const a11y = s.title ? `role="img"` : `aria-hidden="true"`;
  const titleEl = s.title ? `<title>${escapeXml(s.title)}</title>` : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${l.viewBox}"${dims}` +
    ` shape-rendering="crispEdges" fill="${escapeXml(s.color)}" ${a11y}>${titleEl}${rects.join("")}</svg>`
  );
}

/** Wrap an SVG string as a data: URI usable in `src`/`background-image`. */
export function dataUri(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
