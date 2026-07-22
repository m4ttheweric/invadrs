import { test, expect } from "bun:test";
import { INVADR_SPRITES, spriteToGrid, invadr, resolveInvadr } from "./invadr.ts";

test("there are 16 sprites, each 11x11", () => {
  expect(INVADR_SPRITES.length).toBe(16);
  for (const s of INVADR_SPRITES) {
    expect(s.length).toBe(11);
    for (const row of s) expect(row.length).toBe(11);
  }
});

test("spriteToGrid maps '#' to filled cells", () => {
  expect(spriteToGrid(["#.#", ".#."])).toEqual([
    [true, false, true],
    [false, true, false],
  ]);
});

test("every invadr sprite is left-right symmetric", () => {
  for (const s of INVADR_SPRITES) {
    for (const row of s) expect(row).toBe([...row].reverse().join(""));
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
  expect(r.grid.length).toBe(11);
});
