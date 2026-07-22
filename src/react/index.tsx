import { createContext, useContext, type ReactNode } from "react";
import type { SpriteOptions } from "../types.ts";
import type { ResolvedSprite } from "../render.ts";
import { resolveInvadr } from "../invadr.ts";
import { resolveSpawn } from "../spawn.ts";

/** Props for the avatar components. `<Invadr>` and `<Spawn>` take the same
    shape; the component you pick chooses the primitive (no `from` prop). */
export type InvadrProps = SpriteOptions & { id: string; className?: string };
export type SpawnProps = InvadrProps;

type Defaults = Partial<Omit<InvadrProps, "id">>;

const InvadrsContext = createContext<Defaults>({});

/** Supply default avatar props (palette, size, padding, …) to descendants.
    Explicit props on an `<Invadr>`/`<Spawn>` override these. */
export function InvadrsProvider({ children, ...defaults }: { children: ReactNode } & Defaults) {
  const inherited = useContext(InvadrsContext);
  return <InvadrsContext.Provider value={{ ...inherited, ...defaults }}>{children}</InvadrsContext.Provider>;
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

/** Build the inline `<svg>` from a resolved sprite. Mirrors the core string
    renderer (`renderSvg`) so the JSX and string outputs match. */
function svgFrom(resolved: ResolvedSprite, className?: string): ReactNode {
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

/** A hand-drawn creature (one of 16) for an id, as inline SVG. */
export function Invadr(props: InvadrProps): ReactNode {
  const { id, className, ...options } = { ...useContext(InvadrsContext), ...props } as InvadrProps;
  return svgFrom(resolveInvadr(id, options), className);
}

/** A procedural, unique-per-id creature, as inline SVG. */
export function Spawn(props: SpawnProps): ReactNode {
  const { id, className, ...options } = { ...useContext(InvadrsContext), ...props } as SpawnProps;
  return svgFrom(resolveSpawn(id, options), className);
}
