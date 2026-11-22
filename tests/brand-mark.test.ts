import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/* The Genesis G is always the gold gradient G. These checks keep the retired
   white and gold mark from coming back and keep the gold files on the
   original vector paths. */

const root = join(import.meta.dirname, "..");
const brand = join(root, "public/brand");
const pathData = (file: string) => {
  const match = readFileSync(join(brand, file), "utf8").match(/\sd="([^"]+)"/);
  assert.ok(match, `${file} has no path`);
  return match[1];
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css|mjs)$/.test(name) ? [full] : [];
  });
}

test("the retired white and gold mark is gone", () => {
  assert.equal(existsSync(join(brand, "genesis-logo.svg")), false);
  for (const file of ["app", "components", "lib"].flatMap((dir) => sourceFiles(join(root, dir)))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /genesis-logo\.svg/, file);
  }
});

test("the gold marks keep the original paths and stay gold", () => {
  const original = pathData("genesis-logo-gradient.svg");
  for (const file of ["mark-gold.svg", "mark-gold-on-light.svg"]) {
    assert.equal(pathData(file), original, `${file} was redrawn`);
  }
  for (const file of readdirSync(brand).filter((name) => name.endsWith(".svg"))) {
    const svg = readFileSync(join(brand, file), "utf8");
    assert.doesNotMatch(
      svg,
      /(?:fill|stop-color)(?:="|:\s*)(?:#f{3}\b|#f{6}\b|#fdfdfd|white)/i,
      `${file} has a white fill`,
    );
    assert.match(svg, /<linearGradient/, `${file} is not the gradient G`);
  }
});

test("the component picks the gold file by ground", () => {
  const component = readFileSync(join(root, "components/layout/GenesisMark.tsx"), "utf8");
  assert.match(component, /dark: "\/brand\/mark-gold\.svg"/);
  assert.match(component, /light: "\/brand\/mark-gold-on-light\.svg"/);
  const logo = readFileSync(join(root, "components/layout/Logo.tsx"), "utf8");
  assert.match(logo, /ground=\{light \? "dark" : "light"\}/);
});
