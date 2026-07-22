import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Invadr, Spawn, InvadrsProvider } from "./index.tsx";

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
