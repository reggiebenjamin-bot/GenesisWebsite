import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import {
  DRAFT_LEVEL_MARK,
  GROWTH_DESK_FILES,
  GROWTH_DESK_PICTURES,
  MINISTRY_PLANS,
  PLAN_DATA,
  PLAN_FILES,
  PRICE_ANSWER,
  PUBLIC_EDITS,
  SITE_LINKS,
  applyEdits,
  growthDeskRefs,
  localRefs,
  oldPlanRefs,
  planProblems,
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

test("a drop removes each presenter-only element with what is inside it, and counts them", () => {
  const text = [
    "<nav>",
    '  <a href="#guest">Guest</a>',
    '  <a href="#start" data-public-only>Getting Started</a>',
    '  <a href="#launch" data-present-only>Finding to Launch</a>',
    "</nav>",
    '<section id="launch" data-present-only>',
    "  <div><div>Nested</div></div>",
    '  <a href="sales-find.html">Find</a>',
    "</section>",
    '<p class="eyebrow"><span data-public-only>Five doors</span><span data-present-only>Seven doors</span></p>',
    "",
  ].join("\n");
  const drop = { note: "presenter parts", drop: "data-present-only", count: 3 };
  const result = applyEdits("a.html", text, [drop]);
  assert.equal(
    result.text,
    [
      "<nav>",
      '  <a href="#guest">Guest</a>',
      '  <a href="#start" data-public-only>Getting Started</a>',
      "</nav>",
      '<p class="eyebrow"><span data-public-only>Five doors</span></p>',
      "",
    ].join("\n"),
  );
  assert.deepEqual(result.report, ["presenter parts (3 elements, 5 lines removed)"]);
  assert.throws(() => applyEdits("a.html", text, [{ ...drop, count: 2 }]), /expected 2 elements with data-present-only, found 3 or more/);
  assert.throws(() => applyEdits("a.html", text, [{ ...drop, count: 4 }]), /expected 4 elements with data-present-only, found 3/);
  assert.throws(() => applyEdits("a.html", text, [{ ...drop, keep: /Nested/ }]), /would also remove "Nested"/);
  assert.throws(() => applyEdits("a.html", '<div data-present-only><p>open', [{ ...drop, count: 1 }]), /no closing <\/div>/);
  /* The attribute's name has to match whole: data-present-only-x is not it. */
  assert.equal(applyEdits("a.html", '<p data-present-only-x>Keep</p>', [{ ...drop, count: 0 }]).text, '<p data-present-only-x>Keep</p>');
});

test("every public edit names its change, and every cut and drop is guarded", () => {
  const files = Object.keys(PUBLIC_EDITS);
  assert.ok(files.length >= 5);
  for (const file of files) {
    assert.match(file, /^[a-z0-9-]+(\/[a-z0-9-]+)*\.(html|js|css)$/, `${file} is a relative path inside the copy`);
    for (const edit of PUBLIC_EDITS[file]) {
      assert.ok(edit.note.length > 10, `${file}: an edit needs a note for the report`);
      if ("from" in edit) assert.ok(edit.maxLines >= 0, `${file}: ${edit.note} needs maxLines`);
      if ("drop" in edit) assert.ok(edit.count > 0 && edit.keep, `${file}: ${edit.note} needs a count and a keep guard`);
    }
  }
  /* The three story pages drop their presenter parts and lose the presenter switch in their head. */
  for (const page of ["index.html", "platform/index.html", "platform/journey.html"]) {
    const notes = PUBLIC_EDITS[page].map((edit) => edit.note).join("\n");
    assert.match(notes, /presenter switch from the head/, page);
    assert.match(notes, /data-present-only/, page);
  }
  const all = JSON.stringify(PUBLIC_EDITS);
  assert.doesNotMatch(all, /"replace":"[^"]*(Pricing is set with Genesis|Level 0[1-3])/, "no edit brings back the draft levels or the old price line");
  assert.doesNotMatch(all, /"replace":"[^"]*https:\/\/geai\.us/, "no edit adds a full geai.us address");
});

/* ── the three plans ───────────────────────────────────────────────── */

