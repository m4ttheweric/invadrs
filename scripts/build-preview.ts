// Build assets/preview.svg -- a compact sample sheet for the README showing
// both primitives and every palette.
//
// Regenerate the README image (SVG is gitignored scratch; the PNG is committed):
//   bun run scripts/build-preview.ts
//   rsvg-convert -z 2 -o assets/preview.png assets/preview.svg
import { invadr, spawn, palettes, hashStr, INVADR_SPRITES } from "../src/index.ts";

const CELL = 44;   // sprite px
const GAP = 10;    // gap between sprites
const PAD = 28;    // card padding
const BG = "#16161e";       // dark card background (Tokyo Night bg)
const FG = "#c0caf5";       // heading text
const MUTED = "#565f89";    // labels

/** One id per invadr sprite index, so a row shows all 16 distinct creatures. */
function oneIdPerCreature(): string[] {
  const n = INVADR_SPRITES.length;
  const out: (string | null)[] = Array(n).fill(null);
  let left = n;
  for (let i = 0; left > 0 && i < 100000; i++) {
    const id = `creature-${i}`;
    const idx = hashStr(id) % n;
    if (out[idx] === null) { out[idx] = id; left--; }
  }
  return out.map((v, i) => v ?? `c${i}`);
}
const invadrIds = oneIdPerCreature();
const spawnIds = ["nova", "atlas", "echo", "iris", "sol", "wren", "pixel", "juno", "comet", "vega", "orion", "lyra", "astra", "zephyr", "quill", "nyx"];
const paletteNames = Object.keys(palettes);
const paletteIds = ["nova", "atlas", "echo", "iris", "sol", "wren"];

/** Place a sprite svg string at (x,y), scaled to CELL. */
function place(svg: string, x: number, y: number): string {
  return `<g transform="translate(${x},${y})">${svg}</g>`;
}

const cols = invadrIds.length;
const width = PAD * 2 + cols * CELL + (cols - 1) * GAP;

const parts: string[] = [];
let y = PAD;

// Title
parts.push(`<text x="${PAD}" y="${y + 22}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="26" font-weight="700" fill="${FG}">invadrs</text>`);
parts.push(`<text x="${PAD}" y="${y + 42}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13" fill="${MUTED}">deterministic pixel avatars from any string</text>`);
y += 66;

function labeledRow(label: string, make: (id: string) => string, ids: string[]): void {
  parts.push(`<text x="${PAD}" y="${y + 11}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12" fill="${MUTED}">${label}</text>`);
  y += 20;
  ids.forEach((id, i) => {
    const x = PAD + i * (CELL + GAP);
    parts.push(place(make(id), x, y));
  });
  y += CELL + 18;
}

// Two primitives, default palette.
labeledRow("invadr()  — all 16 hand-drawn creatures", (id) => invadr(id, { size: CELL }), invadrIds);
labeledRow("spawn()   — procedural, unique per id", (id) => spawn(id, { size: CELL }), spawnIds);

// One row per palette: same ids, so the palette mood is what changes.
parts.push(`<text x="${PAD}" y="${y + 11}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12" fill="${MUTED}">palettes</text>`);
y += 22;
const PCELL = 34;
for (const name of paletteNames) {
  parts.push(`<text x="${PAD}" y="${y + PCELL / 2 + 4}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12" fill="${FG}">${name.padEnd(11)}</text>`);
  const labelW = 96;
  paletteIds.forEach((id, i) => {
    const x = PAD + labelW + i * (PCELL + GAP);
    parts.push(place(invadr(id, { size: PCELL, palette: name as never }), x, y));
  });
  y += PCELL + GAP;
}

const height = y + PAD - GAP;

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
  `<rect x="0" y="0" width="${width}" height="${height}" fill="${BG}"/>` +
  parts.join("") +
  `</svg>`;

await Bun.write(`${import.meta.dir}/../assets/preview.svg`, svg);
console.log(`wrote assets/preview.svg (${width}x${height})`);
