/*
 * What makes the public copy of the Genesis Ministry demo public.
 *
 * scripts/sync-ministry-demo.mjs copies the demo from the Genesis Ministry
 * working folder into public/ministry-demo/. That folder is owned by another
 * team and is never edited from here, so everything the public copy needs to
 * be different is written below, as edits made to the copy:
 *
 *   - PUBLIC_EDITS: exact text swaps, block cuts and presenter drops per
 *     copied file. Each one must find its text exactly as written (a swap the
 *     stated number of times, a cut exactly once, a drop the stated number of
 *     elements), or the sync stops and names it. When the working folder
 *     changes, a stale edit fails loudly instead of quietly leaving a link to
 *     the Growth Desk behind.
 *   - growthDeskRefs: what may never appear in a public file.
 *   - localRefs: the local files a copied page or script points at, so the
 *     sync can stop on a link to a file that was not copied.
 *   - siteRefs and SITE_LINKS: the only links to the rest of geai.us.
 *   - planProblems and oldPlanRefs: the three plans. The owner set them on
 *     November 21, 2026: Care at $149 a month, Shepherd at $299 and Plus at
 *     $499, with Enterprise scoped on a call. The source now names the plans
 *     and their prices itself, so nothing is renamed here any more. Instead
 *     the sync stops when the source's plans or prices differ from the ones
 *     /ministry shows, or when an old draft level is left anywhere.
 *
 * The committed public/ministry-demo/ is synced from genesis-ministry commit
 * a954071 (main on November 22, 2026), exported with git archive.
 *
 * The owner's decision: the Growth Desk (platform/sales-*, Genesis's own tool
 * for finding and selling to churches) is not part of the public demo. No
 * public page may link to it, tour it, point at it or describe its work. The
 * source keeps it behind a presenter mode (?present=1): story pages mark its
 * parts data-present-only, and the shell and the guided demo read
 * GM.presenting. The public copy has no presenter mode at all. The edits
 * below drop every data-present-only element, keep every data-public-only
 * one for good, turn the switch off in the shell, the story pages and the
 * guided demo, and cut every door, link, tour, demo path stop, answer and
 * piece of sample data that belongs to the Growth Desk.
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
/**
 * A drop: remove every HTML element whose opening tag carries the attribute
 * `drop` (with everything inside it, and its line when it has one to itself).
 * There must be exactly `count` of them, and, when `keep` is given, no
 * dropped element may match it.
 * @typedef {{ note: string, drop: string, count: number, keep?: RegExp }} Drop
 */
/** @typedef {Swap | Cut | Drop} Edit */

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
  /* The sample accounts' sales words: their lead sources, a deal's next step, the Genesis team's
     sales role and the account menu's note on a church's proposal. */
  { what: "a sample account's lead source", pattern: /\b(?:website check reply|inbound from geai\.us)\b/gi },
  { what: "a sample deal's next step", pattern: /\belder board decision\b/gi },
  { what: "the Genesis team's sales role", pattern: /\bchurch partnerships\b/gi },
  { what: "the account menu's note on a church's proposal", pattern: /\bproposal is (?:the|enterprise)\b/gi },
];
/** Where GROWTH_DESK_WORDS are not checked: the copied Genesis OS design system. */
const SHARED_DESIGN_SYSTEM = /^platform\/shared\/os\//;

/**
 * The only link to the rest of geai.us a public file may carry: the church
 * consultation, as a walkthrough of the demo (the contact page's
 * "ministry-demo" topic, in ministryConsultationNotes in lib/ministryPage.ts).
 * Every other site path is reported, and so is every absolute geai.us
 * address, so the demo cannot quietly point at a business page or a price,
 * and it links within the site it is served from.
 */
export const SITE_LINKS = [
  "/contact?topic=ministry-demo",
  "/contact?topic=ministry-care",
  "/contact?topic=ministry-shepherd",
  "/contact?topic=ministry-plus",
];

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

/** Elements that have no closing tag. */
const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/**
 * The first element in `text` whose opening tag carries `attr`, as
 * [start, end) offsets, with its line when the element has the line to
 * itself. Null when there is none. Throws when its closing tag is missing.
 * @param {string} text
 * @param {string} attr
 */
