import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Invadr, Spawn, InvadrsProvider } from "./index.tsx";
import { resolveInvadr } from "../invadr.ts";
import { palettes } from "../palettes.ts";

test("Invadr renders an inline svg with class, no size by default", () => {
  const html = renderToStaticMarkup(<Invadr id="matt" className="tui-avatar" />);
  expect(html).toContain("<svg");
  expect(html).toContain('class="tui-avatar"');
  const openingTag = html.split(">")[0];
  expect(openingTag).not.toContain("width=");
  expect(openingTag).not.toContain("height=");
  expect(html).toContain('aria-hidden');
});

test("Spawn with css-vars uses var() fills", () => {
  const html = renderToStaticMarkup(<Spawn id="matt" palette="css-vars" />);
  expect(html).toContain("var(--");
});

test("Invadr and Spawn render different sprites for the same id", () => {
  const inv = renderToStaticMarkup(<Invadr id="matt" />);
  const spn = renderToStaticMarkup(<Spawn id="matt" />);
  expect(inv).not.toBe(spn);
});

test("title makes it role=img with a <title>", () => {
  const html = renderToStaticMarkup(<Invadr id="matt" title="matt" />);
  expect(html).toContain('role="img"');
  expect(html).toContain("<title>matt</title>");
});

test("InvadrsProvider supplies defaults that explicit props override", () => {
  const viaProvider = renderToStaticMarkup(
    <InvadrsProvider palette="css-vars"><Invadr id="matt" /></InvadrsProvider>,
  );
  expect(viaProvider).toContain("var(--");
  const overridden = renderToStaticMarkup(
    <InvadrsProvider palette="css-vars"><Invadr id="matt" palette={["#123456"]} /></InvadrsProvider>,
  );
  expect(overridden).toContain("#123456");
  expect(overridden).not.toContain("var(--");
});

test("Invadr renders accent and tint like the string renderer", () => {
  const r = resolveInvadr("matt", { accent: true, tint: true, salt: "s", color: 2 });
  const html = renderToStaticMarkup(<Invadr id="matt" accent tint salt="s" color={2} />);
  expect(html).toContain(`fill="${r.color}"`);
  expect(html).toContain(`fill="${r.tint}" fill-opacity="0.18"`);
  expect(html).toContain(`<g fill="${r.accent!.color}">`);
  const filled = r.grid.flat().filter(Boolean).length;
  expect(html.match(/<rect/g)!.length).toBe(1 + filled + r.accent!.cells.length);
});

test("color={0} overrides a provider color", () => {
  const html = renderToStaticMarkup(
    <InvadrsProvider color={3}><Invadr id="matt" color={0} /></InvadrsProvider>,
  );
  expect(html).toContain(`fill="${palettes.tokyoNight.colors[0]}"`);
});
