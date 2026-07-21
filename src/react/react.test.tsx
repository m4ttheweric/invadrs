import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Sprite, SpriteProvider } from "./index.tsx";

test("Sprite renders an inline svg with class, no size by default", () => {
  const html = renderToStaticMarkup(<Sprite id="matt" className="tui-avatar" />);
  expect(html).toContain("<svg");
  expect(html).toContain('class="tui-avatar"');
  const openingTag = html.split(">")[0];
  expect(openingTag).not.toContain("width=");
  expect(openingTag).not.toContain("height=");
  expect(html).toContain('aria-hidden');
});

test("Sprite from='spawn' with css-vars uses var() fills", () => {
  const html = renderToStaticMarkup(<Sprite id="matt" from="spawn" palette="css-vars" />);
  expect(html).toContain("var(--");
});

test("title makes it role=img with a <title>", () => {
  const html = renderToStaticMarkup(<Sprite id="matt" title="matt" />);
  expect(html).toContain('role="img"');
  expect(html).toContain("<title>matt</title>");
});

test("SpriteProvider supplies defaults that explicit props override", () => {
  const viaProvider = renderToStaticMarkup(
    <SpriteProvider palette="css-vars"><Sprite id="matt" /></SpriteProvider>,
  );
  expect(viaProvider).toContain("var(--");
  const overridden = renderToStaticMarkup(
    <SpriteProvider palette="css-vars"><Sprite id="matt" palette={["#123456"]} /></SpriteProvider>,
  );
  expect(overridden).toContain("#123456");
  expect(overridden).not.toContain("var(--");
});
