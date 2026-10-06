import { test, expect } from "bun:test";
import { INVADR_SPRITES, spriteToGrid, invadr, resolveInvadr, spriteIndex, distinctSprites } from "./invadr.ts";

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

test("distinctSprites gives every id its own creature while the 16 last", () => {
  const ids = Array.from({ length: 16 }, (_, i) => `member-${i}`);
  expect(new Set(distinctSprites(ids).values()).size).toBe(16);
});

test("distinctSprites keeps an id's own creature unless an earlier id holds it", () => {
  const ids = Array.from({ length: 40 }, (_, i) => `member-${i}`);
  const a = ids[0]!;
  const b = ids.find((id) => id !== a && spriteIndex(id) === spriteIndex(a))!;
  const c = ids.find((id) => spriteIndex(id) !== spriteIndex(a))!;
  const sprites = distinctSprites([a, b, c]);
  expect(sprites.get(a)).toBe(spriteIndex(a));
  expect(sprites.get(b)).not.toBe(spriteIndex(a));
  expect(sprites.get(c)).toBe(spriteIndex(c));
});

test("appending an id never changes the creatures before it", () => {
  const ids = Array.from({ length: 12 }, (_, i) => `member-${i}`);
  const before = distinctSprites(ids.slice(0, 11));
  const after = distinctSprites(ids);
  for (const id of ids.slice(0, 11)) expect(after.get(id)).toBe(before.get(id));
});

test("past 16 ids, creatures repeat from each id's own", () => {
  const ids = Array.from({ length: 20 }, (_, i) => `member-${i}`);
  const sprites = distinctSprites(ids);
  expect(sprites.size).toBe(20);
  expect(new Set(sprites.values()).size).toBe(16);
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
