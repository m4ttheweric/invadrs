import { test, expect } from "bun:test";
import { version } from "./index.ts";

test("package exports a version", () => {
  expect(version).toBe("0.1.0");
});
