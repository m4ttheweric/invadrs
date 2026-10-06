import { test, expect } from "bun:test";
import { holes } from "./holes.ts";
import { INVADR_SPRITES, spriteToGrid } from "./invadr.ts";

test("finds the crab's eyes", () => {
  expect(holes(spriteToGrid(INVADR_SPRITES[1]!))).toEqual([[3, 4], [7, 4]]);
});

test("finds the ghost's eyes", () => {
  expect(holes(spriteToGrid(INVADR_SPRITES[6]!))).toEqual([[3, 3], [7, 3]]);
});

test("empty cells touching the edge are not holes", () => {
  expect(holes([[false, true], [true, true]])).toEqual([]);
});

test("a ring has one hole in the middle", () => {
  expect(holes(spriteToGrid(["###", "#.#", "###"]))).toEqual([[1, 1]]);
});

test("a solid grid has no holes", () => {
  expect(holes([[true]])).toEqual([]);
});