test("the plans are Care, Shepherd and Plus, and Hope's price answer names all three", () => {
  assert.deepEqual(
    MINISTRY_PLANS.map((plan) => [plan.level, plan.was, plan.name, plan.price]),
    [
      ["01", "Welcome", "Care", "$149"],
      ["02", "Connect", "Shepherd", "$299"],
      ["03", "Shepherd", "Plus", "$499"],
    ],
  );
  assert.deepEqual(MINISTRY_PLANS.map((plan) => plan.staffLogins), [2, 5, 15]);
  assert.equal(
    PRICE_ANSWER,
    "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.",
  );
  assert.equal(PLAN_DATA, "platform/shared/data.js");
});

test("planProblems accepts the plans as /ministry shows them and names anything else", () => {
  const good = [
    `  D.pricingLine = "${PRICE_ANSWER}";`,
    '    { n: 1, code: "Care", name: "Care", price: "$149 a month", seats: "2 staff logins" },',
    '    { n: 2, code: "Shepherd", name: "Shepherd", price: "$299 a month", seats: "5 staff logins" },',
    '    { n: 3, code: "Plus", name: "Plus", price: "$499 a month", seats: "15 staff logins" },',
    '    { n: 4, code: "Enterprise", name: "Enterprise", price: "Scoped on a call", seats: "Scoped on a call" },',
  ].join("\n");
  assert.deepEqual(planProblems(good), []);
  assert.deepEqual(planProblems(good.replace('"$299 a month"', '"$249 a month"')), [
    "the Shepherd plan is not named with its price, $299 a month",
    "the Shepherd plan does not have 5 staff logins",
    "it names $249, which is not a plan price",
  ]);
  assert.deepEqual(planProblems(good.replace("Plus at $499", "Plus at $599")), [
    `D.pricingLine is not "${PRICE_ANSWER}"`,
    "it names $599, which is not a plan price",
  ]);
  assert.match(planProblems(good + '\n{ n: 1, code: "Level 01", name: "Welcome", draft: true }').join("\n"), /still has the draft levels/);
  assert.deepEqual(planProblems(good.replace('seats: "5 staff logins"', 'seats: "Up to 8 staff seats"')), [
    "the Shepherd plan does not have 5 staff logins",
  ]);
  assert.deepEqual(planProblems(good.replace('seats: "2 staff logins"', 'seats: "One sign-in"')), [
    "the Care plan does not have 2 staff logins",
  ]);
  assert.match(planProblems(good.replace('price: "Scoped on a call", seats', 'price: "$999", seats')).join("\n"), /Enterprise is not scoped on a call/);
  assert.ok(DRAFT_LEVEL_MARK.test('{ n: 1, code: "Level 01", name: "Welcome", draft: true'));
  assert.ok(!DRAFT_LEVEL_MARK.test('{ n: 1, code: "Care", name: "Care", price: "$149 a month"'));
});

test("the plan checks look only at the demo's own pages and scripts", () => {
  for (const file of ["index.html", "shared/hope-demo.js", "platform/index.html", "platform/shared/app.js", "platform/story/story.js"]) {
    assert.ok(PLAN_FILES.test(file), file);
  }
  for (const file of ["templates/bold-dark/index.html", "platform/shared/os/hawk-core.js", "platform/shared/genesis.css", "platform/DESIGN.md"]) {
    assert.ok(!PLAN_FILES.test(file), file);
    assert.deepEqual(oldPlanRefs("Level 01, Welcome", file), []);
  }
});

