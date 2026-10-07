import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { SpriteOptions } from "../types.ts";
import { cellRect, layout, type Layout, type ResolvedSprite } from "../render.ts";
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

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Pixels = { size: number; ratio: number };

/** The avatar's drawn size and the screen's pixel ratio, read after mount
    and again on resize or a zoom or display change. Host CSS usually sets
    the size, so it is measured; the server render has neither and stays
    unsnapped. */
function usePixels(ref: RefObject<SVGSVGElement | null>, size?: number, pixelRatio?: number): Pixels | undefined {
  const [pixels, setPixels] = useState<Pixels | undefined>(() =>
    size !== undefined && pixelRatio !== undefined ? { size, ratio: pixelRatio } : undefined,
  );
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let media: MediaQueryList | undefined;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const next = {
        size: size ?? Math.min(box.width, box.height),
        ratio: pixelRatio ?? window.devicePixelRatio ?? 1,
      };
      setPixels((p) => (p && p.size === next.size && p.ratio === next.ratio ? p : next));
      media?.removeEventListener("change", measure);
      media = window.matchMedia?.(`(resolution: ${next.ratio}dppx)`);
      media?.addEventListener("change", measure);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      media?.removeEventListener("change", measure);
    };
  }, [size, pixelRatio]);
  return pixels;
}

function renderCells(s: ResolvedSprite, l: Layout): ReactNode[] {
  const nodes: ReactNode[] = [];
  const n = s.grid.length;
  const min = l.line(0);
  const span = l.line(n + s.padding * 2) - min;
  const edge = { x: min, y: min, width: span, height: span };
  if (s.background) nodes.push(<rect key="bg" {...edge} fill={s.background} />);
  if (s.tint) nodes.push(<rect key="tint" {...edge} fill={s.tint} fillOpacity={0.18} />);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (s.grid[y]![x]) nodes.push(<rect key={`${x},${y}`} {...cellRect(l, s.padding, x, y)} />);
    }
  }
  if (s.accent) {
    nodes.push(
      <g key="accent" fill={s.accent.color}>
        {s.accent.cells.map(([x, y]) => <rect key={`${x},${y}`} {...cellRect(l, s.padding, x, y)} />)}
      </g>,
    );
  }
  return nodes;
}

/** The inline `<svg>` for a resolved sprite. Mirrors the core string
    renderer (`renderSvg`) so the JSX and string outputs match, and snaps
    the cells to device pixels once the drawn size is known. */
function SpriteSvg({ resolved, className }: { resolved: ResolvedSprite; className?: string }): ReactNode {
  const ref = useRef<SVGSVGElement>(null);
  const pixels = usePixels(ref, resolved.size, resolved.pixelRatio);
  const l = layout(resolved.grid.length, resolved.padding, pixels?.size, pixels?.ratio);
  const dims = resolved.size !== undefined ? { width: resolved.size, height: resolved.size } : {};
  const a11y = resolved.title ? { role: "img" as const } : { "aria-hidden": true as const };

  return (
    <svg
      ref={ref}
      className={className}
      viewBox={l.viewBox}
      {...dims}
      shapeRendering="crispEdges"
      fill={resolved.color}
      {...a11y}
    >
      {resolved.title ? <title>{resolved.title}</title> : null}
      {renderCells(resolved, l)}
    </svg>
  );
}

/** A hand-drawn creature (one of 16) for an id, as inline SVG. */
export function Invadr(props: InvadrProps): ReactNode {
  const { id, className, ...options } = { ...useContext(InvadrsContext), ...props } as InvadrProps;
  return <SpriteSvg resolved={resolveInvadr(id, options)} className={className} />;
}

/** A procedural, unique-per-id creature, as inline SVG. */
export function Spawn(props: SpawnProps): ReactNode {
  const { id, className, ...options } = { ...useContext(InvadrsContext), ...props } as SpawnProps;
  return <SpriteSvg resolved={resolveSpawn(id, options)} className={className} />;
}
