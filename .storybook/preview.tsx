import type { Preview } from "@storybook/react-vite";
import React from "react";

/** mr-board's two themes (Tokyo Day / Tokyo Night): background, grid-line, text,
    and the six CSS custom properties the `css-vars` palette references. */
const THEMES = {
  dark: {
    bg: "#16161e", fg: "#e3e7f6", muted: "#7e86ad", border: "#2f334d",
    grid: "rgba(122, 162, 247, 0.045)",
    vars: { accent: "#7aa2f7", green: "#9ece6a", amber: "#e0af68", purple: "#bb9af7", cyan: "#7dcfff", red: "#f7768e" },
  },
  light: {
    bg: "#e1e2e7", fg: "#111", muted: "#8990b3", border: "#c8cad6",
    grid: "rgba(52, 59, 88, 0.05)",
    vars: { accent: "#2e7de9", green: "#587539", amber: "#8c6c3e", purple: "#7847bd", cyan: "#007197", red: "#f52a65" },
  },
} as const;

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
  },
  globalTypes: {
    theme: {
      description: "mr-board theme",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Tokyo Night (dark)" },
          { value: "light", title: "Tokyo Day (light)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const t = THEMES[(context.globals.theme as keyof typeof THEMES)] ?? THEMES.dark;
      const grid = `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`;
      const style: Record<string, string | number> = {
        "--accent": t.vars.accent, "--green": t.vars.green, "--amber": t.vars.amber,
        "--purple": t.vars.purple, "--cyan": t.vars.cyan, "--red": t.vars.red,
        "--muted": t.muted, "--border": t.border,
        backgroundColor: t.bg,
        backgroundImage: grid,
        backgroundSize: "28px 28px",
        color: t.fg,
        fontFamily: "ui-monospace, monospace",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        boxSizing: "border-box",
      };
      return (
        <div style={style as React.CSSProperties}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
