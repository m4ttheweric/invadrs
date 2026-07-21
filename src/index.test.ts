import { test, expect } from "bun:test";
import { invadr, spawn, dataUri, palettes } from "./index.ts";

test("the public barrel exposes the primitives and helpers", () => {
  expect(typeof invadr("x")).toBe("string");
  expect(typeof spawn("x")).toBe("string");
  expect(dataUri("<svg></svg>")).toContain("data:image/svg+xml,");
  expect(palettes.tokyoNight.colors.length).toBe(6);
});
