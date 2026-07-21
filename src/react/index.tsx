import { createContext, useContext, type ReactNode } from "react";
import type { SpriteOptions } from "../types.ts";
import type { ResolvedSprite } from "../render.ts";
import { resolveInvadr } from "../invadr.ts";
import { resolveSpawn } from "../spawn.ts";

export type SpriteProps = SpriteOptions & {
  id: string;
  from?: "invadr" | "spawn";
  className?: string;
};

type Defaults = Partial<Omit<SpriteProps, "id">>;

const SpriteContext = createContext<Defaults>({});

/** Supply default Sprite props (palette, size, from, …) to descendants. */
export function SpriteProvider({ children, ...defaults }: { children: ReactNode } & Defaults) {
  const inherited = useContext(SpriteContext);
  return <SpriteContext.Provider value={{ ...inherited, ...defaults }}>{children}</SpriteContext.Provider>;
}

function renderCells(s: ResolvedSprite): ReactNode[] {
  const nodes: ReactNode[] = [];
  const n = s.grid.length;
  if (s.background) {
    nodes.push(
      <rect key="bg" x={-s.padding} y={-s.padding} width={n + s.padding * 2} height={n + s.padding * 2} fill={s.background} />,
    );
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (s.grid[y]![x]) nodes.push(<rect key={`${x},${y}`} x={x} y={y} width={1} height={1} />);
    }
  }
  return nodes;
}

/** Inline SVG avatar for an id. Renders the same ResolvedSprite the core string
    renderer uses, so output matches `invadr`/`spawn`. */
export function Sprite(props: SpriteProps) {
  const merged = { ...useContext(SpriteContext), ...props } as SpriteProps;
  const { id, from = "invadr", className, ...options } = merged;
  const resolved = from === "spawn" ? resolveSpawn(id, options) : resolveInvadr(id, options);

  const n = resolved.grid.length;
  const min = -resolved.padding;
  const span = n + resolved.padding * 2;
  const dims = resolved.size !== undefined ? { width: resolved.size, height: resolved.size } : {};
  const a11y = resolved.title ? { role: "img" as const } : { "aria-hidden": true as const };

  return (
    <svg
      className={className}
      viewBox={`${min} ${min} ${span} ${span}`}
      {...dims}
      shapeRendering="crispEdges"
      fill={resolved.color}
      {...a11y}
    >
      {resolved.title ? <title>{resolved.title}</title> : null}
      {renderCells(resolved)}
    </svg>
  );
}
