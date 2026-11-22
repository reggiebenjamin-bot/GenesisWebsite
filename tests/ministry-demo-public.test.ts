import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import {
  GROWTH_DESK_FILES,
  GROWTH_DESK_PICTURES,
  MINISTRY_PLANS,
  PLAN_FILES,
  PLAN_RENAMES,
  PLAN_SOURCE_MARK,
  PRICE_ANSWER,
  PUBLIC_EDITS,
  SITE_LINKS,
  applyEdits,
  growthDeskRefs,
  localRefs,
  oldPlanRefs,
  renamePlans,
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

/* ── the three plans ───────────────────────────────────────────────── */

/** The text renamePlans makes of one string in a file. */
const renamed = (text: string, file = "platform/shared/demo.js") => renamePlans(file, text).text;

test("the plans are Care, Shepherd and Plus, and Hope's price answer names all three", () => {
  assert.deepEqual(
    MINISTRY_PLANS.map((plan) => [plan.level, plan.was, plan.name, plan.price]),
    [
      ["01", "Welcome", "Care", "$149"],
      ["02", "Connect", "Shepherd", "$299"],
      ["03", "Shepherd", "Plus", "$499"],
    ],
  );
  assert.equal(
    PRICE_ANSWER,
    "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.",
  );
  const hope = PUBLIC_EDITS["shared/hope-demo.js"].map((edit) => ("find" in edit ? edit.replace : edit.replace ?? "")).join("\n");
  assert.ok(hope.includes(`price: { t: "${PRICE_ANSWER}"`), "Hope on the sample sites gives the prices");
  const all = JSON.stringify(PUBLIC_EDITS);
  assert.doesNotMatch(all, /level, not plan|Pricing is set on that call/, "no edit turns plan back into level or says pricing is set on a call");
  assert.doesNotMatch(all, /"replace":"[^"]*Pricing is set with Genesis/, "no edit adds the old price line");
});

test("a level label and its name become the plan, and the old names never chain", () => {
  /* Connect becomes Shepherd while the old Shepherd becomes Plus, in one pass. */
  assert.equal(
    renamed('"Level 01, Welcome: the website. " + "Level 02, Connect: everything in Welcome. " + "Level 03, Shepherd: everything in Connect."'),
    '"Care: the website. " + "Shepherd: everything in Care. " + "Plus: everything in Shepherd."',
  );
  assert.equal(renamed("Connect keeps prayer in a locked inbox. Shepherd adds the Access Record screen."), "Shepherd keeps prayer in a locked inbox. Plus adds the Access Record screen.");
  assert.equal(renamed("Welcome is the website in one of four looks."), "Care is the website in one of four looks.");
  assert.equal(renamed("Welcome, Connect and Shepherd, with Enterprise"), "Care, Shepherd and Plus, with Enterprise");
  assert.equal(renamed('hint: "Welcome, Connect, Shepherd, Enterprise"'), 'hint: "Care, Shepherd, Plus, Enterprise"');
  assert.equal(renamed("Switch between Level 01, 02 and 03 any time."), "Switch between Care, Shepherd and Plus any time.");
  assert.equal(renamed('<span class="badge">Level 02, more at 03</span>', "platform/index.html"), '<span class="badge">Shepherd, more in Plus</span>');
  assert.equal(renamed("comes with Level 03, Shepherd, with the gifts picture"), "comes with Plus, with the gifts picture");
  /* Grammar around a lone label. */
  assert.equal(renamed("At Level 01 every form arrives by email. From Level 02 it lands in Guests."), "On the Care plan every form arrives by email. From Shepherd it lands in Guests.");
  assert.equal(renamed('aria-label="This week at Level 01"'), 'aria-label="This week on the Care plan"');
  assert.equal(renamed("Quarterly review, and a look at Level 03"), "Quarterly review, and a look at Plus");
  assert.equal(renamed("This is the screen a Level 01 church sees."), "This is the screen a church on Care sees.");
  assert.equal(renamed("Below Level 02 the app shows a calm Included in Level 02 state."), "On Care, the app shows a calm Included in Shepherd state.");
  assert.equal(renamed('</svg>L03</em><span class="sr-only">, included in Level 03</span>'), '</svg>Plus</em><span class="sr-only">, included in Plus</span>');
  /* Words that only look like level names stay. */
  const kept = 'source: "Connect card", ["Shepherd", sh ? sh.name : "Not set"], "Welcome Team", <h3>Welcome</h3>';
  assert.equal(renamed(kept), kept);
});

