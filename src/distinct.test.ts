import { test, expect } from "bun:test";
import { distinctAvatars, type AvatarPick } from "./distinct.ts";
import { spriteIndex } from "./invadr.ts";
import { seedFor } from "./hash.ts";
import { colorIndex, palettes } from "./palettes.ts";
import { resolveInvadr } from "./invadr.ts";
import type { PaletteInput } from "./types.ts";

const members = (k: number) => Array.from({ length: k }, (_, i) => `member-${i}`);
const key = (p: AvatarPick) => `${p.sprite}:${p.color}`;
const natural = (id: string, salt?: string): AvatarPick => {
  const color = colorIndex(seedFor(id, salt), 6);
  return { sprite: spriteIndex(id, salt), color, fill: palettes.tokyoNight.colors[color]! };
};

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
  expect(distinctAvatars(["x"], { salt: "s" }).get("x")).toEqual(natural("x", "s"));
});

test("a 12-color palette gives 192 distinct pairs", () => {
  const twelve = Array.from({ length: 12 }, (_, i) => `#${i.toString(16).padStart(6, "0")}`);
  const picks = distinctAvatars(members(192), { palette: twelve });
  expect(new Set([...picks.values()].map(key)).size).toBe(192);
});

test("distinctAvatars assignment order is frozen", () => {
  expect(
    [...distinctAvatars(members(96))].map(([id, p]) => `${id}:${p.sprite}:${p.color}`),
  ).toMatchSnapshot();
});

test("a one-color palette keeps color 0 and moves to another creature", () => {
  const palette = ["#fff"];
  const pool = members(3000);
  const a = pool[0]!;
  const b = pool.find((id) => id !== a && spriteIndex(id) === spriteIndex(a))!;
  const picks = distinctAvatars([a, b], { palette });
  expect(picks.get(b)!.color).toBe(0);
  expect(picks.get(b)!.sprite).not.toBe(picks.get(a)!.sprite);

  const sixteen = distinctAvatars(members(16), { palette });
  expect(new Set([...sixteen.values()].map((p) => p.sprite)).size).toBe(16);
});

test("past capacity, ids fall back to their natural pair", () => {
  const ids = members(100);
  const picks = distinctAvatars(ids);
  expect(picks.size).toBe(100);
  expect(new Set([...picks.values()].map(key)).size).toBe(96);
  for (const id of ids.slice(96)) expect(picks.get(id)).toEqual(natural(id));
});

test("fill is the color the avatar is drawn with", () => {
  const inputs: PaletteInput[] = ["neon", "css-vars", ["#111", "#222"]];
  for (const palette of inputs) {
    const ids = members(40);
    const picks = distinctAvatars(ids, { palette, salt: "s" });
    for (const id of ids) {
      const pick = picks.get(id)!;
      expect(pick.fill).toBe(resolveInvadr(id, { palette, salt: "s", ...pick }).color);
    }
  }
});

test("fill follows css-vars", () => {
  expect(distinctAvatars(["ana"], { palette: "css-vars" }).get("ana")!.fill).toStartWith("var(--");
});

const nine = Array.from({ length: 9 }, (_, i) => `#${(i + 1).toString(16).padStart(6, "0")}`);

test("unique both: each id gets its own creature and its own color", () => {
  const picks = [...distinctAvatars(members(8), { palette: nine, unique: "both" }).values()];
  expect(new Set(picks.map((p) => p.sprite)).size).toBe(8);
  expect(new Set(picks.map((p) => p.color)).size).toBe(8);
});

test("unique both: a creature clash moves the second id to a free creature", () => {
  const pool = members(200);
  const a = pool[0]!;
  const b = pool.find((id) => id !== a && spriteIndex(id) === spriteIndex(a))!;
  const pa = distinctAvatars([a, b], { palette: nine, unique: "both" }).get(a)!;
  const pb = distinctAvatars([a, b], { palette: nine, unique: "both" }).get(b)!;
  expect(pb.sprite).not.toBe(pa.sprite);
  expect(pb.color).not.toBe(pa.color);
});

test("unique both: the first id keeps its natural pair", () => {
  expect(distinctAvatars(["member-0"], { unique: "both" }).get("member-0")).toEqual(natural("member-0"));
});

test("unique both: appending an id never changes the picks before it", () => {
  const ids = members(12);
  const before = distinctAvatars(ids.slice(0, 11), { unique: "both" });
  const after = distinctAvatars(ids, { unique: "both" });
  for (const id of ids.slice(0, 11)) expect(after.get(id)).toEqual(before.get(id)!);
});

test("unique both: past min(16, palette size), pairs stay distinct", () => {
  const picks = [...distinctAvatars(members(40), { unique: "both" }).values()];
  const first = picks.slice(0, 6);
  expect(new Set(first.map((p) => p.color)).size).toBe(6);
  expect(new Set(first.map((p) => p.sprite)).size).toBe(6);
  expect(new Set(picks.map(key)).size).toBe(40);
});

test("unique both: fill matches the rendered color", () => {
  const picks = distinctAvatars(members(8), { palette: nine, unique: "both" });
  for (const [id, pick] of picks) expect(pick.fill).toBe(resolveInvadr(id, { palette: nine, ...pick }).color);
});
