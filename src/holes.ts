import type { Grid } from "./types.ts";

/** Empty cells the grid edge cannot reach through other empty cells
    (4-way), as `[x, y]` in row-major order: a creature's eyes and mouth. */
export function holes(grid: Grid): [number, number][] {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  const reached = grid.map((row) => row.map(() => false));
  const stack: [number, number][] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const edge = y === 0 || x === 0 || y === h - 1 || x === w - 1;
      if (edge && !grid[y]![x]) {
        reached[y]![x] = true;
        stack.push([x, y]);
      }
    }
  }
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (reached[ny]![nx] || grid[ny]![nx]) continue;
      reached[ny]![nx] = true;
      stack.push([nx, ny]);
    }
  }
  const out: [number, number][] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) if (!grid[y]![x] && !reached[y]![x]) out.push([x, y]);
  }
  return out;
}
