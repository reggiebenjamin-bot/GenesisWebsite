import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function channel(hex: string, index: number) {
  return Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
}

function linear(value: number) {
  const channelValue = value / 255;
  return channelValue <= 0.03928 ? channelValue / 12.92 : ((channelValue + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const red = linear(channel(hex, 0));
  const green = linear(channel(hex, 1));
  const blue = linear(channel(hex, 2));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrast(foreground: string, background: string) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const ink = "#08090e";
const paper = "#faf7f2";
const ivory = "#f4efe8";

const onDark = {
  mark: ["#fdfdfd", "#c9a157"],
  word: ["#f4efe8", "#f2d895"],
};
const onLight = {
  mark: ["#08090e", "#765426"],
  word: ["#08090e", "#765426"],
};

const bars = [
  { name: "landing nav", background: ink, variant: "on-dark" },
  { name: "footer", background: ink, variant: "on-dark" },
  { name: "signup phone bar", background: ink, variant: "on-dark" },
  { name: "onboarding phone bar", background: ink, variant: "on-dark" },
  { name: "workspace sidebar", background: ink, variant: "on-dark" },
  { name: "workspace phone bar", background: ink, variant: "on-dark" },
  { name: "desk sidebar", background: ink, variant: "on-dark" },
  { name: "desk phone bar", background: ink, variant: "on-dark" },
  { name: "desk phone menu", background: ink, variant: "on-dark" },
  { name: "portal phone bar", background: ink, variant: "on-dark" },
  { name: "status phone bar", background: ink, variant: "on-dark" },
  { name: "signup desktop bar", background: paper, variant: "on-light" },
  { name: "onboarding desktop bar", background: paper, variant: "on-light" },
  { name: "portal desktop bar", background: paper, variant: "on-light" },
  { name: "status desktop bar", background: paper, variant: "on-light" },
  { name: "ivory surface", background: ivory, variant: "on-light" },
] as const;

test("every logo bar clears the contrast floor", () => {
  for (const bar of bars) {
    const colors = bar.variant === "on-dark" ? onDark : onLight;
    for (const color of colors.mark) {
      const ratio = contrast(color, bar.background);
      assert.ok(ratio >= 3, `${bar.name} mark ${color} on ${bar.background} is ${ratio.toFixed(2)}`);
    }
    for (const color of colors.word) {
      const ratio = contrast(color, bar.background);
      assert.ok(ratio >= 4.5, `${bar.name} word ${color} on ${bar.background} is ${ratio.toFixed(2)}`);
    }
  }
});

test("logo files are the measured colorways of the same shapes", () => {
  const light = readFileSync(new URL("../public/brand/genesis-logo.svg", import.meta.url), "utf8");
  const dark = readFileSync(new URL("../public/brand/genesis-logo-ink.svg", import.meta.url), "utf8");
  const paths = (svg: string) => [...svg.matchAll(/d="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(paths(dark), paths(light));
  assert.match(light, /#fdfdfd/i);
  assert.match(light, /#c9a157/i);
  assert.match(dark, /#08090e/i);
  assert.match(dark, /#765426/i);
  assert.doesNotMatch(dark, /#fdfdfd/i);
});

test("bars pick the logo variant that matches their background", () => {
  const logo = readFileSync(new URL("../components/layout/Logo.tsx", import.meta.url), "utf8");
  assert.match(logo, /genesis-logo\.svg/);
  assert.match(logo, /genesis-logo-ink\.svg/);
  assert.match(logo, /h-8/);
  assert.doesNotMatch(logo, /genesis-icon\.svg/);

  const sources = [
    "components/platform/Chrome.tsx",
    "components/platform/WorkApp.tsx",
    "components/platform/lending/Shell.tsx",
    "components/platform/lending/PublicViews.tsx",
    "components/platform/BorrowerStatus.tsx",
    "components/layout/Footer.tsx",
  ].map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
  const joined = sources.join("\n");
  assert.match(joined, /<Logo light/);
  assert.match(joined, /<Logo \/>/);
  assert.doesNotMatch(joined, /genesis-icon\.svg/);
});