test('where a reader saw "level" they read "plan", and code keeps the word', () => {
  assert.equal(
    renamed('{ label: "What Does Each Level Include?", ask: "What does each level include?" }'),
    '{ label: "What Does Each Plan Include?", ask: "What does each plan include?" }',
  );
  assert.equal(
    renamed('<a href="#levels">Levels</a> <a href="#levels">Levels <span aria-hidden="true">&#8599;</span></a> <h2 id="levels-title">Choose your level</h2> Compare Levels. Choose Your Level', "platform/index.html"),
    '<a href="#levels">Plans</a> <a href="#levels">Plans <span aria-hidden="true">&#8599;</span></a> <h2 id="levels-title">Choose your plan</h2> Compare Plans. Choose Your Plan',
  );
  /* The guided demo finds its buttons by their label, so the matcher follows the label. */
  assert.equal(renamed('aria-label="Demo This Level: Care">Demo This Level</a>', "platform/index.html"), 'aria-label="Demo This Plan: Care">Demo This Plan</a>');
  assert.equal(renamed("/^Demo (This Level|Level 0\\d)$/i.test(label)"), "/^Demo (This Plan|Level 0\\d)$/i.test(label)");
  assert.equal(
    renamed("Switch the level to see them. At this level the prayer words stay in email. Each Demo This Level button opens Today at that level."),
    "Switch the plan to see them. On this plan the prayer words stay in email. Each Demo This Plan button opens Today on that plan.",
  );
  assert.equal(renamed('aria-label="Plan level shown in this preview"'), 'aria-label="Plan shown in this preview"');
  assert.equal(renamed("Every level includes the website. The church you chose, and its level, carry through every screen."), "Every plan includes the website. The church you chose, and its plan, carry through every screen.");
  /* A plan name after "at" reads "on the ... plan". */
  assert.equal(renamed('"Guests are all here at " + GM.level().code + "."'), '"Guests are all here on the " + GM.level().code + " plan."');
  assert.equal(renamed('"At " + GM.level().code + " I answer questions"'), '"On the " + GM.level().code + " plan I answer questions"');
  assert.equal(renamed('" seats are in use at " + ctx.level.code + ". "'), '" seats are in use on the " + ctx.level.code + " plan. "');
  assert.equal(
    renamed('", so at " + GM.level().code + (end ? " the demo ends here" : " the demo goes on")'),
    '", so on the " + GM.level().code + " plan" + (end ? " the demo ends here" : " the demo goes on")',
  );
  /* Class names, data keys, anchors and the matchers for what a visitor types keep the word. */
  const kept = '.level .price { } D.levels.map, class="card level", #levels, the second-level column, v2-level-card, level: 2, /level|plan|includ/i, welcome level|connect level';
  assert.equal(renamed(kept), kept);
  assert.deepEqual(oldPlanRefs(kept, "platform/shared/app.js"), []);
  assert.deepEqual(
    oldPlanRefs('Compare Levels. Switch the level. <a href="#levels">Levels</a> "At " + GM.level().code', "platform/shared/app.js").map((ref) => ref.match),
    ["Compare Levels", "the level", ">Levels<", 'At " + GM.level().code'],
  );
});

