import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import {
  GROWTH_DESK_FILES,
  GROWTH_DESK_PICTURES,
  PUBLIC_EDITS,
  SITE_LINKS,
  applyEdits,
  growthDeskRefs,
  localRefs,
  scriptErrors,
  siteRefs,
} from "../scripts/ministry-demo-public.mjs";

/* ── the edits ─────────────────────────────────────────────────────── */

test("a swap replaces its text the stated number of times", () => {
  const once = applyEdits("a.html", "<a href=\"x.html\">X</a>", [{ note: "x to y", find: "x.html", replace: "y.html" }]);
  assert.equal(once.text, '<a href="y.html">X</a>');
  assert.deepEqual(once.report, ["x to y (1 place)"]);

  const twice = applyEdits("a.html", "A and A", [{ note: "both", find: "A", replace: "B", count: 2 }]);
  assert.equal(twice.text, "B and B");
});

test("a swap that does not find its text exactly stops the sync", () => {
  assert.throws(
    () => applyEdits("a.html", "nothing here", [{ note: "gone", find: "sales-find.html", replace: "" }]),
    /a\.html: gone: expected 1 of "sales-find\.html", found 0/,
  );
  assert.throws(
    () => applyEdits("a.html", "A A A", [{ note: "two only", find: "A", replace: "B", count: 2 }]),
    /expected 2 of "A", found 3/,
  );
});

test("a cut removes one block and stops when its markers move", () => {
  const text = "<ul>\n  <li>Keep</li>\n  <li class=\"desk\">Desk</li>\n  <li>Also keep</li>\n</ul>\n";
  const cut = { note: "the desk item", from: '  <li class="desk">', to: "  <li>Also keep</li>", maxLines: 2 };
  const result = applyEdits("a.html", text, [cut]);
  assert.equal(result.text, "<ul>\n  <li>Keep</li>\n  <li>Also keep</li>\n</ul>\n");
  assert.deepEqual(result.report, ["the desk item (1 line removed)"]);

  assert.throws(() => applyEdits("a.html", "no marker", [cut]), /expected 1 of/);
  assert.throws(() => applyEdits("a.html", text + text, [cut]), /expected 1 of .*found 2/);
  assert.throws(() => applyEdits("a.html", text, [{ ...cut, to: "<li>Missing</li>" }]), /no "<li>Missing<\/li>" after/);
  assert.throws(() => applyEdits("a.html", text, [{ ...cut, to: "</ul>", maxLines: 1 }]), /would remove 2 lines, more than the 1 expected/);
  assert.throws(
    () => applyEdits("a.html", text, [{ ...cut, to: "</ul>", maxLines: 5, keep: /Also keep/ }]),
    /would also remove "Also keep"/,
  );
});

test("every public edit names its change, and every cut is guarded", () => {
  const files = Object.keys(PUBLIC_EDITS);
  assert.ok(files.length >= 5);
  for (const file of files) {
    assert.match(file, /^[a-z0-9-]+(\/[a-z0-9-]+)*\.(html|js|css)$/, `${file} is a relative path inside the copy`);
    for (const edit of PUBLIC_EDITS[file]) {
      assert.ok(edit.note.length > 10, `${file}: an edit needs a note for the report`);
      if ("from" in edit) assert.ok(edit.maxLines > 0, `${file}: ${edit.note} needs maxLines`);
    }
  }
});

/* ── the checks ────────────────────────────────────────────────────── */

test("growthDeskRefs finds Growth Desk pages and the words, and nothing else", () => {
  const found = growthDeskRefs('<a href="sales-find.html">Find</a> the Growth Desk, the growth desk, a Growth-Desk');
  assert.deepEqual(
    found.map((ref) => ref.match),
    ["sales-find", "Growth Desk", "growth desk", "Growth-Desk"],
  );
  assert.equal(found[0].line, 1);
  assert.deepEqual(growthDeskRefs("Sales report, wholesales-x, salesforce, growth of the desk"), []);
});

test("growthDeskRefs also finds the words of the Growth Desk's work, outside the shared design system", () => {
  const text = "ACQUISITION / Finding churches. SALES DESK. Suppression list honored. Three prospects.";
  assert.deepEqual(
    growthDeskRefs(text, "platform/journey.html").map((ref) => ref.match),
    ["ACQUISITION", "SALES DESK", "Suppression", "prospects"],
  );
  /* The copied Genesis OS design system is shared with Genesis OS for business. */
  assert.deepEqual(growthDeskRefs("/* Acquisition funnel */", "platform/shared/os/styles.css"), []);
  assert.equal(growthDeskRefs("the Growth Desk", "platform/shared/os/styles.css").length, 1);
  /* Words that only look alike stay allowed. */
  assert.deepEqual(growthDeskRefs("acquisitions board, prospectId, a sales report on the desk", "platform/shared/app.js"), []);
});