function elementWith(text, attr) {
  const opening = new RegExp(String.raw`<([a-z][a-z0-9-]*)\b[^>]*?\s${attr}(?=[\s=>/])[^>]*>`, "i");
  const m = opening.exec(text);
  if (!m) return null;
  const tag = m[1].toLowerCase();
  const start = m.index;
  let end = start + m[0].length;
  if (!VOID_ELEMENTS.has(tag) && !m[0].endsWith("/>")) {
    const tags = new RegExp(String.raw`<(/?)${tag}\b[^>]*>`, "gi");
    tags.lastIndex = end;
    let depth = 1;
    let t;
    while (depth && (t = tags.exec(text))) depth += t[1] ? -1 : 1;
    if (depth) throw new Error(`no closing </${tag}> for ${show(m[0])}`);
    end = tags.lastIndex;
  }
  /* An element alone on its line takes the line with it. */
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = text.indexOf("\n", end);
  if (/^[ \t]*$/.test(text.slice(lineStart, start)) && lineEnd >= 0 && /^[ \t]*$/.test(text.slice(end, lineEnd))) {
    return { start: lineStart, end: lineEnd + 1, tag };
  }
  return { start, end, tag };
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
    } else if ("drop" in edit) {
      let dropped = 0;
      let lines = 0;
      for (let at; (at = elementWith(text, edit.drop)); ) {
        const cut = text.slice(at.start, at.end);
        if (edit.keep && edit.keep.test(cut)) {
          throw new Error(`${file}: ${edit.note}: a ${edit.drop} <${at.tag}> would also remove ${show(cut.match(edit.keep)?.[0] ?? "")}`);
        }
        text = text.slice(0, at.start) + text.slice(at.end);
        lines += cut.split("\n").length - 1;
        dropped++;
        if (dropped > edit.count) break;
      }
      if (dropped !== edit.count) {
        throw new Error(`${file}: ${edit.note}: expected ${edit.count} elements with ${edit.drop}, found ${dropped}${dropped > edit.count ? " or more" : ""}`);
      }
      report.push(`${edit.note} (${dropped} ${dropped === 1 ? "element" : "elements"}, ${lines} ${lines === 1 ? "line" : "lines"} removed)`);
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
 * The way to reach Genesis from the demo: the church consultation on geai.us.
 * The demo is served from geai.us/ministry-demo/, so a site path works from
 * every page, and on every preview of the site. It is the one entry in
 * SITE_LINKS. The source links to the same form by its full address,
 * https://geai.us/contact?topic=ministry-demo; the public copy uses the path.
 * As in the source, it opens in a new tab, labelled Talk With Genesis.
 */
const CONTACT = SITE_LINKS[0];
const SOURCE_CONTACT = `https://geai.us${CONTACT}`;
const TALK = "Talk With Genesis";
/** A link to the consultation, as the source draws its own (story.js keeps its address). */
const talkLink = (arrow = false) =>
  `<a data-contact href="${CONTACT}" target="_blank" rel="noopener">${TALK}${arrow ? ' <span aria-hidden="true">&#8599;</span>' : ""}<span class="sr-only"> (opens in a new tab)</span></a>`;

/** The source's address for the consultation becomes the site path, the stated number of times. */
const contactPath = (count) => ({ note: "Talk With Genesis opens the church consultation on this site, by its path", find: SOURCE_CONTACT, replace: CONTACT, count });

/*
 * The Genesis Ministry plans, as /ministry shows them (ministryLevels in
 * lib/ministryPage.ts; tests/ministry-edition.test.ts keeps the two equal).
 * The owner replaced the draft levels with three plans and set their prices.
 * Each plan holds what one draft level held: Care was Level 01 (Welcome),
 * Shepherd was Level 02 (Connect) and Plus was Level 03 (Shepherd).
 * Enterprise, for more than one campus, stays scoped on a call.
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

/*
 * The story pages (the gallery, the hub and the journey) switch presenter
 * mode on in a script in their head. The public copy has none, so the script
 * goes. Its first words, to the end of the line.
 */
const presenterHead = (comment, next) => ({
  note: "removed the presenter switch from the head; the public copy has no presenter mode",
  from: `<script>/* Presenting: ${comment}`,
  to: next,
  maxLines: 1,
  keep: /data-theme|location\.replace|<link|<meta/,
});
/** The theme script, the next line in the head of the hub and the journey. */
const THEME_SCRIPT = '<script>(function(){var t="dark";';

/** The story pages' presenter parts: never published. */
const dropPresenterOnly = (count, keep) => ({ note: "dropped the parts shown only while presenting (data-present-only)", drop: "data-present-only", count, keep });
/** The story pages' public parts: always shown, since there is no presenter mode to hide them. */
const keepPublicOnly = (count) => ({ note: "the parts shown only to the public stay, without data-public-only", find: " data-public-only", replace: "", count });

/** @type {Readonly<Record<string, readonly Edit[]>>} */
export const PUBLIC_EDITS = {
  /* The gallery. */
  "index.html": [
    presenterHead("?present=1 for this tab (platform/story/story.js keeps it). */", "<link rel=\"icon\""),
    dropPresenterOnly(1, /church-|member-|journey\.html/),
    keepPublicOnly(1),
    {
      note: "Look 02 is described the way /ministry describes it",
      find: '<span class="sep" aria-hidden="true">/</span>Youth-heavy, worship-led churches</p>',
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
      replace: `      <a href="platform/journey.html">The Journey</a>\n      ${talkLink()}\n    </nav>`,
    },
    {
      note: "the phone menu links to the church consultation",
      find: '    <a href="platform/journey.html">The Journey <span aria-hidden="true">&#8599;</span></a>\n',
      replace: `    <a href="platform/journey.html">The Journey <span aria-hidden="true">&#8599;</span></a>\n    ${talkLink(true)}\n`,
    },
    {
      note: "the footer links to the church consultation",
      find: '      <a href="platform/index.html#levels">Plans</a>\n    </nav>',
      replace: `      <a href="platform/index.html#levels">Plans</a>\n      ${talkLink()}\n    </nav>`,
    },
    contactPath(1),
  ],

  /* The hub, the overview of the platform. */
  "platform/index.html": [
    presenterHead("?present=1 shows the Growth Desk doors for this tab (story/story.js keeps it). */", THEME_SCRIPT),
    /* The hero's "Or start where Genesis finds a church", Seven doors, the Finding to Launch chip, the
       For Genesis doors (Acquisition and the Sales Desk), the link to the suppression list, Compare
       Plans on the Growth Desk and "Start on the Growth Desk". */
    dropPresenterOnly(7, /church-|member-|journey\.html#(guest|start|privacy|ai|levels)|data-tenant/),
    keepPublicOnly(2),
    {
      note: "removed rule 10, how Genesis writes to churches it has found, which is the Growth Desk's work",
      from: '        <li><span class="n" aria-hidden="true">10</span><div><h3>If Genesis writes to your church, it writes the right way.',
      to: "      </ol>",
      maxLines: 1,
      keep: /church-|member-/,
    },
    {
      note: "the hero eyebrow names Genesis AI instead of Genesis OS",
      find: '<p class="eyebrow">Genesis OS<span class="sep" aria-hidden="true">/</span>For churches</p>',
      replace: '<p class="eyebrow">Genesis AI<span class="sep" aria-hidden="true">/</span>For churches</p>',
    },
    { note: "the screen frames name Genesis Ministry, not an internal product name", find: "<em>Ministry OS · ", replace: "<em>Genesis Ministry · ", count: 3 },
    {
      note: "the header links to the church consultation",
      find: '      <a href="../index.html">The Templates</a>\n    </nav>',
      replace: `      <a href="../index.html">The Templates</a>\n      ${talkLink()}\n    </nav>`,
    },
    {
      note: "the phone menu links to the church consultation",
      find: '    <a href="../index.html">The Templates <span aria-hidden="true">&#8599;</span></a>\n',
      replace: `    <a href="../index.html">The Templates <span aria-hidden="true">&#8599;</span></a>\n    ${talkLink(true)}\n`,
    },
    {
      note: "the footer links to the church consultation",
      find: '      <a href="#levels">Choose Your Plan</a>\n    </nav>',
      replace: `      <a href="#levels">Choose Your Plan</a>\n      ${talkLink()}\n    </nav>`,
    },
    contactPath(2),
  ],

  /* The journey. Its presenter chapter, Finding to Launch, told how Genesis
     finds a church, by the names of the Growth Desk's two parts. The public
     chapter two, Getting Started, tells the church's side of the same path,
     from the first conversation to launch. */
  "platform/journey.html": [
    presenterHead("?present=1 shows the Growth Desk chapter for this tab (story/story.js keeps it). */", THEME_SCRIPT),
    /* Finding to Launch in the header, the phone menu and the chapter index, the chapter itself with
       its diagram and its links into the Growth Desk, and the Outreach Drafts link. */
    dropPresenterOnly(5, /id="(guest|start|privacy|ai|levels)"|href="#(guest|start|privacy|ai|levels)"|church-|member-/),
    keepPublicOnly(4),
    {
      note: "removed the script that only drew the Finding to Launch diagram",
      from: "/* The dashed drop lines in the Growth Desk chapter draw under the labels they pass, not through them. */\n",
      to: "</script>",
      maxLines: 6,
      keep: /#privacy|dg-levels|dg-guest/,
    },
    {
      note: "the header links to the church consultation",
      find: '      <a href="#levels">Plans</a>\n    </nav>',
      replace: `      <a href="#levels">Plans</a>\n      ${talkLink()}\n    </nav>`,
    },
    {
      note: "the phone menu links to the church consultation",
      find: '    <a href="#levels">What Each Plan Adds <span aria-hidden="true">&#8599;</span></a>\n',
      replace: `    <a href="#levels">What Each Plan Adds <span aria-hidden="true">&#8599;</span></a>\n    ${talkLink(true)}\n`,
    },
    {
      note: "the footer links to the church consultation",
      find: '      <a href="index.html#levels">Compare Plans</a>\n    </nav>',
      replace: `      <a href="index.html#levels">Compare Plans</a>\n      ${talkLink()}\n    </nav>`,
    },
    contactPath(1),
  ],

  /* The story pages' script: presenter mode, and where Talk With Genesis goes. */
  "platform/story/story.js": [
    {
      note: "Talk With Genesis is the church consultation on this site; the note to confirm its address is done",
      from: "  /* Where Talk With Genesis goes: the geai.us consultation form, opened as a Genesis Ministry\n",
      to: "  var GENESIS_CONTACT_URL = ",
      maxLines: 3,
      keep: /var |function /,
      replace: "  /* Where Talk With Genesis goes: the church consultation on geai.us, as a walkthrough of the demo. */\n",
    },
    contactPath(1),
    {
      note: "presenter mode is off for good in the public copy",
      from: "  /* The Growth Desk (how Genesis finds and signs churches) is Genesis's own tool.",
      to: "  var STORY = window.STORY",
      maxLines: 10,
      keep: /function theme|var church|var plan|setTheme/,
      replace: '  /* The public copy has no presenter mode. */\n  var present = false;\n  root.removeAttribute("data-present");\n\n',
    },
  ],

  /* The story pages' stylesheet. */
  "platform/story/story.css": [
    {
      note: "the presenter rules' comment no longer names the Growth Desk",
      find: "/* The Growth Desk is Genesis's own tool. It shows only while the owner presents (?present=1 sets\n   html[data-present] for the tab, see story.js), and the public copy never points to it. */",
      replace: "/* Presenter-only parts are not in the public copy, which has no presenter mode. */",
    },
  ],

  /* The one stylesheet every platform page links. */
  "platform/shared/genesis.css": [
    {
      note: "a layout comment no longer names the Growth Desk",
      find: "same place on church and Growth Desk screens.",
      replace: "same place on every workspace screen.",
    },
  ],

  /* The sample data every platform page loads. The church screens read the
     churches, people, guests, care, plans and the four sample accounts. The
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
      note: "removed the sample accounts' deal stages, owners, lead sources and next steps; the lists stay empty so the guest stages still work",
      from: "  D.sales = {\n",
      to: "\n\n  /* The Genesis side has no drafts or summaries in the public preview. */",
      maxLines: 20,
      keep: /D\.(churches|levels|modules|people|guests|guestStages|howItRuns) =/,
      replace: "  D.sales = { stages: [], afterStages: [], deals: [] };",
    },
    {
      note: "removed the names and roles of Genesis's own team, which only the Genesis side showed",
      from: "  D.genesisTeam = [\n",
      to: '\n\n  /* "How it runs"',
      maxLines: 8,
      keep: /D\.(churches|levels|modules|people|guests|howItRuns) =/,
      replace: "  D.genesisTeam = [];",
    },
    contactPath(1),
  ],

  /* Hope on the four sample church sites, the story pages and the member screens. */
  "shared/hope-demo.js": [
    {
      note: "the customization answer no longer starts with Yes, which read as a reply to a price question",
      find: 'custom: { t: "Yes. Every template is filled',
      replace: 'custom: { t: "Every template is filled',
    },
  ],

  /* The shell every workspace and member screen runs on. */
  "platform/shared/app.js": [
    {
      note: "presenter mode is off for good: no church or member screen ever shows a Growth Desk link",
      from: "  /* Presenter mode, the same switch the story pages use (story/story.js).",
      to: "  /* The church-side levels view",
      maxLines: 10,
      keep: /LEVELS_HREF|GM\.data|var plan/,
      replace: "  /* The public copy has no presenter mode. */\n  GM.presenting = false;\n",
    },
    {
      note: "the levels view comment no longer names the Growth Desk",
      find: "  /* The church-side levels view: the overview's levels, never the Growth Desk. */",
      replace: "  /* The church-side plans view: the overview's plans. */",
    },
    {
      note: "the link comment names the guided demo's own settings, not a run from the Growth Desk",
      find: "    /* A guided demo run that started on the Growth Desk keeps from=desk on every link and every\n       address a page rewrites",
      replace: "    /* A guided demo run keeps its pace on every link and every\n       address a page rewrites",
    },
    {
      note: "removed the rewrite of Growth Desk plan links, since no public page has one",
      find:
        "    /* On church and member screens Compare Plans opens the overview's levels, never the Growth Desk. */\n" +
        '    if (raw && GM.side !== "genesis" && /^(?:\\.\\/)?sales-levels\\.html(?:[?#].*)?$/i.test(raw) && !a.hasAttribute("data-gm-carried")) { raw = LEVELS_HREF; a.setAttribute("href", raw); }\n',
      replace: "",
    },
    {
      note: "removed Genesis Growth Desk from the account menu and Jump To",
      find: '        { key: "desk", label: "Genesis Growth Desk", href: "sales-pipeline.html", icon: "accounts", hint: "How Genesis finds and serves churches", presenter: true },\n',
      replace: "",
    },
    {
      note: "the account menu and Jump To offer the church consultation",
      find: '        { key: "levels", label: "Compare Plans", href: LEVELS_HREF, icon: "levels", hint: "Care, Shepherd, Plus, Enterprise" }\n',
      replace:
        '        { key: "levels", label: "Compare Plans", href: LEVELS_HREF, icon: "levels", hint: "Care, Shepherd, Plus, Enterprise" },\n' +
        `        { key: "consult", label: "${TALK}", href: "${CONTACT}", icon: "call", hint: "A free conversation with Genesis about your church" }\n`,
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
      note: "the account menu comment no longer names the Growth Desk",
      find: "  /* Account-menu links; the Growth Desk link only while presenting. */",
      replace: "  /* Account-menu links. */",
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
      note: "removed the Add a Church drawer, which only the Genesis side opened, with its lead sources",
      from: '    } else {\n      eyebrow = "Genesis"; title = "Add a church"; submit = "Add Church";',
      to: "\n    layer.innerHTML = ",
      maxLines: 9,
      keep: /layer\.innerHTML|add-guest|Add a Guest/,
      replace: "    }",
    },
  ],

  /* The guided demo: tours, the demo path and the scripted answers. */
  "platform/shared/demo.js": [
    contactPath(1),
    {
      note: "the header comment names only the church workspace",
      find: "   - Genesis screens (the church workspace and the Growth Desk) use the real Genesis OS guide",
      replace: "   - Genesis screens (the church workspace) use the real Genesis OS guide",
    },
    {
      note: "the texting answer's comment no longer names the Growth Desk",
      find: "    /* The church's own answer. The Growth Desk adds how Genesis reaches churches (below). */\n",
      replace: "    /* The church's own answer. */\n",
    },
    {
      note: "the guest unsubscribe rule's comment no longer mentions Genesis's outreach",
      find: "    /* A guest's own unsubscribe is not Genesis's outreach to churches. */\n",
      replace: "    /* A guest's own unsubscribe. */\n",
    },
    {
      note: "removed the outreach answer, which described how Genesis finds churches",
      from: '    outreach: "From public information only:',
      to: "    price: ",
      maxLines: 1,
      keep: /\n    (levels|custom|texting|archive): /,
    },
    {
      note: "removed the Growth Desk's own texting line",
      find: '  } else if (GM && GM.side === "genesis") {\n    /* On the Growth Desk, the texting answer also says how Genesis reaches churches. */\n    ANSWERS.texting += " Genesis never texts a church it is reaching out to.";\n  }',
      replace: "  }",
    },
    {
      note: "questions about reaching Genesis get the call answer instead of the outreach rules",
      find: String.raw`    [/how (do|does|will) (you|genesis|we) (find|contact|reach|choose|pick)|where do (the )?(churches|prospects|leads) come|public information|cold (email|call|outreach)|unsubscribe|suppression/i, "outreach"],` + "\n",
      replace: String.raw`    [/\bhow (do|does|will|can|could) (i|we|you) (contact|reach|get in touch with) (you|genesis|someone|a person)\b/i, "call"],` + "\n",
    },
    {
      note: "the demo path comment starts at the church workspace",
      find: "  /* Finding a church, selling and serving it, the church workspace, the member app, then back. */",
      replace: "  /* The church workspace, the member app, then back. */",
    },
    {
      note: "every run is a church buyer's demo: removed the run that starts on the Growth Desk",
      from: "  /* Where this run of the demo started, so the path and the last card say the right thing.",
      to: "  var PATH_ALL = [",
      maxLines: 8,
      keep: /PATH|SHORT_SKIP|church-/,
      replace: "  /* Every run is a church buyer's demo, from Today to the overview's plans. */\n  var ORIGIN = \"church\";\n",
    },
    {
      note: "the demo path starts at Today: removed Find, One Prospect, the Website Check and the Proposal",
      from: '    { key: "sales-find", label: "Find This Week", desk: true },\n',
      to: '    { key: "church-today", label: "The Church Workspace" },',
      maxLines: 4,
      keep: /church-|member-/,
    },
    {
      note: "the demo path ends at the overview: removed Onboarding and the Plans screen",
      find: '    { key: "sales-onboarding", label: "What Happens After You Sign", desk: true },\n    { key: "sales-levels", label: "The Plans", desk: true },\n',
      replace: "",
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
      note: "removed how the Growth Desk stops are named in a sentence",
      find: '    "sales-onboarding": "onboarding", "sales-levels": "the plans", "church-team"',
      replace: '    "church-team"',
    },
    {
      note: "a run that falls off the path rejoins it at the overview instead of Onboarding",
      find: '      if (!hop) { var fb = pathIndex("sales-onboarding"); hop = walk(fb >= 0 ? fb : pathIndex("index")); }',
      replace: '      if (!hop) hop = walk(pathIndex("index"));',
    },
    {
      note: "only church and member links carry the church and the plan",
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
      note: "member Hope no longer answers how Genesis finds churches",
      find: '        outreach: a(ANSWERS.outreach, [{ label: "What Is Genesis Ministry?", key: "platform" }]),\n',
      replace: "",
    },
    {
      note: "the end of the demo card's How to Get Started opens the church's chapter of the journey",
      find: 'var start = GM.presenting ? "journey.html#launch" : "journey.html#start";',
      replace: 'var start = "journey.html#start";',
    },
    {
      note: "the last card's comment no longer names the Growth Desk",
      find: "      /* A church buyer's demo ends on the church side; the Growth Desk is only offered while presenting. */\n",
      replace: "      /* A church buyer's demo ends on the church side. */\n",
    },
    {
      note: "the last card's How to Get Started opens the church's chapter of the journey",
      find: '{ label: "How to Get Started", href: GM.presenting ? "journey.html#launch" : "journey.html#start" }',
      replace: '{ label: "How to Get Started", href: "journey.html#start" }',
    },
    {
      note: 'the last card never offers "See How Genesis Finds Churches"',
      find: '\n          : KEY === "sales-levels" && ORIGIN !== "desk" && GM.presenting ? [{ label: "See How Genesis Finds Churches", href: GM.url("sales-find.html", { tour: "1" }) }] : [] },',
      replace: " : [] },",
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
      note: "the story pages have no presenter mode",
      find: "    /* While the owner presents (story/story.js, ?present=1), the Growth Desk parts of the story show. */\n    var PRESENT = !!(STORY && STORY.present);\n",
      replace: "    /* The public copy has no presenter mode. */\n    var PRESENT = false;\n",
    },
    {
      note: "the overview tour describes the doors that are published",
      find: '(PRESENT ? "From how Genesis finds a church to what members see on their phones." : "From the website to what members see on their phones.")',
      replace: '"From the website to what members see on their phones."',
    },
    {
      note: "the journey tour names the church's chapter, how a church gets started",
      find: `p: PRESENT ? "A guest's path, how Genesis finds and launches a church, privacy, what the AI does, and the plans." : "A guest's path, how a church gets started, privacy, what the AI does, and the plans." },`,
      replace: `p: "A guest's path, how a church gets started, privacy, what the AI does, and the plans." },`,
    },
    {
      note: "removed the journey tour's step on how Genesis finds a church",
      from: '        { sel: ["#launch .intro > div:first-child"',
      to: '        { sel: ["#privacy .intro',
      maxLines: 1,
      keep: /#(guest|start|privacy|ai|levels) /,
    },
    {
      note: "the story pages' Hope offers its data answer instead of how Genesis finds churches",
      find: '        PRESENT ? { label: "How Does Genesis Find Churches?", key: "outreach" } : { label: "Is Our Data Safe?", key: "hosting" },',
      replace: '        { label: "Is Our Data Safe?", key: "hosting" },',
    },
    {
      note: "the story pages' Hope no longer answers how Genesis finds churches",
      find: "        outreach: a(ANSWERS.outreach, more),\n",
      replace: "",
    },
    {
      note: "removed the Demo This Plan hook of the Plans and Proposal screens",
      from: '  if (FILE === "sales-levels" || FILE === "sales-account") {',
      to: "  function init() {",
      maxLines: 6,
      keep: /church-(?!today)|member-/,
    },
    {
      note: "each card of the guided demo says which screen of how many it is",
      find: "  /* ------------------------------------------------------------------ shared targets */\n",
      replace:
        '  /* Where this screen sits on the guided demo path on this plan, for the card\'s eyebrow:\n' +
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
      find: 'k: MEMBER ? GUIDE + " · " + fill(t.title) : undefined',
      replace: 'k: MEMBER ? GUIDE + " · " + screenOf() + fill(t.title) : undefined',
    },
  ],
};

