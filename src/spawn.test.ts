import { test, expect } from "bun:test";
import { spawnGrid, spawn } from "./spawn.ts";

test("spawnGrid is square at the requested resolution", () => {
  const g = spawnGrid(12345, 8);
  expect(g.length).toBe(8);
  for (const row of g) expect(row.length).toBe(8);
});

test("spawnGrid output is left-right symmetric", () => {
  const g = spawnGrid(0xdeadbeef, 8);
  for (const row of g) expect(row).toEqual([...row].reverse());
});

test("spawnGrid is deterministic for a seed", () => {
  expect(spawnGrid(42, 8)).toEqual(spawnGrid(42, 8));
});

test("different seeds usually produce different grids", () => {
  const a = JSON.stringify(spawnGrid(1, 8));
  const b = JSON.stringify(spawnGrid(2, 8));
  expect(a).not.toBe(b);
});

test("spawn is deterministic and returns an svg string", () => {
  const s = spawn("matt");
  expect(s.startsWith("<svg")).toBe(true);
  expect(spawn("matt")).toBe(s);
});

test("spawn snapshot locks the procedural contract", () => {
  expect(spawn("matt")).toMatchSnapshot();
});
