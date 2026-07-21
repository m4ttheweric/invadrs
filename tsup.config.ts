import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
});