/* ── the three plans ───────────────────────────────────────────────── */

/**
 * The copied files that name the plans: the gallery, Hope on the sample
 * sites, and the platform pages and scripts, but not the copied Genesis OS
 * design system (platform/shared/os/), which never names them. The church
 * sites under templates/ are left alone: their "Connect" and "Welcome" are a
 * church's own words.
 */
export const PLAN_FILES = /^(?:index\.html|shared\/hope-demo\.js|platform\/(?!shared\/os\/)[a-z0-9/-]+\.(?:html|js))$/;

/**
 * Where the source keeps the plans: GM_DATA in platform/shared/data.js, with
 * D.pricingLine, the one sentence every price answer starts with.
 */
export const PLAN_DATA = "platform/shared/data.js";

/**
 * The first draft level, as the source named it before the plans. A source
 * that still has it is older than the plans, and the sync stops.
 */
export const DRAFT_LEVEL_MARK = /code: "Level 01", name: "Welcome"/;

/**
 * What is wrong with the plans in the source's data, against the plans and
 * prices /ministry shows: each plan by name with its monthly price,
 * Enterprise scoped on a call, and D.pricingLine word for word the price
 * answer. Empty when they match.
 * @param {string} data the text of platform/shared/data.js
 * @returns {string[]}
 */