test("siteRefs lists links to the rest of geai.us, and only the consultation is allowed", () => {
  assert.deepEqual(SITE_LINKS, ["/contact?topic=ministry"]);
  const page = '<a href="/contact?topic=ministry">Book</a><a href="/pricing">Pricing</a><a href="//cdn.x/y.js">CDN</a><a href="index.html">Hub</a>';
  assert.deepEqual(siteRefs("platform/index.html", page), ["/contact?topic=ministry", "/pricing"]);
  assert.deepEqual(siteRefs("platform/shared/demo.js", 'var CONTACT = "/contact?topic=ministry"; location.pathname.split("/");'), ["/contact?topic=ministry"]);
  assert.deepEqual(siteRefs("platform/shared/os/hawk-core.js", 'var MARK = "/genesis-mark.svg";'), []);
});

test("localRefs resolves pages, stylesheets and platform scripts from where they run", () => {
  const html = [
    '<a href="../templates/bold-dark/index.html?tour=1">Site</a>',
    '<img src="shared/previews/today%20one.jpg">',
    '<a href="https://example.com/x.html">Out</a><a href="mailto:a@b.c">Mail</a><a href="#main">Skip</a>',
    '<a data-site="../templates/{slug}/index.html" href="../index.html">Looks</a>',
  ].join("");
  assert.deepEqual(localRefs("platform/index.html", html).sort(), [
    "index.html",
    "platform/shared/previews/today one.jpg",
    "templates/bold-dark/index.html",
  ]);
  assert.deepEqual(localRefs("platform/shared/os/fonts.css", 'src: url("../fonts/satoshi-400.woff2")'), [
    "platform/shared/fonts/satoshi-400.woff2",
  ]);
  assert.deepEqual(
    localRefs("platform/shared/app.js", 'href: "church-today.html?view=1", src: "../../shared/hope-demo.js"').sort(),
    ["platform/church-today.html"],
  );
  assert.deepEqual(localRefs("index.html", '<a href="../outside.html">Up</a>'), ["../outside.html"]);
});

test("scriptErrors compiles scripts without running them", () => {
  assert.deepEqual(scriptErrors("a.js", "var ok = 1;"), []);
  assert.equal(scriptErrors("a.js", "var broken = ;").length, 1);
  assert.deepEqual(scriptErrors("a.html", '<script>throw new Error("never runs")</script>'), []);
  assert.equal(scriptErrors("a.html", "<script>if (</script>").length, 1);
  assert.equal(scriptErrors("a.html", '<script type="application/json">{"a":</script>').length, 1);
  assert.deepEqual(scriptErrors("a.html", '<script src="x.js"></script>'), []);
});

/* ── the committed public copy ─────────────────────────────────────── */

const DEMO = join(process.cwd(), "public", "ministry-demo");
const TEXT = /\.(html?|js|css|json|md|svg|txt)$/i;
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [relative(DEMO, full).split(sep).join("/")];
  });
}

