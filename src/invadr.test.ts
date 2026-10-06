import { test, expect } from "bun:test";
import { INVADR_SPRITES, spriteToGrid, invadr, resolveInvadr, spriteIndex } from "./invadr.ts";
import { palettes } from "./palettes.ts";

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

test("the sprite option picks the creature, wrapping out-of-range values", () => {
  for (let i = 0; i < 16; i++) {
    expect(resolveInvadr("matt", { sprite: i }).grid).toEqual(spriteToGrid(INVADR_SPRITES[i]!));
  }
  expect(resolveInvadr("matt", { sprite: 17 }).grid).toEqual(spriteToGrid(INVADR_SPRITES[1]!));
  expect(resolveInvadr("matt", { sprite: -1 }).grid).toEqual(spriteToGrid(INVADR_SPRITES[15]!));
});

test("the sprite option leaves the colour to the id", () => {
  expect(resolveInvadr("matt", { sprite: 3 }).color).toBe(resolveInvadr("matt").color);
});

test("without the option an id draws its own creature", () => {
  expect(resolveInvadr("matt").grid).toEqual(spriteToGrid(INVADR_SPRITES[spriteIndex("matt")]!));
});

test("a salt moves ids to different avatars", () => {
  const ids = Array.from({ length: 20 }, (_, i) => `member-${i}`);
  expect(ids.some((id) => invadr(id, { salt: "s" }) !== invadr(id))).toBe(true);
});

test("spriteIndex follows the salt", () => {
  for (const id of ["ana", "ben", "cy"]) {
    expect(resolveInvadr(id, { salt: "s" }).grid).toEqual(
      spriteToGrid(INVADR_SPRITES[spriteIndex(id, "s")]!),
    );
  }
});

test("the color option picks a palette index, wrapping", () => {
  const c = palettes.tokyoNight.colors;
  expect(resolveInvadr("matt", { color: 2 }).color).toBe(c[2]!);
  expect(resolveInvadr("matt", { color: 8 }).color).toBe(c[2]!);
  expect(resolveInvadr("matt", { color: -1 }).color).toBe(c[5]!);
  expect(resolveInvadr("matt", { color: 0 }).color).toBe(c[0]!);
});

test("non-finite color and sprite options fall back to the hashed pick", () => {
  const plain = resolveInvadr("matt");
  expect(resolveInvadr("matt", { color: NaN }).color).toBe(plain.color);
  expect(resolveInvadr("matt", { sprite: NaN }).grid).toEqual(plain.grid);
});

test("the color option leaves the creature to the id", () => {
  expect(resolveInvadr("matt", { color: 3 }).grid).toEqual(resolveInvadr("matt").grid);
});
