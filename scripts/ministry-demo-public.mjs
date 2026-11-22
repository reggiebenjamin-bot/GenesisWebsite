/*
 * What makes the public copy of the Genesis Ministry demo public.
 *
 * scripts/sync-ministry-demo.mjs copies the demo from the Genesis Ministry
 * working folder into public/ministry-demo/. That folder is owned by another
 * team and is never edited from here, so everything the public copy needs to
 * be different is written below, as edits made to the copy:
 *
 *   - PUBLIC_EDITS: exact text swaps and block cuts per copied file. Each one
 *     must find its text exactly as written (a swap the stated number of
 *     times, a cut exactly once), or the sync stops and names it. When the
 *     working folder changes, a stale edit fails loudly instead of quietly
 *     leaving a link to the Growth Desk behind.
 *   - growthDeskRefs: what may never appear in a public file.
 *   - localRefs: the local files a copied page or script points at, so the
 *     sync can stop on a link to a file that was not copied.
 *   - PLAN_RENAMES and oldPlanRefs: the three plans. The owner replaced the
 *     draft levels with Care ($149 a month), Shepherd ($299) and Plus ($499).
 *     The renames run on every page and script after PUBLIC_EDITS and give
 *     the plan names and prices; oldPlanRefs stops the sync on any old level
 *     label, level name sentence or "pricing set with Genesis" left behind.
 *
 * RE-SYNC NEEDED. The committed public/ministry-demo/ was synced before the
 * plans, so it still shows the draft levels until the next sync. The source
 * was being edited when the plans were added, and several PUBLIC_EDITS no
 * longer find their text in its working tree; review them against the
 * commit you sync from.
 *
 * The owner's decision: the Growth Desk (platform/sales-*, Genesis's own tool
 * for finding and selling to churches) is not part of the public demo. No
 * public page may link to it, tour it or point at it. The edits below remove
 * every door, link, tour step and demo path stop that led there, send Compare
 * Levels to the levels on the hub and the journey instead of the Growth Desk's
 * Levels screen, and start the guided demo at Today.
 *
 * tests/ministry-demo-public.test.ts tests the helpers and checks the
 * committed copy.
 *
 * Copy rules for every word added here: no em dashes, no emojis, plain short
 * sentences.
 */
import { posix } from "node:path";
import vm from "node:vm";

/**
 * A swap: replace `find` with `replace`, which must occur exactly `count`
 * times (1 when not given).
 * @typedef {{ note: string, find: string, replace: string, count?: number }} Swap
 */
/**
 * A cut: remove the text from `from` (included) up to the first `to` after it
 * (not included), and put `replace` there. `from` must occur exactly once.
 * Two guards against a moved marker swallowing something the public copy
 * needs: the cut may remove at most `maxLines` lines, and, when `keep` is
 * given, the removed text must not match it.
 * @typedef {{ note: string, from: string, to: string, maxLines: number, replace?: string, keep?: RegExp }} Cut
 */
/** @typedef {Swap | Cut} Edit */

/** Copied files of the Growth Desk itself. Never in the public copy. */
export const GROWTH_DESK_FILES = /^platform\/sales-/;

/** Screenshots of Growth Desk screens, shown only on the Growth Desk doors of the hub. */
export const GROWTH_DESK_PICTURES = ["platform/shared/previews/door-acquisition.jpg", "platform/shared/previews/door-sales.jpg"];

/** Words and paths that may not appear in any public file. */
const FORBIDDEN = [
  { what: "a Growth Desk page (sales-*)", pattern: /\bsales-[a-z][a-z0-9-]*/gi },
  { what: 'the words "Growth Desk"', pattern: /growth[\s-]*desk/gi },
];

/*
 * The words of the Growth Desk's work: its two parts (Acquisition and the
 * Sales Desk), its prospects and its suppression list. They may not appear in
 * a public page, script or note either. The copied Genesis OS design system
 * (platform/shared/os/) is left out of this check: it is shared with Genesis
 * OS for business, where an acquisition is a property deal, and it holds only
 * styles and code comments, never words a visitor reads.
 */
const GROWTH_DESK_WORDS = [
  { what: 'the word "acquisition"', pattern: /\bacquisition\b/gi },
  { what: 'the words "sales desk"', pattern: /\bsales[\s-]*desk\b/gi },
  { what: 'the word "suppression"', pattern: /\bsuppression\b/gi },
  { what: 'the word "prospect"', pattern: /\bprospects?\b/gi },
];
/** Where GROWTH_DESK_WORDS are not checked: the copied Genesis OS design system. */
const SHARED_DESIGN_SYSTEM = /^platform\/shared\/os\//;

/**
 * The only links to the rest of geai.us a public file may carry: the church
 * consultation. Every other path that starts with "/" is reported, so the
 * demo cannot quietly point at a business page or a price.
 */
export const SITE_LINKS = ["/contact?topic=ministry"];

/**
 * Every forbidden reference in a text, with a little context around each.
 * Pass the file's path inside the copy so the Growth Desk words are checked
 * where they apply; without it, every pattern is checked.
 * @param {string} text
 * @param {string} [file]
 */
export function growthDeskRefs(text, file) {
  const found = [];
  const patterns = file && SHARED_DESIGN_SYSTEM.test(file) ? FORBIDDEN : [...FORBIDDEN, ...GROWTH_DESK_WORDS];
  for (const { what, pattern } of patterns) {
    for (const match of text.matchAll(pattern)) {
      const at = match.index ?? 0;
      const line = text.slice(0, at).split("\n").length;
      const context = text.slice(Math.max(0, at - 40), at + match[0].length + 40).replace(/\s+/g, " ").trim();
      found.push({ what, match: match[0], line, context });
    }
  }
  return found;
}

/** Number of times `needle` occurs in `text`, without overlaps. */
function occurrences(text, needle) {
  return needle ? text.split(needle).length - 1 : 0;
}

/** A short, readable form of an edit's marker text for messages. */
function show(text) {
  const flat = text.replace(/\s+/g, " ").trim();
  return JSON.stringify(flat.length > 90 ? `${flat.slice(0, 87)}...` : flat);
}

/**
 * Applies a file's edits in order. Returns the new text and one report line
 * per edit. Throws, naming the file and the edit, when any edit does not find
 * its text exactly as expected.
 * @param {string} file
 * @param {string} text
 * @param {readonly Edit[]} edits
 */
export function applyEdits(file, text, edits) {
  const report = [];
  for (const edit of edits) {
    if ("find" in edit) {
      const want = edit.count ?? 1;
      const found = occurrences(text, edit.find);
      if (found !== want) {
        throw new Error(`${file}: ${edit.note}: expected ${want} of ${show(edit.find)}, found ${found}`);
      }
      text = text.split(edit.find).join(edit.replace);
      report.push(`${edit.note} (${want} ${want === 1 ? "place" : "places"})`);
    } else {
      const starts = occurrences(text, edit.from);
      if (starts !== 1) {
        throw new Error(`${file}: ${edit.note}: expected 1 of ${show(edit.from)}, found ${starts}`);
      }
      const start = text.indexOf(edit.from);
      const end = text.indexOf(edit.to, start + edit.from.length);
      if (end < 0) throw new Error(`${file}: ${edit.note}: no ${show(edit.to)} after ${show(edit.from)}`);
      const cut = text.slice(start, end);
      const lines = cut.split("\n").length - 1;
      if (lines > edit.maxLines) {
        throw new Error(`${file}: ${edit.note}: the cut would remove ${lines} lines, more than the ${edit.maxLines} expected`);
      }
      if (edit.keep && edit.keep.test(cut)) {
        throw new Error(`${file}: ${edit.note}: the cut would also remove ${show(cut.match(edit.keep)?.[0] ?? "")}`);
      }
      text = text.slice(0, start) + (edit.replace ?? "") + text.slice(end);
      report.push(`${edit.note} (${lines} ${lines === 1 ? "line" : "lines"} removed)`);
    }
  }
  return { text, report };
}

/*
 * Compare Levels used to open the Growth Desk's Levels screen. In the public
 * copy it opens the levels on the hub (platform/index.html#levels), or, from
 * the hub itself, the levels chapter of the journey.
 */
const HUB_LEVELS = "index.html#levels";
const JOURNEY_LEVELS = "journey.html#levels";