test("the data gives each plan its name and price, and the scripts show the name once", () => {
  assert.equal(
    renamed('{ n: 2, code: "Level 02", name: "Connect", draft: true }', "platform/shared/data.js"),
    '{ n: 2, code: "Shepherd", name: "Shepherd", price: "$299 a month", draft: true }',
  );
  assert.equal(
    renamed('{ n: 4, code: "Enterprise", name: "Enterprise", draft: true }', "platform/shared/data.js"),
    '{ n: 4, code: "Enterprise", name: "Enterprise", price: "Scoped on a call", draft: true }',
  );
  assert.equal(renamed('D.pricingLine = "Pricing set with Genesis";', "platform/shared/data.js"), `D.pricingLine = "${PRICE_ANSWER}";`);
  const app = "platform/shared/app.js";
  assert.equal(renamed(`'Included in ' + esc(lv.code) + ", " + esc(lv.name)`, app), `'Included in ' + esc(lv.name)`);
  assert.equal(renamed('esc(lv.code + ", " + lv.name + (on ? ", shown now" : ""))', app), 'esc(lv.name + (on ? ", shown now" : ""))');
  assert.equal(
    renamed(`'<b>' + esc(lv.code.replace("Level ", "")) + "</b><span>" + esc(lv.name) + "</span>"`, app),
    `'<b>' + esc(lv.name) + "</b><span>" + esc(lv.price) + "</span>"`,
  );
  assert.equal(renamed('esc(code.replace("Level ", "L"))', app), "esc(code)");
  assert.equal(
    renamed('". This preview shows Level 0" + plan + "."', app),
    '". This preview shows " + ["Care","Shepherd","Plus"][plan - 1] + "."',
  );
  assert.equal(
    renamed('seat. Levels are a draft. " + D.pricingLine + "." }', "platform/church-team.html"),
    'seat. " + D.pricingLine + "" }',
  );
  assert.equal(renamed('data-tour="shell.plan"><span>Level</span>', app), 'data-tour="shell.plan"><span>Plan</span>');
});

test("price lines become the prices, and the hub's cards print them", () => {
  assert.equal(
    renamed('    price: "Pricing is set with Genesis, on a call. This preview never shows a price or a dollar amount, and the levels are a draft.",'),
    `    price: "${PRICE_ANSWER}",`,
  );
  assert.equal(renamed("Each level includes everything before it. Draft levels. Pricing set with Genesis.", "platform/journey.html"), `Each plan includes everything before it. ${PRICE_ANSWER}`);
  const card = (eyebrow: string, name: string) =>
    `<p class="eyebrow">${eyebrow}</p>\n          <h3>${name}</h3>\n          <p class="sum">Sum.</p>\n          <p class="price">Pricing set with Genesis</p>`;
  const hub = renamed([card("Level 02", "Connect"), card("Scoped on a call", "Enterprise")].join("\n"), "platform/index.html");
  assert.equal(
    hub,
    '<h3>Shepherd</h3>\n          <p class="sum">Sum.</p>\n          <p class="price"><b>$299</b> <span>per month</span></p>\n' +
      '<p class="eyebrow">Scoped on a call</p>\n          <h3>Enterprise</h3>\n          <p class="sum">Sum.</p>\n          <p class="price"><span>Priced with you on a call</span></p>',
  );
  assert.equal(
    renamed('<tspan x="388" dy="0">LEVEL 01</tspan></text><text class="t big"><tspan x="388" dy="0">Welcome</tspan>', "platform/journey.html"),
    '<tspan x="388" dy="0">$149 A MONTH</tspan></text><text class="t big"><tspan x="388" dy="0">Care</tspan>',
  );
});

test("the renames touch only the demo's own pages and scripts", () => {
  for (const file of ["index.html", "shared/hope-demo.js", "platform/index.html", "platform/shared/app.js", "platform/story/story.js"]) {
    assert.ok(PLAN_FILES.test(file), file);
  }
  for (const file of ["templates/bold-dark/index.html", "platform/shared/os/hawk-core.js", "platform/shared/genesis.css", "platform/DESIGN.md"]) {
    assert.ok(!PLAN_FILES.test(file), file);
    assert.equal(renamed("Level 01, Welcome", file), "Level 01, Welcome");
  }
  assert.ok(PLAN_SOURCE_MARK.test('{ n: 1, code: "Level 01", name: "Welcome", draft: true'));
  assert.ok(!PLAN_SOURCE_MARK.test('{ n: 1, code: "Care", name: "Care", price: "$149 a month"'));
  for (const rule of PLAN_RENAMES) {
    assert.ok(rule.pattern.global, `${rule.note} must be global`);
    assert.ok(rule.note.length > 10);
  }
});

