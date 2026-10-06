import { test, expect } from "bun:test";
import { hashStr, seedFor } from "./hash.ts";

test("hashStr is a deterministic uint32", () => {
  const h = hashStr("matt");
  expect(Number.isInteger(h)).toBe(true);
  expect(h).toBeGreaterThanOrEqual(0);
  expect(h).toBeLessThanOrEqual(0xffffffff);
  expect(hashStr("matt")).toBe(h);
});

test("hashStr matches the frozen 1.0 reference values", () => {
  // Locks the contract: these must never change.
  expect(hashStr("")).toBe(2872998923);
  expect(hashStr("a")).toBe(444641715);
});

test("different inputs generally differ", () => {
  expect(hashStr("alice")).not.toBe(hashStr("bob"));
});

test("case variants no longer share a creature", () => {
  const creatures = ["matt", "Matt", "MATT"].map((s) => hashStr(s) % 16);
  expect(new Set(creatures).size).toBe(3);
});

test("ids differing only by same-nibble characters spread across creatures", () => {
  const creatures = ["user_1", "user_a", "user_q", "user_A"].map((s) => hashStr(s) % 16);
  expect(new Set(creatures).size).toBeGreaterThan(1);
});

test("seedFor without a salt is hashStr(id)", () => {
  expect(seedFor("matt")).toBe(hashStr("matt"));
});

test("an empty salt is the same as no salt", () => {
  expect(seedFor("matt", "")).toBe(hashStr("matt"));
});

test("seedFor joins salt and id with a NUL", () => {
  expect(seedFor("matt", "x")).toBe(848194017);
  expect(seedFor("matt", "x")).toBe(hashStr("x\u0000matt"));
  expect(seedFor("c", "ab")).not.toBe(seedFor("bc", "a"));
});