/*
 * The way to reach Genesis from the demo: the church consultation on geai.us.
 * The demo is served from geai.us/ministry-demo/, so a site path works from
 * every page. It is the one entry in SITE_LINKS.
 */
const CONTACT = SITE_LINKS[0];
const BOOK = "Book a Consultation";

/*
 * The Genesis Ministry plans, as /ministry shows them (ministryLevels in
 * lib/ministryPage.ts; tests/ministry-edition.test.ts keeps the two equal).
 * The owner replaced the draft levels with three plans and set their prices.
 * The demo source still calls them Level 01 (Welcome), Level 02 (Connect) and
 * Level 03 (Shepherd); in the public copy they are Care, Shepherd and Plus,
 * each with what that level included. Enterprise, for more than one campus,
 * stays scoped on a call. PLAN_RENAMES, below PUBLIC_EDITS, makes the change.
 */
export const MINISTRY_PLANS = [
  { level: "01", was: "Welcome", name: "Care", price: "$149" },
  { level: "02", was: "Connect", name: "Shepherd", price: "$299" },
  { level: "03", was: "Shepherd", name: "Plus", price: "$499" },
];

/** "Care at $149 a month", one per plan, in order. */
const planPrices = MINISTRY_PLANS.map((plan) => `${plan.name} at ${plan.price} a month`);

/** Hope's price answer, and the one sentence that gives every price: the words of ministryPriceAnswer on /ministry. */
export const PRICE_ANSWER = `Genesis Ministry has three plans: ${planPrices.slice(0, -1).join(", ")} and ${planPrices.at(-1)}.`;