test("oldPlanRefs finds what the renames missed", () => {
  const text = 'At Level 02 the email. "Level 0" + n. Everything in Connect. Pricing is set with Genesis. <span class="badge">Draft levels</span> name: "Welcome"';
  assert.deepEqual(
    oldPlanRefs(text, "platform/shared/demo.js").map((ref) => ref.match),
    ["Level 02", 'Level 0" +', "Pricing is set with Genesis", "Draft levels", "Everything in Connect", 'name: "Welcome"'],
  );
  /* A bare name: "Welcome" outside a level entry is not renamed; the check stops the sync on it instead. */
  assert.deepEqual(oldPlanRefs(renamed(text), "platform/shared/demo.js").map((ref) => ref.match), ['name: "Welcome"']);
  assert.deepEqual(oldPlanRefs("Level 01", "templates/bold-dark/index.html"), []);
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
/*
 * Whether the committed copy has the three plans. It was synced before the
 * plans, so until the next sync the checks of the plans in it are marked
 * todo (they run and report, but do not fail the suite), and the renames are
 * instead checked against the copy as it is.
 */
const DEMO_DATA = join(DEMO, "platform", "shared", "data.js");
const PLANS_SYNCED = existsSync(DEMO_DATA) && !PLAN_SOURCE_MARK.test(readFileSync(DEMO_DATA, "utf8"));
const AFTER_SYNC = PLANS_SYNCED ? {} : { todo: "re-sync public/ministry-demo/ with scripts/sync-ministry-demo.mjs to give the demo the three plans" };
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
  assert.doesNotMatch(hope, /custom: \{ t: "Yes\./);
});

test("the renames leave nothing of the draft levels in the committed copy", { skip: !existsSync(DEMO) || PLANS_SYNCED ? "the copy already has the plans" : false }, () => {
  let changed = 0;
  for (const file of walk(DEMO).filter((name) => PLAN_FILES.test(name))) {
    const { text, counts } = renamePlans(file, readFileSync(join(DEMO, file), "utf8"));
    changed += Object.values(counts).reduce((n: number, count) => n + (count as number), 0);
    assert.deepEqual(oldPlanRefs(text, file).map((ref) => `${file}:${ref.line} ${ref.what}: ${ref.context}`), []);
    assert.deepEqual(scriptErrors(file, text), []);
  }
  assert.ok(changed > 150, `the renames found the levels (${changed} changes)`);
});

test("the public demo names the three plans and their prices, as /ministry does", { ...AFTER_SYNC, skip: !existsSync(DEMO) }, () => {
  for (const file of walk(DEMO).filter((name) => PLAN_FILES.test(name))) {
    assert.deepEqual(oldPlanRefs(readFileSync(join(DEMO, file), "utf8"), file).map((ref) => `${file}:${ref.line} ${ref.match}`), []);
  }
  const hub = readFileSync(join(DEMO, "platform", "index.html"), "utf8");
  for (const plan of MINISTRY_PLANS) assert.match(hub, new RegExp(`<h3>${plan.name}</h3>[\\s\\S]*?<b>\\${plan.price}</b> <span>per month</span>`));
  /* Team roles come with Shepherd; Plus adds custom roles. */
  const shepherdCard = hub.slice(hub.indexOf("<h3>Shepherd</h3>"), hub.indexOf("<h3>Plus</h3>"));
  assert.match(shepherdCard, /Team roles, with the prayer team named/);
  const demo = readFileSync(join(DEMO, "platform", "shared", "demo.js"), "utf8");
  assert.match(demo, /"Shepherd: [^"]*team roles/);
  assert.doesNotMatch(demo, /"Plus: [^"]*team roles/);
  assert.ok(demo.includes(`price: "${PRICE_ANSWER}"`), "the platform's Hope gives the prices");
  const hope = readFileSync(join(DEMO, "shared", "hope-demo.js"), "utf8");
  assert.ok(hope.includes(`price: { t: "${PRICE_ANSWER}"`), "Hope on the sample sites gives the prices");
  const data = readFileSync(DEMO_DATA, "utf8");
  assert.ok(data.includes(`D.pricingLine = "${PRICE_ANSWER}";`));
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
