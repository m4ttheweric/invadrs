import { test, expect } from "bun:test";
import { resolveCommon, renderSvg, dataUri } from "./render.ts";
import type { Grid } from "./types.ts";

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