/** @type {Readonly<Record<string, readonly Edit[]>>} */
export const PUBLIC_EDITS = {
  /* The gallery: the platform card counted the Growth Desk doors. */
  "index.html": [
    {
      note: "the platform card names the five doors that are published",
      find: "Seven doors: acquisition, the sales desk, the front office, the back office, the member app, the journey and these templates.",
      replace: "Five doors: the front office, the back office, the member app, the journey and these templates.",
    },
    {
      note: "the journey card leaves out the chapter on finding a church",
      find: '<p class="eyebrow">Five diagrams · The journey</p><h3><a href="platform/journey.html">The Journey</a></h3><p class="line">One Sunday guest end to end, finding a church through launch, who sees what,',
      replace: '<p class="eyebrow">Four diagrams · The journey</p><h3><a href="platform/journey.html">The Journey</a></h3><p class="line">One Sunday guest end to end, who sees what,',
    },
    {
      note: "Look 02 is described the way /ministry describes it",
      find: '<span class="sep" aria-hidden="true">/</span>Youth heavy, worship led churches</p>',
      replace: '<span class="sep" aria-hidden="true">/</span>Worship led churches with students and young adults</p>',
    },
    {
      note: "Look 03 is described the way /ministry describes it",
      find: '<span class="sep" aria-hidden="true">/</span>Established congregations</p>',
      replace: '<span class="sep" aria-hidden="true">/</span>Established congregations with history</p>',
    },
    { note: "the Today frame names Genesis Ministry, not an internal product name", find: "<em>Ministry OS · Today</em>", replace: "<em>Genesis Ministry · Today</em>" },
    {
      note: "the header links to the church consultation",
      find: '      <a href="platform/journey.html">The Journey</a>\n    </nav>',
      replace: `      <a href="platform/journey.html">The Journey</a>\n      <a href="${CONTACT}">Talk to Genesis</a>\n    </nav>`,
    },
    {
      note: "the phone menu links to the church consultation",
      find: '    <a href="platform/journey.html">The Journey <span aria-hidden="true">&#8599;</span></a>\n',
      replace: `    <a href="platform/journey.html">The Journey <span aria-hidden="true">&#8599;</span></a>\n    <a href="${CONTACT}">${BOOK} <span aria-hidden="true">&#8599;</span></a>\n`,
    },
    {
      note: "the closing band offers the church consultation",
      find: '<a class="btn btn-secondary" href="platform/index.html"><span>Open the Front Door</span></a>',
      replace: `<a class="btn btn-secondary" href="platform/index.html"><span>Open the Front Door</span></a>\n        <a class="btn btn-secondary" href="${CONTACT}"><span>${BOOK}</span></a>`,
    },
    {
      note: "the footer links to the church consultation",
      find: '      <a href="platform/index.html#levels">Levels</a>\n    </nav>',
      replace: `      <a href="platform/index.html#levels">Levels</a>\n      <a href="${CONTACT}">${BOOK}</a>\n    </nav>`,
    },
  ],

  /* The hub, the front door of the platform. */
  "platform/index.html": [
    {
      note: "the page description leaves out the acquisition arm and the sales desk",
      find: "Edition 05 of Genesis OS for churches: the acquisition arm, the sales desk, the front office, the back office and the member app, with draft levels and the rules that protect people.",
      replace: "Edition 05 of Genesis OS for churches: the website, the front office, the back office and the member app, with three plans and the rules that protect people.",
    },
    {
      note: 'removed "Or start where Genesis finds a church" under the hero buttons',
      from: '        <p class="hero-alt"><a class="text-link" data-carry href="sales-find.html',
      to: "      </div>\n\n      <div class=\"tenant\">",
      maxLines: 2,
      keep: /church-|member-|journey\.html/,
    },
    { note: "the doors heading counts five doors", find: '<p class="eyebrow">Seven doors</p>', replace: '<p class="eyebrow">Five doors</p>' },
    {
      note: "removed the For Genesis doors (Acquisition and the Sales Desk)",
      from: '      <div class="door-group">\n        <p class="group-label"><span class="eyebrow">For Genesis</span>',
      to: '      <div class="door-group">\n        <p class="group-label"><span class="eyebrow">For each church</span>',
      maxLines: 44,
      keep: /church-|member-|journey\.html/,
    },
    { note: "renumbered the Front Office door", find: "Door 03 · Front office", replace: "Door 01 · Front office" },
    { note: "renumbered the Back Office door", find: "Door 04 · Back office", replace: "Door 02 · Back office" },
    { note: "renumbered the Member App door", find: "Door 05 · Member app", replace: "Door 03 · Member app" },
    { note: "renumbered the Journey door", find: "Door 06 · The journey", replace: "Door 04 · The journey" },
    { note: "renumbered the Templates door", find: "Door 07 · The templates", replace: "Door 05 · The templates" },
    {
      note: "removed rule 10, the Growth Desk rule that linked to its suppression list",
      from: '        <li><span class="n" aria-hidden="true">10</span><div><h3>Genesis finds churches the right way.',
      to: "      </ol>",
      maxLines: 2,
      keep: /church-|member-/,
    },
    {
      note: "Compare Levels opens the levels chapter of the journey",
      find: 'data-carry href="sales-levels.html">Compare Levels',
      replace: `data-carry href="${JOURNEY_LEVELS}">Compare Levels`,
      count: 2,
    },
    {
      note: 'removed "Start on the Growth Desk" from the closing band',
      from: '      <p class="foot">Showing this to the Genesis team? <a class="text-link" data-carry href="sales-find.html',
      to: '      <p class="foot">Genesis is software.',
      maxLines: 2,
      keep: /church-|member-/,
    },
    {
      note: "the hero eyebrow names Genesis AI instead of Genesis OS",
      find: '<p class="eyebrow">Genesis OS<span class="sep" aria-hidden="true">/</span>For churches</p>',
      replace: '<p class="eyebrow">Genesis AI<span class="sep" aria-hidden="true">/</span>For churches</p>',
    },
    {
      note: "the church doors are introduced in church words, without tenant",
      find: "<span>The platform, in Genesis OS, with the church as the tenant</span>",
      replace: "<span>The platform each church runs on, with sample data</span>",
    },
    { note: "the screen frames name Genesis Ministry, not an internal product name", find: "<em>Ministry OS · ", replace: "<em>Genesis Ministry · ", count: 3 },
    { note: "the journey door counts four diagrams", find: '<span class="badge">Five diagrams</span>', replace: '<span class="badge">Four diagrams</span>' },
    {
      note: "the journey door leaves out the chapter on finding a church",
      find: "Five pictures of how it works: one Sunday guest end to end, finding a church through launch, who sees what,",
      replace: "Four pictures of how it works: one Sunday guest end to end, who sees what,",
    },
    {
      note: "removed the journey door's Finding to Launch chip",
      find: '                <li><a class="chip-link" href="journey.html#launch">Finding to Launch</a></li>\n',
      replace: "",
    },
    {
      note: "the header links to the church consultation",
      find: '      <a href="../index.html">The Templates</a>\n    </nav>',
      replace: `      <a href="../index.html">The Templates</a>\n      <a href="${CONTACT}">Talk to Genesis</a>\n    </nav>`,
    },
    {
      note: "the phone menu links to the church consultation",
      find: '    <a href="../index.html">The Templates <span aria-hidden="true">&#8599;</span></a>\n',
      replace: `    <a href="../index.html">The Templates <span aria-hidden="true">&#8599;</span></a>\n    <a href="${CONTACT}">${BOOK} <span aria-hidden="true">&#8599;</span></a>\n`,
    },
    {
      note: "the levels offer the church consultation beside Compare Levels",
      find: `<a class="text-link" data-carry href="${JOURNEY_LEVELS}">Compare Levels <span aria-hidden="true">&#8599;</span></a>`,
      replace: `<a class="text-link" data-carry href="${JOURNEY_LEVELS}">Compare Levels <span aria-hidden="true">&#8599;</span></a>\n        <a class="text-link" href="${CONTACT}">${BOOK} <span aria-hidden="true">&#8599;</span></a>`,
    },
    {
      note: "the closing band offers the church consultation",
      find: '<span>See the Journey</span></a>\n      </div>\n      <p class="foot">Genesis is software.',
      replace: `<span>See the Journey</span></a>\n        <a class="btn btn-secondary" href="${CONTACT}"><span>${BOOK}</span></a>\n      </div>\n      <p class="foot">Genesis is software.`,
    },
    {
      note: "the footer links to the church consultation",
      find: `      <a data-carry href="${JOURNEY_LEVELS}">Compare Levels</a>\n    </nav>`,
      replace: `      <a data-carry href="${JOURNEY_LEVELS}">Compare Levels</a>\n      <a href="${CONTACT}">${BOOK}</a>\n    </nav>`,
    },
  ],

  /* The journey. Its second chapter told how Genesis finds a church, by the
     names of the Growth Desk's two parts, so it goes, and the four chapters
     left are renumbered. The church view of the same path, from the first
     conversation to launch, is on /ministry under How It Runs. */
  "platform/journey.html": [
    {
      note: "removed chapter two, how Genesis finds a church, with its diagram, its list and its links into the Growth Desk",
      from: '  <section class="sheet rise s-ink" id="launch" aria-labelledby="launch-title">',
      to: '  <section class="sheet rise s-paper" id="privacy" aria-labelledby="privacy-title">',
      maxLines: 36,
      keep: /id="(guest|privacy|ai|levels)"|church-|member-/,
    },
    {
      note: "the page description counts four diagrams",
      find: "Five diagrams of Genesis Ministry: one Sunday guest end to end, finding a church through launch, who sees what,",
      replace: "Four diagrams of Genesis Ministry: one Sunday guest end to end, who sees what,",
    },
    { note: "the lede counts four pictures", find: "Five pictures of the whole thing.", replace: "Four pictures of the whole thing." },
    { note: "removed Finding to Launch from the header", find: '      <a href="#launch">Finding to Launch</a>\n', replace: "" },
    { note: "removed Finding to Launch from the phone menu", find: '    <a href="#launch">Finding to Launch <span aria-hidden="true">&#8599;</span></a>\n', replace: "" },
    {
      note: "removed chapter two from the chapter index",
      find: '        <a href="#launch"><span class="num">02</span><b>Finding to launch</b><span>How Genesis finds a church and brings it live.</span></a>\n',
      replace: "",
    },
    { note: "renumbered Who Sees What in the index", find: '<a href="#privacy"><span class="num">03</span>', replace: '<a href="#privacy"><span class="num">02</span>' },
    { note: "renumbered What the AI Does in the index", find: '<a href="#ai"><span class="num">04</span>', replace: '<a href="#ai"><span class="num">03</span>' },
    { note: "renumbered What Each Level Adds in the index", find: '<a href="#levels"><span class="num">05</span>', replace: '<a href="#levels"><span class="num">04</span>' },
    { note: "renumbered the Who Sees What chapter", find: "Chapter three. Who sees what", replace: "Chapter two. Who sees what" },
    { note: "renumbered the What Hope Does chapter", find: '<p class="eyebrow">Chapter four. What ', replace: '<p class="eyebrow">Chapter three. What ' },
    { note: "renumbered the What Each Level Adds chapter", find: "Chapter five. What each level adds", replace: "Chapter four. What each level adds" },
    {
      note: "the chapter index has four columns",
      find: ".chapters { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));",
      replace: ".chapters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));",
    },
    {
      note: "on tablets the four chapters sit two by two",
      find: "@media (max-width: 1023px) { .chapters { grid-template-columns: repeat(2, minmax(0, 1fr)); } .chapters a:last-child { grid-column: 1 / -1; } }",
      replace: "@media (max-width: 1023px) { .chapters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }",
    },
    /* The chapters keep alternating dark and light once chapter two is gone. */
    { note: "Who Sees What turns dark", find: '<section class="sheet rise s-paper" id="privacy"', replace: '<section class="sheet rise s-ink" id="privacy"' },
    { note: "What Hope Does turns light", find: '<section class="sheet rise s-ink" id="ai"', replace: '<section class="sheet rise s-paper" id="ai"' },
    { note: "What Each Level Adds turns dark", find: '<section class="sheet rise s-paper" id="levels"', replace: '<section class="sheet rise s-ink" id="levels"' },
    { note: "the closing band turns light", find: '<section class="sheet rise s-ink close-band"', replace: '<section class="sheet rise s-paper close-band"' },
    /* Team roles come with Connect (the hub, the Team screen, /ministry); what
       Shepherd adds is custom roles. The levels diagram's Shepherd row says so. */
    { note: "the levels diagram's Shepherd row reads Custom roles, as the hub does", find: '<tspan x="24" dy="0">Team roles</tspan>', replace: '<tspan x="24" dy="0">Custom roles</tspan>' },
    { note: "the levels list gives Shepherd custom roles", find: "reports, team roles, more staff seats.", replace: "reports, custom roles, more staff seats." },
    {
      note: "the closing band offers the church consultation",
      find: '<span>Back to the Front Door</span></a>\n      </div>\n      <p class="foot">',
      replace: `<span>Back to the Front Door</span></a>\n        <a class="btn btn-secondary" href="${CONTACT}"><span>${BOOK}</span></a>\n      </div>\n      <p class="foot">`,
    },
    {
      note: "removed the Outreach Drafts link from the What the AI Does chapter",
      find: '        <a class="chip-link" data-carry href="sales-outreach.html">Outreach Drafts <span class="arrow" aria-hidden="true">&#8599;</span></a>\n',
      replace: "",
    },
    {
      note: "Compare Levels opens the levels on the hub",
      find: 'data-carry href="sales-levels.html">Compare Levels',
      replace: `data-carry href="${HUB_LEVELS}">Compare Levels`,
      count: 2,
    },
    {
      note: "the header links to the church consultation",
      find: '      <a href="#levels">Levels</a>\n    </nav>',
      replace: `      <a href="#levels">Levels</a>\n      <a href="${CONTACT}">Talk to Genesis</a>\n    </nav>`,
    },
    {
      note: "the phone menu links to the church consultation",
      find: '    <a href="#levels">What Each Level Adds <span aria-hidden="true">&#8599;</span></a>\n',
      replace: `    <a href="#levels">What Each Level Adds <span aria-hidden="true">&#8599;</span></a>\n    <a href="${CONTACT}">${BOOK} <span aria-hidden="true">&#8599;</span></a>\n`,
    },
    {
      note: "the footer links to the church consultation",
      find: `      <a data-carry href="${HUB_LEVELS}">Compare Levels</a>\n    </nav>`,
      replace: `      <a data-carry href="${HUB_LEVELS}">Compare Levels</a>\n      <a href="${CONTACT}">${BOOK}</a>\n    </nav>`,
    },
  ],

  /* The member stage bar on a phone. The level switcher now shows plan names
     (Care, Shepherd, Plus; see PLAN_RENAMES) where it showed 01, 02 and 03,
     so its buttons are set closer to keep the bar on one row at 390 wide. The
     member pages pad them in their own style block, hence body.mx-staged. */
  "platform/shared/member.css": [
    {
      note: "on a phone the plan switcher's buttons sit closer, so Care, Shepherd and Plus fit the stage bar's one row",
      find: "  .m-stagebar .gm-preview-label{min-height:26px;font-size:11.5px;padding:2px 10px}\n}",
      replace:
        "  .m-stagebar .gm-preview-label{min-height:26px;font-size:11.5px;padding:2px 10px}\n" +
        "  .m-stagebar .gm-plan a,body.mx-staged .m-stagebar .gm-plan a{padding:4px;font-size:11.5px}\n}",
    },
  ],

  /* The story pages' stylesheet (the hub, the journey and the gallery). */
  "platform/story/story.css": [
    {
      note: "in the light theme the Genesis mark is drawn in ink and deep gold, so its white half shows on ivory",
      find: ".brand img { width: 37px; height: 37px; object-fit: contain; }",
      replace:
        ".brand img { width: 37px; height: 37px; object-fit: contain; }\n" +
        '/* Light theme: the white half of the mark would vanish on ivory. Inverting the lightness keeps the hue, so the mark reads in ink and deep gold. */\n:root[data-theme="light"] .brand img { filter: invert(1) hue-rotate(180deg); }',
    },
  ],

  /* The sample data every platform page loads. The church screens read the
     churches, people, guests, care, levels and the four sample accounts. The
     Growth Desk's own data (its prospects, outreach, suppression list,
     pipeline, monthly funnel and outreach drafts) is cut, so it cannot be
     read in the page source either. */
  "platform/shared/data.js": [
    {
      note: "removed the Growth Desk's prospects, website checks, outreach and suppression list",
      from: "  /* ------------------------------------------------------------------ acquisition */\n",
      to: "  /* ------------------------------------------------------------------ sales */",
      maxLines: 170,
      keep: /D\.(churches|levels|modules|staff|people|guests|prayer|threads|access|gifts|teams|metrics|drafts|summaries|howItRuns|genesisTeam) =/,
    },
    {
      note: "the sample accounts keep only the four demo churches; removed the pipeline, onboarding, monthly funnel and lead sources",
      from: '      { id: "a-riverglass"',
      to: "\n  };\n\n  /* Genesis drafts on the Genesis side (outreach and sales follow-ups). */",
      maxLines: 60,
      keep: /stages: \[|afterStages|D\.(churches|levels|modules|people|guests) =/,
      replace: "    ]",
    },
    {
      note: "removed the Growth Desk's outreach drafts and weekly summary",
      from: "  /* Genesis drafts on the Genesis side (outreach and sales follow-ups). */",
      to: "  window.GM_DATA = D;",
      maxLines: 10,
      keep: /D\.(churches|levels|modules|people|guests|drafts|summaries) =/,
      replace: "  /* The Genesis side has no drafts or summaries in the public preview. */\n  D.genesisDrafts = [];\n  D.genesisSummaries = [];\n\n",
    },
    { note: "the Genesis team roles use church words", find: 'role: "Sales Lead"', replace: 'role: "Church Partnerships"' },
    { note: "the Genesis team roles use church words", find: 'role: "Acquisition Seat"', replace: 'role: "Church Support"' },
    {
      note: "Goldenrod Commons Church is Goldenrod for short, so no screen reads Goldenrod Commons's",
      find: 'short: "Goldenrod Commons"',
      replace: 'short: "Goldenrod"',
    },
  ],

  /* Hope on the four sample church sites, the story pages and the member screens. */
  "shared/hope-demo.js": [
    {
      note: "the customization answer no longer starts with Yes, which read as a reply to a price question",
      find: 'custom: { t: "Yes. Every template is filled',
      replace: 'custom: { t: "Every template is filled',
    },
    {
      note: "a price question gets the price answer, the three plans and their prices, with a way to book the consultation",
      find: '    hope: { t: "On your live site, "',
      replace:
        `    price: { t: "${PRICE_ANSWER}", c: [{ label: "${BOOK}", href: "${CONTACT}", go: true, cta: true }, { label: "What do we get?", key: "package" }] },\n` +
        '    hope: { t: "On your live site, "',
    },
    {
      note: "prices, cost and how much go to the price answer; customization questions keep their own",
      find: '    [/\\b(prices?|costs?|pricing|custom\\w*|change|edit|colou?rs?|logos?|fonts?)\\b/i, "custom"],',
      replace:
        '    [/\\b(prices?|pricing|costs?|fees?)\\b|\\bhow much (does|is|will|would) (it|this|genesis|the (template|website|site|platform))\\b/i, "price"],\n' +
        '    [/\\b(custom\\w*|change|edit|colou?rs?|logos?|fonts?)\\b/i, "custom"],',
    },
    {
      note: "the last card of the guided demo can carry a second link (endLink), styled like the first",
      find: ".hd-next{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;margin-top:12px;text-decoration:none;text-align:center;line-height:1.2}",
      replace:
        ".hd-next,.hd-end{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;margin-top:12px;text-decoration:none;text-align:center;line-height:1.2}.hd-end{margin-top:8px}",
    },
    {
      note: "the last card in the church's colors shows endLink under the next link",
      find: '      card.appendChild(a);\n    } else nx.setAttribute("data-hd-focus", "");',
      replace:
        '      card.appendChild(a);\n' +
        '      if (CFG.endLink) { var ea = el("a", "hd-btn ghost hd-end"); ea.href = CFG.endLink.href; ea.textContent = CFG.endLink.label; card.appendChild(ea); }\n' +
        '    } else nx.setAttribute("data-hd-focus", "");',
    },
    {
      note: "the last card in the Genesis look shows endLink beside the next link",
      find: `(last && nh ? '<div class="v2-guide-controls"><a class="v2-button v2-button-primary hd-g-next" data-hd-focus></a></div>' : "")`,
      replace: `(last && nh ? '<div class="v2-guide-controls"><a class="v2-button v2-button-primary hd-g-next" data-hd-focus></a>' + (CFG.endLink ? '<a class="v2-button hd-g-end"></a>' : "") + "</div>" : "")`,
    },
    {
      note: "the Genesis last card fills in endLink",
      find: '    if (last && nh) { var a = card.querySelector(".hd-g-next"); a.href = nh; a.textContent = NEXT.label || "Continue the Demo"; a.insertAdjacentHTML("beforeend", ICON_ARROW); }\n',
      replace:
        '    if (last && nh) { var a = card.querySelector(".hd-g-next"); a.href = nh; a.textContent = NEXT.label || "Continue the Demo"; a.insertAdjacentHTML("beforeend", ICON_ARROW); }\n' +
        '    var ea = card.querySelector(".hd-g-end"); if (ea) { ea.href = CFG.endLink.href; ea.textContent = CFG.endLink.label; }\n',
    },
  ],

  /* The website package screen: its Level 01 prayer note. */
  "platform/church-website.html": [
    {
      note: "Compare Levels opens the levels on the hub",
      find: 'href="sales-levels.html">Compare Levels</a>',
      replace: `href="${HUB_LEVELS}">Compare Levels</a>`,
    },
  ],

  /* The shell every workspace and member screen runs on. */
  "platform/shared/app.js": [
    {
      note: "Compare Levels on the locked card and the member locked screen opens the levels on the hub",
      find: 'href="sales-levels.html">Compare Levels</a>',
      replace: `href="${HUB_LEVELS}">Compare Levels</a>`,
      count: 2,
    },
    {
      note: "removed Genesis Growth Desk from the account menu and Jump To",
      find: '        { key: "desk", label: "Genesis Growth Desk", href: "sales-pipeline.html", icon: "accounts", hint: "How Genesis finds and serves churches" },\n',
      replace: "",
    },
    {
      note: "Compare Levels in the account menu and Jump To opens the levels on the hub",
      find: '{ key: "levels", label: "Compare Levels", href: "sales-levels.html", icon: "levels"',
      replace: `{ key: "levels", label: "Compare Levels", href: "${HUB_LEVELS}", icon: "levels"`,
    },
    {
      note: "removed the Growth Desk workspace from the navigation model",
      from: '    genesis: {\n      label: "Growth desk", brand: "Growth Desk", home: "sales-find.html",',
      to: "    member: [\n",
      maxLines: 36,
      keep: /church-today\.html", icon: "today"|label: "Church workspace"/,
    },
    {
      note: "the switcher no longer names the Growth Desk",
      find: 'var meta = side === "genesis" ? "Growth Desk" :',
      replace: 'var meta = side === "genesis" ? "Genesis" :',
    },
    {
      note: "the Add a Church drawer no longer names the Growth Desk",
      find: 'eyebrow = "Growth desk"; title = "Add a church";',
      replace: 'eyebrow = "Genesis"; title = "Add a church";',
    },
    {
      note: "removed the Growth Desk briefing and its links to Find, Outreach and the Pipeline",
      from: '    if (GM.side === "genesis") {\n      var ready = D.acquisition.prospects',
      to: '    if (!GM.isIncluded("genesis")) {',
      maxLines: 10,
      keep: /church-/,
    },
    {
      note: "Compare Levels in the Level 01 briefing opens the levels on the hub",
      find: '{ label: "Compare Levels", href: "sales-levels.html" }',
      replace: `{ label: "Compare Levels", href: "${HUB_LEVELS}" }`,
    },
    {
      note: "the page title no longer names the Growth Desk",
      find: '(GM.side === "genesis" ? "Genesis Growth Desk" :',
      replace: '(GM.side === "genesis" ? "Genesis" :',
    },
    /* The Genesis side's own code, which only the Growth Desk ran, read the
       data cut from data.js. It goes with it. */
    { note: "removed the prospect lookup, whose data is cut", find: "  GM.prospect = function (id) { return byId(D.acquisition.prospects, id); };\n", replace: "" },
    {
      note: "removed the prospects icon, which only the Growth Desk menu used",
      find: `    prospects: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',\n`,
      replace: "",
    },
    {
      note: "a draft is addressed to a person in the church only",
      find: "var to = GM.who(d.to) || (d.prospect ? { name: GM.prospect(d.prospect).name } : null);",
      replace: "var to = GM.who(d.to);",
    },
    {
      note: "removed the Genesis side's answers about prospects, deals and outreach",
      from: "  function genesisAnswers() {\n    return [\n",
      to: "  /* extraAnswers: a page's own (checked first).",
      maxLines: 22,
      keep: /function churchAnswers|baseAnswers =|function pickAnswer/,
      replace: "  function genesisAnswers() { return []; }\n",
    },
    {
      note: "the Genesis side's fallback answer no longer offers prospects or outreach",
      find: "\"I can help with this week's summary, which prospects to work first, where each church account stands and the outreach drafts waiting. In this preview I answer from the sample data.\"",
      replace: '"In this preview I answer from the sample data."',
    },
    {
      note: "removed the outreach note from the Add a Church drawer",
      find: " +\n        '<p class=\"gm-drawer-note\">Public church contact details only. Outreach is email only, every email waits for approval and carries an unsubscribe line.</p>';",
      replace: ";",
    },
    {
      note: "the account menu and Jump To offer the church consultation",
      find: `{ key: "levels", label: "Compare Levels", href: "${HUB_LEVELS}", icon: "levels", hint: "Welcome, Connect, Shepherd, Enterprise" }\n`,
      replace:
        `{ key: "levels", label: "Compare Levels", href: "${HUB_LEVELS}", icon: "levels", hint: "Welcome, Connect, Shepherd, Enterprise" },\n` +
        `        { key: "consult", label: "${BOOK}", href: "${CONTACT}", icon: "call", hint: "A free conversation with Genesis about your church" }\n`,
    },
  ],

  /* The guided demo: tours, the demo path and the scripted answers. */
  "platform/shared/demo.js": [
    {
      note: "the header comment names only the church workspace",
      find: "   - Genesis screens (the church workspace and the Growth Desk) use the real Genesis OS guide",
      replace: "   - Genesis screens (the church workspace) use the real Genesis OS guide",
    },
    {
      note: "the demo path comment starts at the church workspace",
      find: "  /* Finding a church, selling and serving it, the church workspace, the member app, then back. */",
      replace: "  /* The church workspace, the member app, then back. */",
    },
    {
      note: "the demo path starts at Today: removed Find, One Prospect, the Website Check and the Proposal",
      from: '    { key: "sales-find", label: "Find This Week" },\n',
      to: '    { key: "church-today", label: "The Church Workspace" },',
      maxLines: 5,
      keep: /church-|member-/,
    },
    {
      note: "the demo path ends at the overview: removed Onboarding and the Levels screen",
      find: '    { key: "sales-onboarding", label: "What Happens After You Sign" },\n    { key: "sales-levels", label: "The Levels" },\n',
      replace: "",
    },
    {
      note: "removed the run origin, which only told a run that started on Find from one that started on Today",
      from: "  /* Where this run of the demo started, so the last card can say the right thing.",
      to: "  /* Screens off the main path continue to a sensible next screen, then rejoin it. */",
      maxLines: 9,
      keep: /church-|member-/,
    },
    {
      note: "removed the off path stops on the Growth Desk",
      find: '    "sales-outreach": "sales-website-check",\n    "sales-reports": "sales-acquisition-report",\n    "sales-acquisition-report": "sales-pipeline",\n    "sales-pipeline": "sales-account",\n',
      replace: "",
    },
    { note: "removed the Growth Desk settings stop", find: '    "sales-settings": "sales-find",\n', replace: "" },
    {
      note: "removed the labels of the Growth Desk stops",
      find: '    "sales-settings": { label: "Growth Desk Settings" },\n    "sales-website-check": { label: "The Website Check" },\n    "sales-acquisition-report": { label: "The Acquisition Report" },\n    "sales-pipeline": { label: "The Pipeline" },\n    "sales-account": { label: "The Proposal" },\n',
      replace: "",
    },
    {
      note: 'when the rest of the path is locked, the note says the demo ends here, not "goes on to Back to the Overview"',
      find: '", so at " + GM.level().code + " the demo goes on to " + to.label + ". Switch the level to see them."',
      replace: '", so at " + GM.level().code + (to.key === "index" ? " the demo ends here" : " the demo goes on to " + to.label) + ". Switch the level to see them."',
    },
    {
      note: "a run that falls off the path rejoins it at the overview instead of Onboarding",
      find: '      if (!hop) hop = walk(pathIndex("sales-onboarding"));',
      replace: '      if (!hop) hop = walk(pathIndex("index"));',
    },
    {
      note: "only church and member links carry the church and the level",
      find: "if (/^church-|^member-|^sales-/.test(href)) href = GM.url(href);",
      replace: "if (/^church-|^member-/.test(href)) href = GM.url(href);",
    },
    {
      note: "removed the tours of the Growth Desk screens",
      from: "    /* ---------------- Growth Desk: finding churches ---------------- */\n",
      to: "    /* ---------------- The church workspace ---------------- */",
      maxLines: 96,
      keep: /"(church|member)-[a-z-]+":/,
    },
    {
      note: "removed the tour of the Growth Desk settings",
      from: '    "sales-settings": { title: "Growth Desk settings",',
      to: '    "church-guests": function () {',
      maxLines: 7,
      keep: /"(church|member)-[a-z-]+":/,
    },
    {
      note: 'the last card no longer offers "See How Genesis Finds Churches"; at the end of the demo it offers the church consultation',
      find: 'links: KEY === "sales-levels" && ORIGIN !== "desk" ? [{ label: "See How Genesis Finds Churches", href: GM.url("sales-find.html", { tour: "1" }) }] : [] },',
      replace: "links: endOfDemo(nx) ? [CONTACT_LINK] : [] },\n      endLink: endOfDemo(nx) ? CONTACT_LINK : null,",
    },
    {
      note: "no screen invites a tour on its own, as Find did",
      find: 'autoInvite: FILE === "sales-find",',
      replace: "autoInvite: false,",
    },
    {
      note: "the invite describes the demo from Today",
      find: 'caption: "A few short steps on each screen, from finding a church to the member app and back.',
      replace: 'caption: "A few short steps on each screen, from Today to the member app and back.',
    },
    {
      note: "the hub tour describes the doors that are published",
      find: 'p: "From how Genesis finds a church to what members see on their phones. Each screen opens with sample data and its own short tour."',
      replace: 'p: "From the front office to what members see on their phones, then the journey and the four looks. Each screen opens with sample data and its own short tour."',
    },
    {
      note: "removed the Demo This Level hook of the Levels and Proposal screens",
      from: '  if (FILE === "sales-levels" || FILE === "sales-account") {',
      to: "  function init() {",
      maxLines: 6,
      keep: /church-(?!today)|member-/,
    },
    {
      note: "the church consultation link, the chip that opens it and the test for the end of the demo",
      find: '  var GUIDE = "Genesis";\n',
      replace:
        '  var GUIDE = "Genesis";\n' +
        "  /* The church consultation on geai.us: on the last card of the guided demo, and from Hope. */\n" +
        `  var CONTACT = "${CONTACT}";\n` +
        `  var CONTACT_LINK = { label: "${BOOK}", href: CONTACT };\n` +
        `  var CONTACT_CHIP = { label: "${BOOK}", href: CONTACT, go: true, cta: true };\n` +
        "  /* The guided demo ends when the next stop is the overview, the one stop with no tour. */\n" +
        "  function endOfDemo(nx) { return !!(nx && nx.tour === false); }\n",
    },
    {
      note: "Hope's levels answer puts team roles in Connect, as the hub and the Team screen do",
      find: '"Level 02, Connect: everything in Welcome, plus Today, the guest pipeline, the member app, the care inbox and drafts that wait for approval. " +',
      replace: '"Level 02, Connect: everything in Welcome, plus Today, the guest pipeline, the member app, the care inbox, team roles with the prayer team named, and drafts that wait for approval. " +',
    },
    {
      note: "Hope's levels answer gives Shepherd custom roles and named gift viewers",
      find: "the spiritual gifts picture, reports, team roles and more staff seats. ",
      replace: "the spiritual gifts picture, reports, custom roles, named gift viewers and more staff seats. ",
    },
    {
      note: "the texting answer no longer mentions churches Genesis reaches out to",
      find: 'texting: "Texting is off. Guest follow-up goes by email unless the church turns texting on, and Genesis never texts a church it is reaching out to.",',
      replace: 'texting: "Texting is off. Guest follow-up goes by email unless the church turns texting on.",',
    },
    {
      note: "the outreach answer, which described how Genesis finds churches, becomes the consultation answer",
      from: '    outreach: "From public information only:',
      to: "\n    price: ",
      maxLines: 1,
      keep: /\n    (levels|custom|texting): /,
      replace:
        '    contact: "A person at Genesis would be glad to talk with you. Book a consultation: a free conversation about your church, with no obligation.",',
    },
    {
      note: "questions about reaching Genesis get the consultation answer instead of the outreach rules",
      from: String.raw`    [/how (do|does|will) (you|genesis|we) (find|contact|reach|choose|pick)|`,
      to: String.raw`    [/\b(prices?|pricing|costs?|how much|fees?|dollars?|afford|budget)\b|\$/i, "price"],`,
      maxLines: 1,
      keep: /"(price|custom|levels|texting)"\]/,
      replace: String.raw`    [/\b(talk|speak) (to|with) (someone|somebody|a person|a human|genesis)|\b(contact|reach|call|email) (genesis|you|someone|a person)\b|\bbook (a |the )?(call|consultation|meeting)\b|\bconsultation\b|\bget started\b/i, "contact"],` + "\n",
    },
    {
      note: "member Hope answers the consultation question with a way to book it",
      find: '        outreach: a(ANSWERS.outreach, [{ label: "What Is Genesis Ministry?", key: "platform" }]),',
      replace: '        contact: a(ANSWERS.contact, [CONTACT_CHIP, { label: "What Is Genesis Ministry?", key: "platform" }]),',
    },
    {
      note: "member Hope's price answer offers the consultation",
      find: '        price: a(ANSWERS.price, [{ label: "What Does Each Level Include?", key: "levels" }, { label: "Can We Customize It?", key: "custom" }]),',
      replace: '        price: a(ANSWERS.price, [CONTACT_CHIP, { label: "What Does Each Level Include?", key: "levels" }, { label: "Can We Customize It?", key: "custom" }]),',
    },
    {
      note: "at the end of the demo, member Hope's last card and its finale offer the consultation",
      find: '      finale: { text: tour ? fill(tour.done) : "", chips: [{ label: "Take the Tour Again", key: "tour" }].concat(chipsAbout.slice(0, 2)) },',
      replace:
        '      finale: { text: tour ? fill(tour.done) : "", chips: [{ label: "Take the Tour Again", key: "tour" }].concat(chipsAbout.slice(0, 2), endOfDemo(nx) ? [CONTACT_CHIP] : []) },\n' +
        "      endLink: endOfDemo(nx) ? CONTACT_LINK : null,",
    },
    {
      note: 'the story pages\' Hope offers "Book a Consultation" instead of "How Does Genesis Find Churches?"',
      find: '        { label: "How Does Genesis Find Churches?", key: "outreach" },',
      replace: `        { label: "${BOOK}", href: CONTACT, go: true },`,
    },
    {
      note: "the story pages' Hope answers the consultation question with a way to book it",
      find: "        outreach: a(ANSWERS.outreach, more),",
      replace: "        contact: a(ANSWERS.contact, [CONTACT_CHIP].concat(more)),",
    },
    {
      note: "the story pages' price answer offers the consultation",
      find: '        price: a(ANSWERS.price, [{ label: "What Does Each Level Include?", key: "levels" }])\n',
      replace: '        price: a(ANSWERS.price, [CONTACT_CHIP, { label: "What Does Each Level Include?", key: "levels" }])\n',
    },
    {
      note: "the journey tour counts four chapters",
      find: `h: "Five chapters", p: "A guest's path, how Genesis finds and launches a church, privacy, what the AI does, and the levels." },`,
      replace: `h: "Four chapters", p: "A guest's path, privacy, what the AI does, and the levels." },`,
    },
    {
      note: "removed the journey tour's step on how Genesis finds a church",
      from: '        { sel: "#launch", h: "How Genesis finds a church",',
      to: '        { sel: "#privacy",',
      maxLines: 1,
      keep: /#(guest|privacy|ai|levels)"/,
    },
    {
      note: "each card of the guided demo says which screen of how many it is",
      find: "  /* ------------------------------------------------------------------ shared targets */\n",
      replace:
        '  /* Where this screen sits on the guided demo path at this level, for the card\'s eyebrow:\n' +
        '     "Screen 3 of 12 · ". Empty for a screen off the path. */\n' +
        "  function screenOf() {\n" +
        '    var stops = PATH.filter(function (e) { return e.key !== "index" && open(e); });\n' +
        '    for (var i = 0; i < stops.length; i++) if (stops[i].key === KEY) return "Screen " + (i + 1) + " of " + stops.length + " · ";\n' +
        '    return "";\n' +
        "  }\n\n" +
        "  /* ------------------------------------------------------------------ shared targets */\n",
    },
    {
      note: "the Genesis look's cards carry the screen count in their eyebrow",
      find: '      tourTitle: tour ? fill(tour.title) : "",',
      replace: '      tourTitle: tour ? screenOf() + fill(tour.title) : "",',
      count: 2,
    },
    {
      note: "the member cards carry the screen count in their eyebrow",
      find: 'k: MEMBER ? AN + " · " + fill(t.title) : undefined',
      replace: 'k: MEMBER ? AN + " · " + screenOf() + fill(t.title) : undefined',
    },
  ],
};

