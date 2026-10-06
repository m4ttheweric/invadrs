import { test, expect } from "bun:test";
import { palettes, CSS_VARS, resolvePalette, pickColor, wrapIndex, colorIndex } from "./palettes.ts";

test("tokyoNight is the mr-board color set in frozen order", () => {
  expect(palettes.tokyoNight.colors).toEqual([
    "#7aa2f7", "#9ece6a", "#e0af68", "#bb9af7", "#7dcfff", "#f7768e",
  ]);
});

test("css-vars palette order is frozen for mr-board parity", () => {
  expect(CSS_VARS.colors).toEqual([
    "var(--accent)", "var(--green)", "var(--amber)",
    "var(--purple)", "var(--cyan)", "var(--red)",
  ]);
});

test("resolvePalette handles every input form", () => {
  expect(resolvePalette()).toBe(palettes.tokyoNight);
  expect(resolvePalette("neon")).toBe(palettes.neon);
  expect(resolvePalette("css-vars")).toBe(CSS_VARS);
  expect(resolvePalette(["#111", "#222"]).colors).toEqual(["#111", "#222"]);
  const p = { colors: ["#abc"], background: "#000" };
  expect(resolvePalette(p)).toBe(p);
});

test("pickColor is deterministic and in-bounds", () => {
  const pal = { colors: ["#a", "#b", "#c"] };
  const c = pickColor(0x000000f0, pal); // (0xf0 >>> 4) % 3 = 15 % 3 = 0
  expect(c).toBe("#a");
  expect(pal.colors).toContain(pickColor(123456, pal));
});

test("wrapIndex wraps into range and treats non-finite input as not given", () => {
  expect(wrapIndex(2, 6)).toBe(2);
  expect(wrapIndex(8, 6)).toBe(2);
  expect(wrapIndex(-1, 6)).toBe(5);
  expect(wrapIndex(2.9, 6)).toBe(2);
  expect(wrapIndex(0, 6)).toBe(0);
  expect(wrapIndex(undefined, 6)).toBeUndefined();
  expect(wrapIndex(NaN, 6)).toBeUndefined();
  expect(wrapIndex(Infinity, 6)).toBeUndefined();
});

test("colorIndex reads bits 4 and up", () => {
  expect(colorIndex(0x000000f0, 6)).toBe(3);
});

test("an empty palette is rejected", () => {
  expect(() => resolvePalette([])).toThrow(RangeError);
  expect(() => resolvePalette({ colors: [] })).toThrow(RangeError);
});
