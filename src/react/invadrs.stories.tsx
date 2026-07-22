import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Invadr, Spawn, InvadrsProvider } from "./index.tsx";
import { palettes, hashStr, INVADR_SPRITES, type PaletteName } from "../index.ts";

const paletteOptions = [...Object.keys(palettes), "css-vars"];
const sampleIds = ["ada", "linus", "grace", "alan", "margaret", "dennis", "ken", "guido"];

/** Names of the 16 hand-drawn creatures, in INVADR_SPRITES order. */
const invadrNames = [
  "squid", "crab", "octopus", "beetle", "bunny", "cat", "ghost", "skull",
  "robot", "horned", "smiley", "owl", "alien", "mushroom", "jellyfish", "slime",
];

/** Find one id per sprite index (0..N-1), so every hand-drawn creature is shown
    once. Sprite selection is `hashStr(id) % INVADR_SPRITES.length`. */
function idsForEverySprite(): string[] {
  const n = INVADR_SPRITES.length;
  const found: (string | null)[] = Array(n).fill(null);
  let remaining = n;
  for (let i = 0; remaining > 0 && i < 100000; i++) {
    const id = `creature-${i}`;
    const idx = hashStr(id) % n;
    if (found[idx] === null) { found[idx] = id; remaining--; }
  }
  return found.map((v, i) => v ?? `creature-fallback-${i}`);
}

const meta = {
  title: "invadrs/Avatars",
  component: Invadr,
  tags: ["autodocs"],
  args: { id: "matt", size: 96, palette: "tokyoNight" },
  argTypes: {
    id: { control: "text", description: "any string — the same id always maps to the same avatar" },
    size: { control: { type: "range", min: 16, max: 160, step: 4 } },
    palette: { control: "select", options: paletteOptions },
    padding: { control: { type: "range", min: 0, max: 4, step: 1 } },
  },
} satisfies Meta<typeof Invadr>;

export default meta;
type Story = StoryObj<typeof meta>;

const label = (s: string): React.CSSProperties => ({ fontSize: 12, opacity: 0.7 });

/** Every built-in palette, both primitives side by side — the theme showcase. */
export const AllPalettes: Story = {
  args: { size: 40 },
  argTypes: { palette: { table: { disable: true } }, id: { table: { disable: true } }, size: { table: { disable: true } }, padding: { table: { disable: true } } },
  render: () => {
    // Six ids spread across the roster, so each row shows six *distinct* creatures.
    const every = idsForEverySprite();
    const ids = [0, 3, 6, 9, 12, 15].map((i) => every[i]!);
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 96 }} />
          <span style={{ ...label(""), width: 6 * (40 + 12) - 12 }}>invadr — hand-drawn</span>
          <span style={{ width: 12 }} />
          <span style={label("")}>spawn — procedural</span>
        </div>
        {(Object.keys(palettes) as PaletteName[]).map((name) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 96, fontSize: 13 }}>{name}</span>
            {ids.map((id) => (
              <Invadr key={"i" + id} id={id} size={40} palette={name} />
            ))}
            <span style={{ width: 12 }} />
            {ids.map((id) => (
              <Spawn key={"s" + id} id={id} size={40} palette={name} />
            ))}
          </div>
        ))}
      </div>
    );
  },
};

/** Every hand-drawn invadr creature, shown once, labeled. Switch palette/size in Controls. */
export const EveryInvadr: Story = {
  args: { size: 72 },
  argTypes: { id: { table: { disable: true } }, padding: { table: { disable: true } } },
  render: ({ size, palette }) => {
    const ids = idsForEverySprite();
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "26px 34px" }}>
        {ids.map((id, i) => (
          <figure key={i} style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Invadr id={id} size={size} palette={palette} />
            <figcaption style={label("")}>{i}. {invadrNames[i]}</figcaption>
          </figure>
        ))}
      </div>
    );
  },
};

/** Type anything and watch the avatars change — same string in, same creature out. */
function LiveDemo() {
  const [value, setValue] = useState("grace hopper");
  const inputStyle: React.CSSProperties = {
    font: "inherit",
    fontSize: 16,
    padding: "10px 14px",
    width: 300,
    color: "inherit",
    background: "color-mix(in srgb, var(--accent) 6%, transparent)",
    border: "1px solid var(--border, currentColor)",
    borderRadius: 10,
    outline: "none",
    textAlign: "center",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="type a name…" style={inputStyle} />
      <div style={{ display: "flex", gap: 36, alignItems: "flex-end" }}>
        <figure style={{ margin: 0, textAlign: "center" }}>
          <Spawn id={value} size={128} palette="css-vars" />
          <figcaption style={label("")}>spawn("{value || "…"}")</figcaption>
        </figure>
        <figure style={{ margin: 0, textAlign: "center" }}>
          <Invadr id={value} size={128} palette="css-vars" />
          <figcaption style={label("")}>invadr("{value || "…"}")</figcaption>
        </figure>
      </div>
    </div>
  );
}

/** Live playground: type in the box and watch Spawn (and Invadr) update instantly. */
export const TryIt: Story = {
  argTypes: { id: { table: { disable: true } }, size: { table: { disable: true } }, palette: { table: { disable: true } }, padding: { table: { disable: true } } },
  render: () => <LiveDemo />,
};

/** A hand-drawn creature (one of 16). Tweak `id`, `palette`, and `size` in Controls. */
export const InvadrAvatar: Story = {};

/** A procedural, unique-per-id creature. Same controls as Invadr. */
export const SpawnAvatar: Story = {
  render: (args) => <Spawn {...args} />,
};

/** The same id rendered by both primitives, side by side. */
export const InvadrVsSpawn: Story = {
  render: ({ id, size, palette }) => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <figure style={{ textAlign: "center", margin: 0 }}>
        <Invadr id={id} size={size} palette={palette} />
        <figcaption style={label("")}>invadr</figcaption>
      </figure>
      <figure style={{ textAlign: "center", margin: 0 }}>
        <Spawn id={id} size={size} palette={palette} />
        <figcaption style={label("")}>spawn</figcaption>
      </figure>
    </div>
  ),
};

/** A wall of unique procedural creatures — deterministic per id. */
export const SpawnGrid: Story = {
  args: { size: 44 },
  argTypes: { id: { table: { disable: true } } },
  render: ({ size, palette }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, auto)", gap: 10 }}>
      {Array.from({ length: 40 }, (_, i) => (
        <Spawn key={i} id={`user-${i}`} size={size} palette={palette} />
      ))}
    </div>
  ),
};

/** `<InvadrsProvider>` sets defaults (here palette + size) for every avatar inside. */
export const WithProvider: Story = {
  argTypes: { id: { table: { disable: true } }, size: { table: { disable: true } }, palette: { table: { disable: true } } },
  render: () => (
    <InvadrsProvider palette="neon" size={56}>
      <div style={{ display: "flex", gap: 12 }}>
        {sampleIds.map((id) => (
          <Invadr key={id} id={id} />
        ))}
      </div>
    </InvadrsProvider>
  ),
};