/* ── the three plans ───────────────────────────────────────────────── */

/**
 * The copied files that name the levels: the gallery, Hope on the sample
 * sites, and the platform pages and scripts, but not the copied Genesis OS
 * design system (platform/shared/os/), which never names them. The church
 * sites under templates/ are left alone: their "Connect" and "Welcome" are a
 * church's own words.
 */
export const PLAN_FILES = /^(?:index\.html|shared\/hope-demo\.js|platform\/(?!shared\/os\/)[a-z0-9/-]+\.(?:html|js))$/;

/**
 * The source's first draft level, in platform/shared/data.js. The renames
 * assume the source still names the draft levels; once it names the plans
 * itself they would rename its new names again, so the sync stops when this
 * is missing.
 */
export const PLAN_SOURCE_MARK = /code: "Level 01", name: "Welcome"/;

/** The plan behind an old level number ("01") or an old level name ("Connect"). */
const planFor = (key) => {
  const plan = MINISTRY_PLANS.find((p) => p.level === key || p.was === key);
  if (!plan) throw new Error(`no plan for ${key}`);
  return plan;
};
const OLD_NAME = "(Welcome|Connect|Shepherd)";

/**
 * A rename: every match of `pattern` (a global RegExp) becomes what `replace`
 * returns for it, in the files `files` matches (every PLAN_FILES file when not
 * given). Rules run in order, and a later rule never sees what an earlier
 * rule wrote, so "Connect" can become "Shepherd" while the old "Shepherd"
 * becomes "Plus", in any order in the text.
 * @typedef {{ note: string, pattern: RegExp, replace: (...match: string[]) => string, files?: RegExp }} Rename
 */

