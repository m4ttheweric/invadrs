import { test, expect } from "bun:test";
import { hashStr } from "./hash.ts";

test("hashStr is a deterministic uint32", () => {
  const h = hashStr("matt");
  expect(Number.isInteger(h)).toBe(true);
  expect(h).toBeGreaterThanOrEqual(0);
  expect(h).toBeLessThanOrEqual(0xffffffff);
  expect(hashStr("matt")).toBe(h); // stable
});

test("hashStr matches the frozen FNV-1a reference values", () => {
  // Locks the contract: these must never change.
  expect(hashStr("")).toBe(2166136261);
  expect(hashStr("a")).toBe(3826002220);
});

test("different inputs generally differ", () => {
  expect(hashStr("alice")).not.toBe(hashStr("bob"));
});
