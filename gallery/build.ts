import { invadr, spawn, palettes } from "../src/index.ts";

const ids = ["matt", "alice", "bob", "carol", "dave", "erin", "frank", "grace",
  "heidi", "ivan", "judy", "mallory", "niaj", "olivia", "peggy", "sybil",
  "trent", "victor", "walter", "wendy"];

const paletteNames = [...Object.keys(palettes), "css-vars"] as const;

function grid(kind: "invadr" | "spawn", palette: string): string {
  const make = kind === "invadr" ? invadr : spawn;
  const cells = ids.map((id) => `<div class="cell">${make(id, { size: 40, palette: palette as never })}<span>${id}</span></div>`).join("");
  return `<h3>${kind} — ${palette}</h3><div class="grid">${cells}</div>`;
}

const sections = paletteNames.flatMap((p) => [grid("invadr", p), grid("spawn", p)]).join("\n");

const html = `<!doctype html><meta charset="utf-8"><title>spritr gallery</title>
<style>
  :root { color-scheme: light dark; --accent:#7aa2f7; --green:#9ece6a; --amber:#e0af68; --purple:#bb9af7; --cyan:#7dcfff; --red:#f7768e; }
  body { font-family: ui-monospace, monospace; margin: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, 64px); gap: 12px; margin-bottom: 2rem; }
  .cell { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; }
  svg { width: 40px; height: 40px; }
</style>
${sections}`;

await Bun.write(`${import.meta.dir}/index.html`, html);
console.log("wrote gallery/index.html");