const HUB = /^platform\/index\.html$/;
const JOURNEY = /^platform\/journey\.html$/;

/** @type {readonly Rename[]} */
export const PLAN_RENAMES = [
  /* Prices first: where the demo said "Pricing set with Genesis", it now gives the price. */
  {
    note: "a price answer that said pricing is set with Genesis gives the three plans and their prices",
    pattern: /(price: (?:\{ t: )?")Pricing is set with Genesis[^"]*"/g,
    replace: (_, lead) => `${lead}${PRICE_ANSWER}"`,
  },
  {
    note: "D.pricingLine, shown where a price would sit, is the sentence with every price",
    pattern: /D\.pricingLine = "Pricing set with Genesis";/g,
    replace: () => `D.pricingLine = "${PRICE_ANSWER}";`,
  },
  {
    note: "the lines that end with D.pricingLine drop the draft note and the second full stop",
    pattern: /(?:Levels are a draft\. )?(" \+ (?:esc\()?D\.pricingLine\)?) \+ "\./g,
    replace: (_, pricing) => `${pricing} + "`,
  },
  {
    note: "the data comments say the plans show their prices",
    pattern: /DRAFT plan levels, to be confirmed by the owner\. Never show a price\.(\s*)Where a price would sit, show D\.pricingLine\.|Never a dollar amount\. Plans show a level, and "Pricing set with Genesis"\./g,
    replace: (_, space) =>
      space === undefined ? "Plans show a plan name and its price, from D.levels." : `The three plans and their prices, as /ministry shows them.${space}D.pricingLine is the one sentence with every price.`,
  },
  {
    note: "the hub's plan cards show each plan's price, and Enterprise says it is priced on a call",
    files: HUB,
    pattern: /(?<=<h3>(Welcome|Connect|Shepherd|Enterprise)<\/h3>\s*<p class="sum">[^\n]*<\/p>\s*)<p class="price">Pricing set with Genesis<\/p>/g,
    replace: (_, name) =>
      name === "Enterprise"
        ? '<p class="price"><span>Priced with you on a call</span></p>'
        : `<p class="price"><b>${planFor(name).price}</b> <span>per month</span></p>`,
  },
  {
    note: "the hub's prices are set like the /ministry cards: the number large, then per month",
    files: HUB,
    pattern: /(\.level \.price \{ margin-top: 24px; padding-top: 16px; border-top: 1px solid var\(--line\);) font-family: var\(--font-mono\); font-size: 0\.62rem; letter-spacing: 0\.16em; text-transform: uppercase; color: var\(--muted\); \}/g,
    replace: (_, box) =>
      `${box} display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }\n` +
      ".level .price b { font-weight: 400; font-size: clamp(2.1rem, 3vw, 2.7rem); line-height: 1; letter-spacing: -0.05em; font-variant-numeric: tabular-nums; }\n" +
      ".level .price span { font-size: 0.9rem; color: var(--muted); }",
  },
  {
    note: "the journey's levels diagram labels each step with its price, as Enterprise is labelled Scoped on a call",
    files: JOURNEY,
    pattern: /(?<=dy="0">)LEVEL (0[1-3])(?=<\/tspan>)/g,
    replace: (_, level) => `${planFor(level).price} A MONTH`,
  },
  {
    note: "the hub's plan cards drop the numbered eyebrow; the plan name above the price says it",
    files: HUB,
    pattern: /<p class="eyebrow">Level 0[1-3]<\/p>\s*(?=<h3>)/g,
    replace: () => "",
  },
  {
    note: "Hope's levels answer and the tour end on the prices, not a draft note",
    pattern: /The levels are a draft, and pricing is set with Genesis\.|(?:Draft levels\. )?Pricing (?:is )?set with Genesis(?:, on a call)?\./g,
    replace: () => PRICE_ANSWER,
  },
  {
    note: "the plans are no longer a draft: the badge, the notes and the page descriptions",
    pattern: /<span class="badge">Draft levels<\/span>|Draft levels, to be confirmed(?: by Genesis)?\. | \(draft levels\)| Levels are a draft\.|Levels are a draft(?:, to be confirmed| until the owner confirms them)\. |\b(?:with draft|Draft) levels(?= and\b)/g,
    replace: (match) => (match === "with draft levels" ? "with three plans" : match === "Draft levels" ? "Three plans" : ""),
  },
  {
    note: "the consultation answer no longer says pricing is set on that call",
    pattern: / Pricing is set on that call, once we understand your church\./g,
    replace: () => "",
  },

  /* Then the names. Each level's data entry gets the plan's name, and its price. */
  {
    note: "each level in D.levels is its plan: the plan's name as its label and name, and its price",
    pattern: /code: "Level (0[1-3])", name: "(?:Welcome|Connect|Shepherd)",|code: "Enterprise", name: "Enterprise",/g,
    replace: (match, level) => {
      if (!level) return `${match} price: "Scoped on a call",`;
      const plan = planFor(level);
      return `code: "${plan.name}", name: "${plan.name}", price: "${plan.price} a month",`;
    },
  },
  {
    note: "the lists of levels name the plans",
    pattern: /\bWelcome, Connect(,| and) Shepherd\b|\bWelcome to Connect to Shepherd\b|\bLevel 01, 02 (and|or) 03\b/g,
    replace: (match, sep, word) =>
      word ? `Care, Shepherd ${word} Plus` : sep ? `Care, Shepherd${sep} Plus` : "Care to Shepherd to Plus",
  },
  { note: "the Back Office badge names the plans", pattern: /\bLevel 02, more at 03\b/g, replace: () => "Shepherd, more in Plus" },
  {
    note: "a level label with its name is the plan name",
    pattern: new RegExp(String.raw`\bLevel (0[1-3]),? ${OLD_NAME}\b`, "g"),
    replace: (_, level) => planFor(level).name,
  },
  {
    note: "at a level reads on a plan",
    pattern: /(?<!look )\b([Aa])t Level (0[1-3])\b/g,
    replace: (_, a, level) => `${a === "A" ? "On" : "on"} the ${planFor(level).name} plan`,
  },
  { note: "a Level 01 church is a church on Care", pattern: /\ba Level (0[1-3]) church\b/g, replace: (_, level) => `a church on ${planFor(level).name}` },
  { note: "below Level 02 is on Care", pattern: /\bBelow Level 02 /g, replace: () => "On Care, " },
  { note: "every other level label is the plan name", pattern: /\bLevel (0[1-3])\b/g, replace: (_, level) => planFor(level).name },
  { note: "the lock badges name the plan", pattern: />L(0[1-3])</g, replace: (_, level) => `>${planFor(level).name}<` },
  {
    note: "everything in a level is everything in its plan",
    pattern: new RegExp(String.raw`\b([Ee]verything in) ${OLD_NAME}\b`, "g"),
    replace: (_, lead, name) => `${lead} ${planFor(name).name}`,
  },
  {
    note: "what a level adds, keeps or has is what its plan does",
    pattern: new RegExp(String.raw`\b${OLD_NAME}(?= (?:adds|keeps|changes|turns|has|names|is the website)\b)`, "g"),
    replace: (name) => planFor(name).name,
  },
  {
    note: "the hub's plan cards and the journey's levels diagram name the plans",
    files: /^platform\/(?:index|journey)\.html$/,
    pattern: new RegExp(String.raw`(<h3>|dy="0">)${OLD_NAME}(?=</h3>|</tspan>)`, "g"),
    replace: (_, lead, name) => `${lead}${planFor(name).name}`,
  },

  /* Last, the scripts: a level's label is now its name, so "label, name" would say the name twice. */
  {
    note: 'the scripts show the plan name once where they showed "Level 02, Connect"',
    pattern: /esc\((\w+)\.code\) \+ ", " \+ esc\(\1\.name\)|\b(\w+)\.code \+ ", " \+ \2\.name\b/g,
    replace: (_, a, b) => (a ? `esc(${a}.name)` : `${b}.name`),
  },
  {
    note: "the level switcher shows each plan's name and price",
    pattern: /esc\((\w+)\.code\.replace\("Level ", ""\)\) \+ "<\/b><span>" \+ esc\(\1\.name\)/g,
    replace: (_, v) => `esc(${v}.name) + "</b><span>" + esc(${v}.price)`,
  },
  { note: "the short level labels are the plan name", pattern: /\b((?:\w+\.)?code)\.replace\("Level ", "L?"\)/g, replace: (_, code) => code },
  {
    note: 'the labels the scripts build as "Level 0" and a number are the plan name',
    pattern: /"([^"\n]*?)Level 0" \+ ([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)/g,
    replace: (_, lead, n) => `${lead ? `"${lead}" + ` : ""}${JSON.stringify(MINISTRY_PLANS.map((plan) => plan.name))}[${n} - 1]`,
  },
  {
    note: "the compact switcher is labelled Plan, as the full one is",
    pattern: /(?<=data-tour="shell\.plan"><span>)Level(?=<\/span>)/g,
    replace: () => "Plan",
  },
];