export function planProblems(data) {
  const problems = [];
  if (DRAFT_LEVEL_MARK.test(data)) problems.push("it still has the draft levels (Level 01, Welcome)");
  if (!data.includes(`D.pricingLine = "${PRICE_ANSWER}";`)) problems.push(`D.pricingLine is not "${PRICE_ANSWER}"`);
  for (const plan of MINISTRY_PLANS) {
    if (!data.includes(`code: "${plan.name}", name: "${plan.name}", price: "${plan.price} a month",`)) {
      problems.push(`the ${plan.name} plan is not named with its price, ${plan.price} a month`);
    }
  }
  if (!data.includes('code: "Enterprise", name: "Enterprise", price: "Scoped on a call",')) problems.push("Enterprise is not scoped on a call");
  /* Every price the data names is one of the three. */
  for (const [price] of data.matchAll(/\$\d[\d,]*/g)) {
    if (!MINISTRY_PLANS.some((plan) => plan.price === price)) problems.push(`it names ${price}, which is not a plan price`);
  }
  return problems;
}

/** What may not be left in a public page or script: the old level labels, names and price lines. */
const OLD_PLAN_WORDS = [
  { what: "a numbered level label", pattern: /\bLevel 0[1-3]\b|>L0[1-3]<|\bLevel 0["'] ?\+|["']L0["'] ?\+/gi },
  { what: "pricing set on a call", pattern: /\bpricing (?:is )?set (?:with genesis|on)\b|never shows a (?:price|dollar)/gi },
  { what: "a draft level note", pattern: /\bdraft levels?\b|\blevels are a draft\b/gi },
  {
    what: "an old level name",
    pattern: /\bWelcome, Connect\b|\b[Ee]verything in (?:Welcome|Connect)\b|\b(?:Welcome|Connect) (?:adds|keeps|changes|turns|has|names|is the website)\b|name: "(?:Welcome|Connect)"|<h3>(?:Welcome|Connect)<\/h3>|dy="0">(?:Welcome|Connect)</g,
  },
  {
    what: 'the word "level" where people read it',
    pattern: /\b(?:[Ee]ach|[Ee]very|[Aa]ny|[Tt]his|[Tt]hat|[Ww]hich|[Tt]he|[Ii]ts|[Yy]our|[Pp]lan|and) levels?\b|\b(?:Compare|This|Each|Your) Levels?\b|>Levels?\s*<|\b[Aa]t " \+ (?:GM\.level\(\)|ctx\.level)\.code\b/g,
  },
];

/**
 * Every old level label, old level name or "pricing set with Genesis" line
 * left in a public page or script, with a little context around each.
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
 * with a single "/") in a page's src, href and poster attributes, quoted site
 * paths in the demo's own scripts (platform/shared/, platform/story/ and
 * shared/), and, in any file, every absolute geai.us address, as written. The
 * sync allows only SITE_LINKS, which are paths, so an absolute address is
 * always reported.
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
  for (const [url] of text.matchAll(/\b(?:https?:)?\/\/(?:www\.)?geai\.us\b[^"'`\s<>)]*/gi)) refs.push(url);
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
