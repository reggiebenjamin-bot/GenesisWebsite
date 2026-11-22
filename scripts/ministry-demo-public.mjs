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

/** Every forbidden reference in a text, with a little context around each. */
export function growthDeskRefs(text) {
  const found = [];
  for (const { what, pattern } of FORBIDDEN) {
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

/** @type {Readonly<Record<string, readonly Edit[]>>} */
export const PUBLIC_EDITS = {
  /* The gallery: the platform card counted the Growth Desk doors. */
  "index.html": [
    {
      note: "the platform card names the five doors that are published",
      find: "Seven doors: acquisition, the sales desk, the front office, the back office, the member app, the journey and these templates.",
      replace: "Five doors: the front office, the back office, the member app, the journey and these templates.",
    },
  ],

  /* The hub, the front door of the platform. */
  "platform/index.html": [
    {
      note: "the page description leaves out the acquisition arm and the sales desk",
      find: "Edition 05 of Genesis OS for churches: the acquisition arm, the sales desk, the front office, the back office and the member app, with draft levels and the rules that protect people.",
      replace: "Edition 05 of Genesis OS for churches: the website, the front office, the back office and the member app, with draft levels and the rules that protect people.",
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
  ],

  /* The journey. Its second chapter still tells how a church is found and
     launched; only the links into the Growth Desk go. */
  "platform/journey.html": [
    {
      note: "removed the See It links of the Finding to Launch chapter, which all opened the Growth Desk",
      from: '      <div class="see-it">\n        <p class="eyebrow">See it</p>\n        <a class="chip-link" data-carry href="sales-find.html">',
      to: '      <details class="disclosure alt"><summary>Read the path as a list</summary>',
      maxLines: 12,
      keep: /church-|member-/,
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
      note: 'the last card no longer offers "See How Genesis Finds Churches"',
      find: 'links: KEY === "sales-levels" && ORIGIN !== "desk" ? [{ label: "See How Genesis Finds Churches", href: GM.url("sales-find.html", { tour: "1" }) }] : [] },',
      replace: "links: [] },",
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
  ],
};

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