/**
 * Applies PLAN_RENAMES to one copied file. Returns the new text and the number
 * of changes each rule made (rules that changed nothing are left out).
 * @param {string} file
 * @param {string} text
 */
export function renamePlans(file, text) {
  if (!PLAN_FILES.test(file)) return { text, counts: {} };
  /* Each replacement is held behind a marker until the end, so no later rule rewrites it. */
  const held = [];
  const counts = {};
  for (const rule of PLAN_RENAMES) {
    if (rule.files && !rule.files.test(file)) continue;
    text = text.replace(rule.pattern, (...match) => {
      counts[rule.note] = (counts[rule.note] ?? 0) + 1;
      held.push(rule.replace(...match.slice(0, -2).map((part) => part ?? undefined)));
      return `\u0000${held.length - 1}\u0000`;
    });
  }
  return { text: text.replace(/\u0000(\d+)\u0000/g, (_, index) => held[Number(index)]), counts };
}

/** What may not be left in a renamed file: the old level labels, names and price lines. */
const OLD_PLAN_WORDS = [
  { what: "a numbered level label", pattern: /\bLevel 0[1-3]\b|>L0[1-3]<|\bLevel 0["'] ?\+|["']L0["'] ?\+/gi },
  { what: "pricing set on a call", pattern: /\bpricing (?:is )?set (?:with genesis|on)\b|never shows a (?:price|dollar)/gi },
  { what: "a draft level note", pattern: /\bdraft levels?\b|\blevels are a draft\b/gi },
  {
    what: "an old level name",
    pattern: /\bWelcome, Connect\b|\b[Ee]verything in (?:Welcome|Connect)\b|\b(?:Welcome|Connect) (?:adds|keeps|changes|turns|has|names|is the website)\b|name: "(?:Welcome|Connect)"|<h3>(?:Welcome|Connect)<\/h3>|dy="0">(?:Welcome|Connect)</g,
  },
];

