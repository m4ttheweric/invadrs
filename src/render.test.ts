import { test, expect } from "bun:test";
import { resolveCommon, renderSvg, dataUri } from "./render.ts";
import type { Grid } from "./types.ts";
import { resolveInvadr } from "./invadr.ts";
import { palettes } from "./palettes.ts";

// 2x2 grid: top-left and bottom-right filled.
const g: Grid = [
  [true, false],
  [false, true],
];

test("resolveCommon applies defaults: padding 1, palette color, no size", () => {
  const r = resolveCommon(0x000000f0, g); // color index (0xf0>>>4)%6 = 15%6 = 3
  expect(r.padding).toBe(1);
  expect(r.size).toBeUndefined();
  expect(r.color).toBe("#bb9af7"); // tokyoNight[3]
});

test("resolveCommon respects explicit options and palette background", () => {
  const r = resolveCommon(0, g, { size: 20, padding: 2, palette: { colors: ["#fff"], background: "#000" } });
  expect(r.size).toBe(20);
  expect(r.padding).toBe(2);
  expect(r.color).toBe("#fff");
  expect(r.background).toBe("#000");
});

test("renderSvg omits width/height when size is undefined", () => {
  const svg = renderSvg({ grid: g, color: "#f00", padding: 1 });
  const openingTag = svg.split(">")[0];
  expect(openingTag).not.toContain("width=");
  expect(svg).toContain('viewBox="-1 -1 4 4"'); // n=2, pad=1 -> span 4
  expect(svg).toContain('fill="#f00"');
  expect(svg).toContain("aria-hidden");
  // one rect per filled cell (2), no background rect
  expect(svg.match(/<rect/g)?.length).toBe(2);
});

test("renderSvg emits width/height, background rect and title when given", () => {
  const svg = renderSvg({ grid: g, color: "#f00", size: 20, padding: 1, background: "#012", title: "matt" });
  expect(svg).toContain('width="20" height="20"');
  expect(svg).toContain('role="img"');
  expect(svg).toContain("<title>matt</title>");
  expect(svg).toContain('fill="#012"');
  expect(svg.match(/<rect/g)?.length).toBe(3); // background + 2 cells
});

test("dataUri wraps svg", () => {
  expect(dataUri("<svg></svg>")).toBe("data:image/svg+xml," + encodeURIComponent("<svg></svg>"));
});

test("renderSvg draws accent cells in their own group", () => {
  const svg = renderSvg({ grid: g, color: "#f00", padding: 1, accent: { color: "#0f0", cells: [[1, 0]] } });
  expect(svg).toContain('<g fill="#0f0"><rect x="1" y="0" width="1" height="1"/></g>');
});

test("renderSvg draws a tint behind the cells at 0.18 opacity", () => {
  const svg = renderSvg({ grid: g, color: "#f00", padding: 1, tint: "#00f" });
  expect(svg).toContain('<rect x="-1" y="-1" width="4" height="4" fill="#00f" fill-opacity="0.18"/>');
});

test("accent never matches the body color", () => {
  for (let i = 0; i < 300; i++) {
    const r = resolveInvadr(`member-${i}`, { accent: true });
    expect(r.accent).toBeDefined();
    expect(r.accent!.color).not.toBe(r.color);
  }
});

test("accent on a one-color palette draws nothing", () => {
  expect(resolveInvadr("matt", { accent: true, palette: ["#fff"] }).accent).toBeUndefined();
});

test("accent on a grid with no holes leaves the svg unchanged", () => {
  const solid: Grid = [[true]];
  const r = resolveCommon(7, solid, { accent: true });
  expect(r.accent).toBeUndefined();
  expect(renderSvg(r)).toBe(renderSvg(resolveCommon(7, solid)));
});

test("tint picks a palette color", () => {
  const t = resolveInvadr("matt", { tint: true }).tint;
  expect(palettes.tokyoNight.colors).toContain(t!);
});

test("an explicit or palette background wins over tint", () => {
  expect(resolveInvadr("matt", { tint: true, background: "#000" }).tint).toBeUndefined();
  expect(resolveInvadr("matt", { tint: true, palette: { colors: ["#fff"], background: "#000" } }).tint).toBeUndefined();
});

test("tint follows css-vars", () => {
  expect(resolveInvadr("matt", { tint: true, palette: "css-vars" }).tint).toStartWith("var(--");
});

test("accent and tint are off by default", () => {
  const r = resolveInvadr("matt");
  expect(r.accent).toBeUndefined();
  expect(r.tint).toBeUndefined();
});

test("renderSvg escapes every paint value", () => {
  const bad = `x"/><script>`;
  const svg = renderSvg({ grid: g, color: bad, padding: 1, background: bad, tint: bad, accent: { color: bad, cells: [[1, 0]] } });
  expect(svg).not.toContain("<script>");
  expect(svg.match(/fill="x&quot;\/&gt;&lt;script&gt;"/g)!.length).toBe(4);
});
