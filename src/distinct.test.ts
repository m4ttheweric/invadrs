import { test, expect } from "bun:test";
import { distinctAvatars, type AvatarPick } from "./distinct.ts";
import { spriteIndex } from "./invadr.ts";
import { seedFor } from "./hash.ts";
import { colorIndex } from "./palettes.ts";

const members = (k: number) => Array.from({ length: k }, (_, i) => `member-${i}`);
const key = (p: AvatarPick) => `${p.sprite}:${p.color}`;
const natural = (id: string, n = 6, salt?: string): AvatarPick => ({
  sprite: spriteIndex(id, salt),
  color: colorIndex(seedFor(id, salt), n),
});

test("96 ids get 96 distinct pairs on the default palette", () => {
  const picks = distinctAvatars(members(96));
  expect(picks.size).toBe(96);
  expect(new Set([...picks.values()].map(key)).size).toBe(96);
});

test("the first id keeps its natural pair", () => {
  const [a] = members(1);
  expect(distinctAvatars([a!]).get(a!)).toEqual(natural(a!));
});

test("a clash keeps the creature and changes the color", () => {
  const pool = members(3000);
  const a = pool[0]!;
  const b = pool.find((id) => id !== a && key(natural(id)) === key(natural(a)))!;
  const pick = distinctAvatars([a, b]).get(b)!;
  expect(pick.sprite).toBe(natural(b).sprite);
  expect(pick.color).not.toBe(natural(b).color);
});

test("appending an id never changes the pairs before it", () => {
  const ids = members(51);
  const before = distinctAvatars(ids.slice(0, 50));
  const after = distinctAvatars(ids);
  for (const id of ids.slice(0, 50)) expect(after.get(id)).toEqual(before.get(id)!);
});

test("a repeated id keeps its first assignment", () => {
  const picks = distinctAvatars(["a", "b", "a"]);
  expect(picks.size).toBe(2);
  expect(picks.get("a")).toEqual(distinctAvatars(["a"]).get("a")!);
});

test("the salt changes natural pairs", () => {
  expect(distinctAvatars(["x"], { salt: "s" }).get("x")).toEqual(natural("x", 6, "s"));
});

test("a 12-color palette gives 192 distinct pairs", () => {
  const twelve = Array.from({ length: 12 }, (_, i) => `#${i.toString(16).padStart(6, "0")}`);
  const picks = distinctAvatars(members(192), { palette: twelve });
  expect(new Set([...picks.values()].map(key)).size).toBe(192);
});

test("past capacity, ids fall back to their natural pair", () => {
  const ids = members(100);
  const picks = distinctAvatars(ids);
  expect(picks.size).toBe(100);
  expect(new Set([...picks.values()].map(key)).size).toBe(96);
  for (const id of ids.slice(96)) expect(picks.get(id)).toEqual(natural(id));
});