/**
 * Every old level label, old level name or "pricing set with Genesis" line
 * left in a renamed file, with a little context around each.
 * @param {string} text
 * @param {string} file
 */
export function oldPlanRefs(text, file) {
  if (!PLAN_FILES.test(file)) return [];
  const found = [];
  for (const { what, pattern } of OLD_PLAN_WORDS) {
    for (const match of text.matchAll(pattern)) {
      const at = match.index ?? 0;
      const line = text.slice(0, at).split("\n").length;
      const context = text.slice(Math.max(0, at - 40), at + match[0].length + 40).replace(/\s+/g, " ").trim();
      found.push({ what, match: match[0], line, context });
    }
  }
  return found;
}

/** A link that leaves the demo: another site, a mail or phone link, a data URL or a site path. */
const OUTSIDE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|data:)/i;

/**
 * The local files a copied file points at, as paths relative to the copy's
 * root (with forward slashes). Pages: src, href and poster attributes, inline
 * scripts included. Stylesheets: url(). The platform's own scripts
 * (platform/shared/, platform/story/): every quoted "*.html" path, resolved
 * from platform/, where the pages that run them live. A path with a template
 * placeholder ({slug}) is skipped. A path that climbs out of the copy starts
 * with "../" and never resolves inside it.
 * @param {string} file the copied file, relative to the copy's root
 * @param {string} text its contents
 * @returns {string[]}
 */