test("the public demo leaves out the Growth Desk and links only to files it has", { skip: !existsSync(DEMO) }, () => {
  const files = walk(DEMO);
  const have = new Set(files);
  assert.ok(files.length > 100, "the copy is there");
  for (const file of files) {
    assert.ok(!GROWTH_DESK_FILES.test(file) && !GROWTH_DESK_PICTURES.includes(file), `${file} is part of the Growth Desk`);
    if (!TEXT.test(file)) continue;
    const text = readFileSync(join(DEMO, file), "utf8");
    assert.deepEqual(growthDeskRefs(text, file).map((ref) => `${file}:${ref.line} ${ref.match}`), []);
    for (const url of siteRefs(file, text)) assert.ok(SITE_LINKS.includes(url), `${file} links to ${url} on geai.us`);
    for (const ref of localRefs(file, text)) assert.ok(have.has(ref), `${file} points at ${ref}, which is not in the copy`);
    assert.deepEqual(scriptErrors(file, text), []);
    if (/\.html$/.test(file)) {
      assert.match(text, /<meta\s+[^>]*name=["']robots["'][^>]*noindex/i, `${file} must be noindex`);
    }
  }
});

test("the public guided demo starts at Today and ends back at the overview", { skip: !existsSync(DEMO) }, () => {
  const demo = readFileSync(join(DEMO, "platform", "shared", "demo.js"), "utf8");
  const path = demo.match(/var PATH_ALL = \[([\s\S]*?)\];/)?.[1] ?? "";
  const keys = [...path.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(keys[0], "church-today");
  assert.equal(keys.at(-1), "index");
  assert.ok(keys.every((key) => /^(church|member)-|^index$/.test(key)), keys.join(", "));

  /* /ministry opens platform/index.html?tour=1, which goes straight to Today's tour. */
  const hub = readFileSync(join(DEMO, "platform", "index.html"), "utf8");
  assert.match(hub, /location\.replace\("church-today\.html\?tour=1/);
});

test("the public journey has four chapters, none about finding churches", { skip: !existsSync(DEMO) }, () => {
  const journey = readFileSync(join(DEMO, "platform", "journey.html"), "utf8");
  assert.doesNotMatch(journey, /id="launch"|#launch|Finding to launch|finds a church/i);
  assert.deepEqual([...journey.matchAll(/<p class="eyebrow">Chapter (\w+)\./g)].map((m) => m[1]), ["one", "two", "three", "four"]);
  assert.deepEqual([...journey.matchAll(/<span class="num">(\d+)<\/span>/g)].map((m) => m[1]), ["01", "02", "03", "04"]);
  const demo = readFileSync(join(DEMO, "platform", "shared", "demo.js"), "utf8");
  assert.doesNotMatch(demo, /How Does Genesis Find Churches|sel: "#launch"/);
});

test("every public page and the end of the guided demo offer the church consultation", { skip: !existsSync(DEMO) }, () => {
  for (const page of ["index.html", "platform/index.html", "platform/journey.html"]) {
    const html = readFileSync(join(DEMO, page), "utf8");
    assert.ok(html.split('href="/contact?topic=ministry"').length - 1 >= 3, `${page} links to the consultation in its header, menu and footer`);
  }
  const demo = readFileSync(join(DEMO, "platform", "shared", "demo.js"), "utf8");
  assert.match(demo, /endLink: endOfDemo\(nx\) \? CONTACT_LINK : null/);
  assert.match(demo, /function endOfDemo\(nx\) \{ return !!\(nx && nx\.tour === false\); \}/);
  const app = readFileSync(join(DEMO, "platform", "shared", "app.js"), "utf8");
  assert.match(app, /key: "consult", label: "Book a Consultation", href: "\/contact\?topic=ministry"/);
});

test("Hope on the sample sites answers a price question with the price answer", { skip: !existsSync(DEMO) }, () => {
  const hope = readFileSync(join(DEMO, "shared", "hope-demo.js"), "utf8");
  const rules = hope.slice(hope.indexOf("var MATCH ="), hope.indexOf("var CRISIS ="));
  const [, price] = rules.match(/\[(\/[^\n]*?\/i), "price"\]/) ?? [];
  assert.ok(price, "there is a price rule");
  const re = new RegExp(price.slice(1, -2), "i");
  for (const q of ["How much does Genesis Ministry cost?", "What is the price?", "How much is it?"]) assert.ok(re.test(q), q);
  assert.ok(!re.test("How much should I give?"));
  assert.ok(rules.indexOf('"price"]') < rules.indexOf('"custom"]'), "the price rule comes before the custom rule");
  assert.match(hope, /price: \{ t: "Pricing is set with Genesis/);
  assert.doesNotMatch(hope, /custom: \{ t: "Yes\./);
});

test("the public data carries no Growth Desk sample data", { skip: !existsSync(DEMO) }, () => {
  const data = readFileSync(join(DEMO, "platform", "shared", "data.js"), "utf8");
  assert.doesNotMatch(data, /D\.acquisition|outreach|Website Check"|monthly:|sourcesThisQuarter/);
  assert.match(data, /D\.genesisDrafts = \[\];/);
  const deals = data.slice(data.indexOf("deals: ["), data.indexOf("]", data.indexOf("deals: [")));
  assert.deepEqual([...deals.matchAll(/id: "(a-[a-z]+)"/g)].map((m) => m[1]), ["a-lightwell", "a-lampstand", "a-goldenrod", "a-calderhill"]);
  for (const picture of ["early-look.jpg", "four-looks.jpg", "geai-ministry-page.jpg"]) {
    assert.ok(!existsSync(join(DEMO, picture)), `${picture} is not published`);
  }
});
