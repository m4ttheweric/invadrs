import { test, expect } from "bun:test";
import { INVADR_SPRITES, byteRowsToGrid, invadr, resolveInvadr } from "./invadr.ts";

test("there are 16 sprites, each 8 rows", () => {
  expect(INVADR_SPRITES.length).toBe(16);
  for (const s of INVADR_SPRITES) expect(s.length).toBe(8);
});

test("byteRowsToGrid reads MSB as the left pixel", () => {
  const grid = byteRowsToGrid([0b10000001, 0, 0, 0, 0, 0, 0, 0]);
  expect(grid[0]).toEqual([true, false, false, false, false, false, false, true]);
});

test("every invadr sprite is left-right symmetric", () => {
  for (const s of INVADR_SPRITES) {
    const grid = byteRowsToGrid(s);
    for (const row of grid) expect(row).toEqual([...row].reverse());
  }
});

test("invadr is deterministic and returns an svg string", () => {
  const a = invadr("matt");
  expect(a.startsWith("<svg")).toBe(true);
  expect(invadr("matt")).toBe(a);
});

test("invadr snapshot locks the determinism contract", () => {
  // If this snapshot changes, an avatar changed -> must be a major version.
  expect(invadr("matt")).toMatchSnapshot();
  expect(invadr("alice", { palette: "css-vars" })).toMatchSnapshot();
});

test("resolveInvadr uses seed % 16 for the sprite", () => {
  const r = resolveInvadr("matt");
  expect(r.grid.length).toBe(8);
});