export function localRefs(file, text) {
  /** @type {string[]} */
  const refs = [];
  const add = (from, url) => {
    if (!url || OUTSIDE.test(url) || url.includes("{")) return;
    let path;
    try {
      path = decodeURI(url);
    } catch {
      path = url;
    }
    refs.push(posix.normalize(posix.join(from, path)));
  };
  const here = posix.dirname(file);
  if (/\.html?$/i.test(file)) {
    for (const [, url] of text.matchAll(/\b(?:src|href|poster)=["']([^"'#?]+)/gi)) add(here, url);
  } else if (/\.css$/i.test(file)) {
    for (const [, url] of text.matchAll(/url\(\s*["']?([^"')#?]+)/gi)) add(here, url);
  } else if (/^platform\/(shared|story)\/[^/]+\.js$/.test(file)) {
    for (const [, url] of text.matchAll(/["'`]((?:\.\.\/)*[a-z0-9-]+(?:\/[a-z0-9-]+)*\.html)(?:[?#][^"'`]*)?["'`]/gi)) {
      add("platform", url);
    }
  }
  return [...new Set(refs)];
}

/**
 * The links to the rest of geai.us in a copied file: site paths (starting
 * with a single "/") in a page's src, href and poster attributes, and quoted
 * site paths in the demo's own scripts (platform/shared/, platform/story/ and
 * shared/). The sync allows only SITE_LINKS.
 * @param {string} file the copied file, relative to the copy's root
 * @param {string} text its contents
 * @returns {string[]}
 */
export function siteRefs(file, text) {
  /** @type {string[]} */
  const refs = [];
  if (/\.html?$/i.test(file)) {
    for (const [, url] of text.matchAll(/\b(?:src|href|poster)=["'](\/(?!\/)[^"']*)/gi)) refs.push(url);
  } else if (/^(platform\/(shared|story)|shared)\/[^/]+\.js$/.test(file)) {
    for (const [, url] of text.matchAll(/["'`](\/(?![/*])[a-z][^"'`\s]*)["'`]/gi)) refs.push(url);
  }
  return [...new Set(refs)];
}

/**
 * Syntax errors in a copied script, or in a page's inline scripts. Compiles
 * only: nothing runs.
 * @param {string} file
 * @param {string} text
 * @returns {string[]}
 */
export function scriptErrors(file, text) {
  /** @type {string[]} */
  const errors = [];
  const check = (code, where) => {
    try {
      new vm.Script(code, { filename: where });
    } catch (error) {
      errors.push(`${where}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  if (/\.js$/i.test(file)) check(text, file);
  else if (/\.html?$/i.test(file)) {
    let n = 0;
    for (const [, attrs, code] of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      n++;
      if (/\bsrc=/i.test(attrs)) continue;
      const type = attrs.match(/\btype=["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
      if (type && /json/.test(type)) {
        try {
          JSON.parse(code);
        } catch (error) {
          errors.push(`${file} script ${n}: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else if (!type || /javascript/.test(type)) check(code, `${file} script ${n}`);
    }
  }
  return errors;
}