test("oldPlanRefs finds what is left of the draft levels", () => {
  const text = 'At Level 02 the email. "Level 0" + n. Everything in Connect. Pricing is set with Genesis. <span class="badge">Draft levels</span> name: "Welcome"';
  assert.deepEqual(
    oldPlanRefs(text, "platform/shared/demo.js").map((ref) => ref.match),
    ["Level 02", 'Level 0" +', "Pricing is set with Genesis", "Draft levels", "Everything in Connect", 'name: "Welcome"'],
  );
  assert.deepEqual(oldPlanRefs("Level 01", "templates/bold-dark/index.html"), []);
  /* Class names, data keys, anchors and the matchers for what a visitor types keep the word. */
  const kept = '.level .price { } D.levels.map, class="card level", #levels, the second-level column, v2-level-card, level: 2, /level|plan|includ/i, welcome level|connect level';
  assert.deepEqual(oldPlanRefs(kept, "platform/shared/app.js"), []);
  assert.deepEqual(
    oldPlanRefs('Compare Levels. Switch the level. <a href="#levels">Levels</a> "At " + GM.level().code', "platform/shared/app.js").map((ref) => ref.match),
    ["Compare Levels", "the level", ">Levels<", 'At " + GM.level().code'],
  );
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

test("siteRefs lists links to the rest of geai.us, and only the consultation, by its path, is allowed", () => {
  assert.deepEqual(SITE_LINKS, ["/contact?topic=ministry-demo", "/ministry"]);
  const page = '<a href="/contact?topic=ministry-demo">Talk</a><a href="/pricing">Pricing</a><a href="//cdn.x/y.js">CDN</a><a href="index.html">Hub</a>';
  assert.deepEqual(siteRefs("platform/index.html", page), ["/contact?topic=ministry-demo", "/pricing"]);
  assert.deepEqual(
    siteRefs("platform/shared/demo.js", 'var CONTACT = "/contact?topic=ministry-demo"; location.pathname.split("/");'),
    ["/contact?topic=ministry-demo"],
  );
  assert.deepEqual(siteRefs("platform/shared/os/hawk-core.js", 'var MARK = "/genesis-mark.svg";'), []);
  /* A full geai.us address is always reported, in any file, even for the consultation. */
  assert.deepEqual(siteRefs("platform/shared/data.js", 'D.genesisContact = "https://geai.us/contact?topic=ministry-demo";'), [
    "https://geai.us/contact?topic=ministry-demo",
  ]);
  assert.deepEqual(siteRefs("templates/bold-dark/hope.json", '{"url": "https://www.geai.us/ministry"}'), ["https://www.geai.us/ministry"]);
  assert.ok(!SITE_LINKS.includes("https://geai.us/contact?topic=ministry-demo"));
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
const read = (file: string) => readFileSync(join(DEMO, file), "utf8");

test("the public demo leaves out the Growth Desk and links only to files it has", { skip: !existsSync(DEMO) }, () => {
  const files = walk(DEMO);
  const have = new Set(files);
  assert.ok(files.length > 100, "the copy is there");
  assert.ok(have.has("shared/crisis-words.js"), "the crisis words every Hope loads are there");
  for (const file of files) {
    assert.ok(!GROWTH_DESK_FILES.test(file) && !GROWTH_DESK_PICTURES.includes(file), `${file} is part of the Growth Desk`);
    if (!TEXT.test(file)) continue;
    const text = read(file);
    assert.deepEqual(growthDeskRefs(text, file).map((ref) => `${file}:${ref.line} ${ref.match}`), []);
    for (const url of siteRefs(file, text)) assert.ok(SITE_LINKS.includes(url), `${file} links to ${url} on geai.us`);
    for (const ref of localRefs(file, text)) assert.ok(have.has(ref), `${file} points at ${ref}, which is not in the copy`);
    assert.deepEqual(scriptErrors(file, text), []);
    if (/\.html$/.test(file)) {
      assert.match(text, /<meta\s+[^>]*name=["']robots["'][^>]*noindex/i, `${file} must be noindex`);
      assert.doesNotMatch(text, /\sdata-present-only\b|Presenting: \?present=1/, `${file} has no presenter parts`);
    }
  }
});

test("the public copy has no presenter mode", { skip: !existsSync(DEMO) }, () => {
  assert.match(read("platform/shared/app.js"), /\r?\n  GM\.presenting = false;\r?\n/);
  assert.doesNotMatch(read("platform/shared/app.js"), /params\.get\("present"\)|gm\.present/);
  assert.match(read("platform/story/story.js"), /\r?\n  var present = false;\r?\n/);
  assert.doesNotMatch(read("platform/story/story.js"), /params\.get\("present"\)|gm\.present/);
  assert.match(read("platform/shared/demo.js"), /var PRESENT = false;/);
  assert.match(read("platform/shared/demo.js"), /var ORIGIN = "church";/);
});

test("the public guided demo starts at Today and ends back at the overview", { skip: !existsSync(DEMO) }, () => {
  const demo = read("platform/shared/demo.js");
  const path = demo.match(/var PATH_ALL = \[([\s\S]*?)\];/)?.[1] ?? "";
  const keys = [...path.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(keys[0], "church-today");
  assert.equal(keys.at(-1), "index");
  assert.ok(keys.every((key) => /^(church|member)-|^index$/.test(key)), keys.join(", "));

  /* /ministry opens platform/index.html?tour=1, which goes straight to Today's tour. */
  assert.match(read("platform/index.html"), /location\.replace\("church-today\.html\?tour=1/);
  /* Each card says which screen of how many it is. */
  assert.match(demo, /function screenOf\(\)/);
  assert.equal(demo.split("screenOf() + fill(").length - 1, 3);
});

test("the public journey has five chapters, with Getting Started and none about finding churches", { skip: !existsSync(DEMO) }, () => {
  const journey = read("platform/journey.html");
  assert.doesNotMatch(journey, /id="launch"|#launch|Finding to launch|finds a church|dg-launch/i);
  assert.match(journey, /<section class="sheet rise s-ink" id="start" aria-labelledby="start-title">/);
  assert.deepEqual([...journey.matchAll(/<p class="eyebrow">Chapter (\w+)\./g)].map((m) => m[1]), ["one", "two", "three", "four", "five"]);
  assert.deepEqual([...journey.matchAll(/<span class="num">(\d+)<\/span>/g)].map((m) => m[1]), ["01", "02", "03", "04", "05"]);
  const demo = read("platform/shared/demo.js");
  assert.doesNotMatch(demo, /How Does Genesis Find Churches|sel: \["#launch|journey\.html#launch|ANSWERS\.outreach|"outreach"\]/);
});

test("every public page and the end of the guided demo offer the church consultation", { skip: !existsSync(DEMO) }, () => {
  const contact = `href="${SITE_LINKS[0]}"`;
  for (const page of ["index.html", "platform/index.html", "platform/journey.html"]) {
    assert.ok(read(page).split(contact).length - 1 >= 4, `${page} links to the consultation in its header, menu, footer and closing band`);
  }
  const demo = read("platform/shared/demo.js");
  assert.ok(demo.includes(`var CONTACT = (D && D.genesisContact) || (STORY && STORY.contact) || "${SITE_LINKS[0]}";`));
  assert.match(demo, /links: last \? \[\{ label: "Book a Call", href: CONTACT \}\]\.concat\(SHORT_RUN \? \[\{ label: "See Every Screen"/);
  assert.match(demo, /\{ label: "How to Get Started", href: "journey\.html#start" \}/);
  assert.ok(read("platform/shared/data.js").includes(`D.genesisContact = "${SITE_LINKS[0]}";`));
  assert.ok(read("platform/story/story.js").includes(`var GENESIS_CONTACT_URL = "${SITE_LINKS[0]}";`));
  assert.ok(read("platform/shared/app.js").includes(`{ key: "consult", label: "Book a Call", href: "${SITE_LINKS[0]}", icon: "call"`));
  /* Book a Call, the site's own words, opens in the same tab. */
  for (const file of walk(DEMO).filter((name) => TEXT.test(name))) {
    assert.doesNotMatch(read(file), /Talk With Genesis/, `${file} still says Talk With Genesis`);
    assert.doesNotMatch(read(file), /data-contact[^>]*target="_blank"/, `${file} opens Book a Call in a new tab`);
  }
});

/* The crisis line is fixed wording. A hand-written variant fails, so one can never come back. */
test("every crisis sentence in the public demo uses the fixed line", { skip: !existsSync(DEMO) }, () => {
  const FIXED = "In danger or crisis? Call 911, or call or text 988.";
  const VARIANTS = [
    /If you are in crisis, call or text 988/,
    /or 911 in an emergency/,
    /If you are in danger, call 911/,
    /in danger right now, call 911/,
    /not safe(?: at home)?, call 911/,
    /Please call or text 988 now/,
  ];
  let fixed = 0;
  for (const file of walk(DEMO).filter((name) => TEXT.test(name))) {
    const text = read(file);
    for (const variant of VARIANTS) assert.doesNotMatch(text, variant, `${file} has a hand-written crisis line`);
    fixed += text.split(FIXED).length - 1;
  }
  assert.ok(fixed >= 10, "the fixed line is used across the demo");
  for (const file of ["platform/shared/app.js", "shared/hope-demo.js"]) {
    assert.ok(read(file).includes(`var CRISIS_LINE = " ${FIXED}";`), `${file} appends the fixed line`);
  }
});

test("Hope on the sample sites answers a price question with the price answer", { skip: !existsSync(DEMO) }, () => {
  const hope = read("shared/hope-demo.js");
  const rules = hope.slice(hope.indexOf("var PRODUCT = ["), hope.indexOf("var SITE = ["));
  const [, price] = rules.match(/\[(\/[^\n]*?\/i), "price"\]/) ?? [];
  assert.ok(price, "there is a price rule");
  const re = new RegExp(price.slice(1, -2), "i");
  for (const q of ["How much does Genesis Ministry cost?", "What is the price?", "How much is it?"]) assert.ok(re.test(q), q);
  assert.ok(!re.test("How much should I give?"));
  assert.ok(rules.indexOf('"price"]') < rules.indexOf('"custom"]'), "the price rule comes before the custom rule");
  assert.doesNotMatch(hope, /custom: \{ t: "Yes\./);
  assert.ok(hope.includes(`price: { t: "${PRICE_ANSWER}`), "Hope on the sample sites gives the prices");
});

test("the public demo names the three plans and their prices, as /ministry does", { skip: !existsSync(DEMO) }, () => {
  for (const file of walk(DEMO).filter((name) => PLAN_FILES.test(name))) {
    assert.deepEqual(oldPlanRefs(read(file), file).map((ref) => `${file}:${ref.line} ${ref.match}`), []);
  }
  assert.deepEqual(planProblems(read(PLAN_DATA)), []);
  const hub = read("platform/index.html");
  for (const plan of MINISTRY_PLANS) assert.match(hub, new RegExp(`<h3>${plan.name}</h3>[\\s\\S]*?<b>\\${plan.price}</b> <span>per month</span>`));
  /* Team roles come with Shepherd; Plus adds custom roles. */
  const shepherdCard = hub.slice(hub.indexOf("<h3>Shepherd</h3>"), hub.indexOf("<h3>Plus</h3>"));
  assert.match(shepherdCard, /Team roles, with the prayer team named/);
  const demo = read("platform/shared/demo.js");
  assert.ok(demo.includes(PRICE_ANSWER), "the platform's Hope gives the prices");
  assert.match(demo, /price: PRICES \+ " Enterprise, for more than one campus, is scoped on a call\./);
  assert.doesNotMatch(demo, /"Plus is everything in Shepherd[^"]*team roles/);
});

test("the public data carries no Growth Desk sample data", { skip: !existsSync(DEMO) }, () => {
  const data = read("platform/shared/data.js");
  assert.doesNotMatch(data, /D\.acquisition|outreach|Website Check"|monthly:|sourcesThisQuarter/);
  assert.match(data, /D\.genesisDrafts = \[\];/);
  /* The sample accounts' deals, owners and lead sources, and Genesis's own team, are cut too: the lists
     stay empty so the guest stages and the shell still work. */
  assert.match(data, /D\.sales = \{ stages: \[\], afterStages: \[\], deals: \[\] \};/);
  assert.match(data, /D\.genesisTeam = \[\];/);
  assert.doesNotMatch(data, /a-lightwell|Website Check reply|Inbound from geai\.us|Elder board decision|Church Partnerships/);
  const app = read("platform/shared/app.js");
  assert.doesNotMatch(app, /title = "Add a church"|Church Website Check request/);
  for (const picture of ["early-look.jpg", "four-looks.jpg", "geai-ministry-page.jpg"]) {
    assert.ok(!existsSync(join(DEMO, picture)), `${picture} is not published`);
  }
  for (const working of ["shared/hope-check.html", "shared/test.html", "platform/DESIGN.md", "LAUNCH.md", "README.md"]) {
    assert.ok(!existsSync(join(DEMO, working)), `${working} is not published`);
  }
});
