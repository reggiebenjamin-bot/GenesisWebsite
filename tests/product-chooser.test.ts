import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { FUNDING_LINE } from "../lib/legal.ts";
import { chooserProducts } from "../lib/productChooser.ts";
import { managedPlans } from "../lib/offers.ts";

const DASHES = ["-", "–", "—"];
const EMOJI = /\p{Extended_Pictographic}/u;

test("the chooser is Lending, Real Estate Pros and Business, in the editions' order, with the live checkout links", () => {
  const products = chooserProducts();
  assert.deepEqual(
    products.map((product) => [product.label, product.href]),
    [
      ["Lending", "/lending"],
      ["Real Estate Pros", "/real-estate"],
      ["Business", "/business"],
    ],
  );

  for (const product of products) {
    assert.equal(product.levels.length, managedPlans.length);
    assert.deepEqual(
      product.levels.map((level) => [level.priceDisplay, level.setupLine, level.href]),
      [
        ["$750", "plus $500 setup", `/start/750?edition=${product.key}`],
        ["$1,750", "plus $1,500 setup", `/start/1750?edition=${product.key}`],
        ["$4,500", "plus $10,000 setup", `/start/4500?edition=${product.key}`],
      ],
    );
  }
});

test("chooser copy has no dashes or emoji, and keeps the funding line available", () => {
  const products = chooserProducts();
  for (const product of products) {
    for (const text of [product.label, product.summary]) {
      for (const dash of DASHES) assert.equal(text.includes(dash), false, text);
      assert.equal(EMOJI.test(text), false, text);
    }
  }
  assert.equal(FUNDING_LINE, "Genesis is software. We do not lend, place or arrange funding.");
});

test("the workspace catalog no longer lists tool prices, and tool routes stay", () => {
  const home = readFileSync(new URL("../components/workspace/WorkspaceShell.tsx", import.meta.url), "utf8");
  const catalog = home.slice(home.indexOf("export function WorkspaceHome"), home.indexOf("export function WorkspaceShell"));
  assert.equal(catalog.includes("$49"), false);
  assert.equal(catalog.includes("$79"), false);
  assert.equal(catalog.includes("$99"), false);
  assert.equal(catalog.includes("workspaceTools"), false);
  assert.match(catalog, /href="\/pricing"/);

  const toolPage = readFileSync(new URL("../app/workspace/[tool]/page.tsx", import.meta.url), "utf8");
  assert.match(toolPage, /WorkspaceShell/);
  assert.equal(toolPage.includes("redirect"), false);

  const redirects = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(redirects, /source: "\/tools"/);
  assert.match(redirects, /destination: "\/pricing"/);
  assert.equal(redirects.includes('source: "/workspace/:tool"'), false);
  assert.equal(redirects.includes('source: "/workspace/:path*"'), false);
});
