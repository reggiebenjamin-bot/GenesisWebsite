/*
 * Copies the Genesis Ministry demo into public/ministry-demo/, where the
 * /ministry page links to it, and refreshes the four look screenshots the
 * page shows:
 *
 *   /ministry-demo/index.html                     the four looks, side by side
 *   /ministry-demo/templates/<slug>/index.html    each look, with a made up church
 *   /ministry-demo/platform/index.html            the platform hub
 *   /ministry-demo/platform/index.html?tour=1     the guided demo, from Today
 *
 *   node scripts/sync-ministry-demo.mjs <genesis-ministry folder> [--looks-only]
 *   node scripts/sync-ministry-demo.mjs <genesis-ministry folder> --with-growth-desk --out <folder>
 *
 * The source is the first argument, or MINISTRY_DEMO_SOURCE. There is no
 * default: the script stops if neither is given. The source is only read.
 *
 * What is copied follows "Uploading the preview" in the source's
 * platform/DESIGN.md (section 12):
 *   - index.html (the gallery);
 *   - shared/crisis-words.js, shared/hope-demo.js, shared/notes-data.js and
 *     shared/notes-site.js (the sermon notes and devotionals);
 *   - platform/, without platform/DESIGN.md;
 *   - templates/<slug>/ for each look, without its shots/, except the two
 *     screenshots per look the gallery shows (shots/desktop/home-01.jpg and
 *     shots/mobile/home-01.jpg), and without the *.mjs build tools.
 * Everything else (tools/, voice-samples/, brand/, BASELINE.md, LAUNCH.md,
 * README.md, shared/test.html, shared/hope-check.html,
 * templates/PHOTO-CLAIMS.txt) stays out. So do the gallery's three loose
 * pictures that section 12 lists (early-look.jpg, four-looks.jpg and
 * geai-ministry-page.jpg): nothing links to them, and geai-ministry-page.jpg
 * is a screenshot of an old version of /ministry.
 *
 * The default is the public copy. The Growth Desk (platform/sales-*, with the
 * two hub door screenshots of it) is Genesis's own tool for finding and
 * selling to churches, and the owner keeps it out of the public demo. The
 * public copy leaves those files out, and scripts/ministry-demo-public.mjs
 * edits the copied pages and scripts so nothing links to it, tours it,
 * points at it or describes its work: it drops every part the source shows
 * only while presenting (?present=1), turns presenter mode off, and cuts the
 * rest. It also points Talk With Genesis at the church consultation on this
 * site. Each edit must find its text exactly, or the script stops. The source
 * names the three plans and their prices itself (Care at $149 a month,
 * Shepherd at $299, Plus at $499, Enterprise scoped on a call); the script
 * checks them against /ministry and stops when they differ. The source is
 * never changed.
 *
 * The source folder is a git repository that another team keeps editing. To
 * publish a reviewed version rather than work in progress, export one of its
 * commits into an empty folder and sync from there:
 *   git -C <genesis-ministry folder> archive <commit> | tar -x -C <empty folder>
 *   node scripts/sync-ministry-demo.mjs <that folder>
 *
 * --with-growth-desk makes a private copy instead: everything above plus the
 * Growth Desk, unedited. It needs --out with a folder outside public/, and the
 * script refuses to write it anywhere a deploy would publish it. The checks
 * below still run on a private copy, but only list what they find.
 *
 * Every copied page is made noindex: the demo shows made up churches and must
 * never be indexed as real ones. next.config.ts also sends X-Robots-Tag:
 * noindex for /ministry-demo/. robots.txt deliberately does not block it, so
 * crawlers can read both.
 *
 * The copy is built in a temporary folder and checked before it replaces the
 * destination. The script stops, and leaves the destination as it was, when
 *   - an edit does not find its text;
 *   - a public file still names a sales-* page or the words "Growth Desk",
 *     or (outside the copied Genesis OS design system) "acquisition",
 *     "sales desk", "suppression" or "prospect";
 *   - a public file links to a geai.us path other than the church
 *     consultation (SITE_LINKS), or to geai.us by its full address;
 *   - the source's plans or prices are not the ones /ministry shows
 *     (planProblems), or a public page or script still has a Level 01 to 03
 *     label, an old level name in a level sentence, a draft level note or
 *     "pricing set with Genesis";
 *   - a copied page, stylesheet or platform script points at a local file
 *     that was not copied;
 *   - a copied script, or a page's inline script, does not compile;
 *   - a field a visitor could type in on a church site or a brand board is not
 *     a read-only sample, the member sign-in email is not the read-only sample
 *     you@example.com (so a typed email is never shown back), or the member
 *     messages' 911 and 988 line is not before the message box (demoFormProblems).
 * It prints every file left out and every edit made.
 *
 * Every run also writes the four look cards' screenshots,
 * public/images/ministry/look-<slug>.jpg: the first 1440 by 900 of each look's
 * shots/desktop/home-01.jpg, so the cards on /ministry always match the
 * previews they open. --looks-only does just that and copies nothing else.
 *
 * Review the result with `git status` before committing it.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GROWTH_DESK_FILES,
  GROWTH_DESK_PICTURES,
  PLAN_DATA,
  PUBLIC_EDITS,
  applyEdits,
  SITE_LINKS,
  growthDeskRefs,
  localRefs,
  oldPlanRefs,
  planProblems,
  TERMS_FILES,
  termsProblems,
  scriptErrors,
  siteRefs,
} from "./ministry-demo-public.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const PUBLIC_DEST = join(PUBLIC, "ministry-demo");
const LOOKS_DEST = join(PUBLIC, "images", "ministry");

/** The four looks, in page order. Must match ministryLooks in lib/ministryPage.ts. */
const LOOKS = ["bright-modern", "bold-dark", "classic-timeless", "warm-community"];
/** The first screen of each desktop screenshot, as the look cards show it. */
const CROP = { left: 0, top: 0, width: 1440, height: 900 };

const NOINDEX = '<meta name="robots" content="noindex">';
/** Marks a private copy's folder, so a later run may replace it. */
const PRIVATE_MARK = ".ministry-demo-private";
/** Files read as text for the checks. */
const TEXT = /\.(html?|js|mjs|css|json|md|svg|txt|xml|vtt)$/i;

function fail(message) {
  console.error(`sync-ministry-demo: ${message}`);
  process.exit(1);
}

/* ── arguments ─────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const flags = new Set();
let outArg = null;
const positional = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--out") {
    outArg = args[++i];
    if (!outArg) fail("--out needs a folder.");
  } else if (arg.startsWith("--")) {
    if (!["--looks-only", "--with-growth-desk"].includes(arg)) fail(`unknown option ${arg}`);
    flags.add(arg);
  } else positional.push(arg);
}
const sourceArg = positional[0] || process.env.MINISTRY_DEMO_SOURCE;
if (!sourceArg) {
  fail("no source folder. Pass the genesis-ministry folder as the first argument, or set MINISTRY_DEMO_SOURCE.");
}

const SOURCE = resolve(sourceArg);
if (!existsSync(join(SOURCE, "index.html")) || !existsSync(join(SOURCE, "templates"))) {
  fail(`${SOURCE} is not the genesis-ministry folder: it has no index.html or templates/.`);
}

const withGrowthDesk = flags.has("--with-growth-desk");
/** Whether `path` is `folder` or inside it. */
const inside = (folder, path) => {
  const r = relative(folder, path);
  return r === "" || (!r.startsWith("..") && !isAbsolute(r));
};

let DEST = PUBLIC_DEST;
if (withGrowthDesk) {
  if (!outArg) fail("--with-growth-desk makes a private copy: pass --out with a folder outside public/.");
  DEST = resolve(outArg);
  if (inside(PUBLIC, DEST)) fail(`refusing to write the Growth Desk into ${DEST}: everything under public/ is published.`);
  if (inside(DEST, ROOT) || inside(DEST, SOURCE) || inside(SOURCE, DEST)) fail(`refusing to replace ${DEST}.`);
  if (existsSync(DEST) && readdirSync(DEST).length && !existsSync(join(DEST, PRIVATE_MARK))) {
    fail(`${DEST} is not empty and was not made by this script. Pick an empty or new folder.`);
  }
} else if (outArg) {
  fail("--out is only for the private copy made with --with-growth-desk.");
}
/* Never let a bad argument point the clean-up anywhere but our own folder. */
if (!withGrowthDesk && relative(PUBLIC, DEST) !== "ministry-demo") fail(`refusing to write to ${DEST}`);

/* ── the four look screenshots ─────────────────────────────────────── */

async function writeLookCrops() {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    fail("sharp is not installed (it ships with Next.js). Run npm install and try again.");
  }
  mkdirSync(LOOKS_DEST, { recursive: true });
  for (const slug of LOOKS) {
    const shot = join(SOURCE, "templates", slug, "shots", "desktop", "home-01.jpg");
    if (!existsSync(shot)) fail(`no screenshot for the ${slug} look at ${shot}`);
    const { width = 0, height = 0 } = await sharp(shot).metadata();
    if (width < CROP.width || height < CROP.height) {
      fail(`${shot} is ${width} by ${height}; it needs to be at least ${CROP.width} by ${CROP.height}.`);
    }
    await sharp(shot)
      .extract(CROP)
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(join(LOOKS_DEST, `look-${slug}.jpg`));
  }
  console.log("Wrote the four look screenshots into public/images/ministry/.");
}

await writeLookCrops();
if (flags.has("--looks-only")) process.exit(0);

/* ── what is copied ────────────────────────────────────────────────── */

/** Path of a source file relative to the source root, with forward slashes. */
const rel = (path) => relative(SOURCE, path).split(sep).join("/");

/** Why a source path is left out, or null when it is copied. Folders are visited unless left out. */
function leftOut(r) {
  if (r === "platform/DESIGN.md") return "working notes (platform/DESIGN.md)";
  if (/\.mjs$/i.test(r)) return "build tools (*.mjs)";
  if (!withGrowthDesk && GROWTH_DESK_FILES.test(r)) return "the Growth Desk (platform/sales-*)";
  if (!withGrowthDesk && GROWTH_DESK_PICTURES.includes(r)) return "screenshots of the Growth Desk";
  /* Under shots/, only the two screenshots per look the gallery shows. */
  const shots = r.match(/^templates\/[^/]+\/shots(\/.*)?$/);
  if (shots) {
    const below = shots[1] ?? "";
    if (below === "" || below === "/desktop" || below === "/mobile") return null;
    return /^\/(desktop|mobile)\/home-01\.jpg$/.test(below) ? null : "screenshots under templates/*/shots/";
  }
  return null;
}

const REQUIRED = [
  "index.html",
  "shared/crisis-words.js",
  "shared/hope-demo.js",
  "shared/notes-data.js",
  "shared/notes-site.js",
  "platform",
];
const templates = readdirSync(join(SOURCE, "templates"))
  .filter((slug) => statSync(join(SOURCE, "templates", slug)).isDirectory())
  .map((slug) => `templates/${slug}`);

const STAGE = mkdtempSync(join(tmpdir(), "ministry-demo-"));
process.on("exit", () => rmSync(STAGE, { recursive: true, force: true }));

/** @type {Map<string, string[]>} reason -> files */
const skipped = new Map();
const copy = (from) => {
  const source = join(SOURCE, from);
  if (!existsSync(source)) fail(`${from} is not in ${SOURCE}.`);
  cpSync(source, join(STAGE, from), {
    recursive: true,
    filter: (path) => {
      const r = rel(path);
      const why = r ? leftOut(r) : null;
      if (why) {
        if (!statSync(path).isDirectory()) skipped.set(why, [...(skipped.get(why) ?? []), r]);
        else skipped.set(why, [...(skipped.get(why) ?? []), `${r}/`]);
      }
      return !why;
    },
  });
};

for (const from of REQUIRED) copy(from);
for (const from of templates) copy(from);

/** Every file under a folder, relative to it, with forward slashes. */
function walk(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [relative(base, full).split(sep).join("/")];
  });
}

/* ── the public edits ──────────────────────────────────────────────── */

const editReport = [];
if (!withGrowthDesk) {
  for (const [file, edits] of Object.entries(PUBLIC_EDITS)) {
    const path = join(STAGE, file);
    if (!existsSync(path)) fail(`${file} has public edits but was not copied.`);
    let result;
    try {
      result = applyEdits(file, readFileSync(path, "utf8"), edits);
    } catch (error) {
      fail(`${error instanceof Error ? error.message : String(error)}\n  The source changed. Update PUBLIC_EDITS in scripts/ministry-demo-public.mjs.`);
    }
    writeFileSync(path, result.text);
    editReport.push({ file, lines: result.report });
  }
}

/* ── the three plans ───────────────────────────────────────────────── */

/* The source names the plans and their prices itself. They must be the ones
   /ministry shows, word for word, or the sync stops (planProblems). */
if (!withGrowthDesk) {
  const data = join(STAGE, ...PLAN_DATA.split("/"));
  const wrong = existsSync(data) ? planProblems(readFileSync(data, "utf8")) : [`${PLAN_DATA} was not copied`];
  if (wrong.length) {
    fail(
      `the plans in ${PLAN_DATA} are not the ones /ministry shows:\n  ${wrong.join("\n  ")}\n` +
        "  Update MINISTRY_PLANS in scripts/ministry-demo-public.mjs and ministryLevels in lib/ministryPage.ts together, or fix the source.",
    );
  }
}

/* Hope's fees, contract and cancel answers must state the terms /ministry
   shows: no setup fee, month to month (termsProblems). */
if (!withGrowthDesk) {
  const wrong = TERMS_FILES.flatMap((file) => {
    const at = join(STAGE, ...file.split("/"));
    return existsSync(at) ? termsProblems(readFileSync(at, "utf8"), file) : [`${file} was not copied`];
  });
  if (wrong.length) {
    fail(
      `Hope's terms are not the ones /ministry shows (no setup fee, month to month):\n  ${wrong.join("\n  ")}\n` +
        "  Fix the source, or update TERMS_WORDS in scripts/ministry-demo-public.mjs and ministryLevels in lib/ministryPage.ts together.",
    );
  }
}

/* ── noindex on every page ─────────────────────────────────────────── */

const files = walk(STAGE);
const pages = files.filter((file) => /\.html?$/i.test(file));
let stamped = 0;
for (const page of pages) {
  const path = join(STAGE, page);
  let html = readFileSync(path, "utf8");
  const robots = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*>/i);
  if (!robots) {
    /* Right after <head>, or after the charset when it comes first. */
    const charset = html.match(/<meta\s+charset=[^>]*>/i);
    if (charset) html = html.replace(charset[0], `${charset[0]}${NOINDEX}`);
    else if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (head) => `${head}${NOINDEX}`);
    else html = `${NOINDEX}\n${html}`;
    stamped++;
  } else if (!/noindex/i.test(robots[0])) {
    html = html.replace(robots[0], NOINDEX);
    stamped++;
  } else continue;
  writeFileSync(path, html);
}

/* ── checks ────────────────────────────────────────────────────────── */

const problems = [];
/* The sample church sites: every form is a filled-in sample that ends in
   "Demo only. Nothing was sent.", and no confirmation promises that a real
   person got the visitor's details (a sign-up "on the list", a staff email). */
function readonlyProblems(text) {
  const out = [];
  for (const tag of text.match(/<(?:input|textarea)\b[^>]*>/gi) || []) {
    if (/\btype=["']?(?:radio|checkbox|hidden|submit|button)\b/i.test(tag)) continue;
    if (!/\breadonly\b/i.test(tag)) out.push(`has a field a visitor can type in: ${tag.slice(0, 80)}`);
  }
  return out;
}
function demoFormProblems(file, text) {
  /* The brand boards' sample email fields are read-only samples that say so. */
  if (/^templates\/[^/]+\/brand-board\.html$/.test(file)) {
    const out = readonlyProblems(text);
    if (!/Demo only: a sample email is filled in\. Nothing is sent\./.test(text)) out.push('has no "Demo only: a sample email is filled in." note');
    return out;
  }
  /* The member sign-in never shows a typed email back: the email is the read-only
     sample you@example.com, and step 2 says nothing was sent. */
  if (file === "platform/member-signin.html") {
    const out = [];
    const input = /<input\b[^>]*\bid="ms-email-input"[^>]*>/i.exec(text);
    if (!input || !/\breadonly\b/i.test(input[0]) || !/\bvalue="you@example\.com"/i.test(input[0])) out.push("has a sign-in email a visitor can type in (it must be the read-only sample you@example.com)");
    if (!/Demo only: a sample email is filled in\. Nothing is sent\./.test(text)) out.push('has no "Demo only: a sample email is filled in. Nothing is sent." note');
    if (!/Demo only\. Nothing was sent\. On a real church site, we would email a <span class="ms-nw">6-digit<\/span> code to <b id="ms-sent-to">you@example\.com<\/b>\./.test(text)) out.push("step 2 does not say Demo only. Nothing was sent. On a real church site, we would email a 6-digit code to you@example.com.");
    if (/We sent a\b|"Code sent to " \+/.test(text)) out.push('still says "We sent a" code, or shows a typed email in a toast');
    return out;
  }
  /* Member messages: the 911 and 988 line comes before the message box in the
     new message form and in the reply. */
  if (file === "platform/member-messages.html") {
    const out = [];
    const help = text.indexOf('id="mm-urgent-2"'), box = text.indexOf('id="mm-text-in"');
    if (help < 0 || box < 0 || help > box) out.push("the 911 and 988 line is not before the new message box");
    if (!/mm-foot"\)\.innerHTML = '<p class="m-note mm-help" id="mm-reply-help"/.test(text)) out.push("the 911 and 988 line is not first in the reply");
    return out;
  }
  if (!/^templates\/[^/]+\/index\.html$/.test(file)) return [];
  const out = [];
  if (!/Demo only\. Nothing was sent\./.test(text)) out.push('has no "Demo only. Nothing was sent." confirmation');
  const promise = /You are on the list|first letter arrives|will email you by tomorrow/.exec(text);
  if (promise) out.push(`still promises "${promise[0]}"`);
  for (const tag of text.match(/<(?:input|textarea)\b[^>]*>/gi) || []) {
    if (/\btype=["']?(?:radio|checkbox|hidden|submit|button)\b/i.test(tag)) continue;
    if (!/\breadonly\b/i.test(tag)) out.push(`has a field a visitor can type in: ${tag.slice(0, 80)}`);
  }
  return out;
}
const copiedSet = new Set(files);
for (const file of files) {
  if (!withGrowthDesk && (GROWTH_DESK_FILES.test(file) || GROWTH_DESK_PICTURES.includes(file))) {
    problems.push(`${file} is part of the Growth Desk`);
  }
  if (!TEXT.test(file)) continue;
  const text = readFileSync(join(STAGE, file), "utf8");
  if (!withGrowthDesk) {
    for (const ref of growthDeskRefs(text, file)) {
      problems.push(`${file}:${ref.line} names ${ref.what}: "${ref.match}" in ...${ref.context}...`);
    }
    for (const url of siteRefs(file, text)) {
      if (!SITE_LINKS.includes(url)) problems.push(`${file} links to ${url} on geai.us; the public copy may only link to ${SITE_LINKS.join(", ")}`);
    }
    for (const ref of oldPlanRefs(text, file)) {
      problems.push(`${file}:${ref.line} still has ${ref.what}: "${ref.match}" in ...${ref.context}... (the source must name the plans)`);
    }
  }
  for (const ref of localRefs(file, text)) {
    if (!copiedSet.has(ref)) problems.push(`${file} points at ${ref}, which was not copied`);
  }
  for (const error of scriptErrors(file, text)) problems.push(`does not compile: ${error}`);
  for (const why of demoFormProblems(file, text)) problems.push(`${file} ${why}`);
}
for (const page of pages) {
  if (!/<meta\s+[^>]*name=["']robots["'][^>]*noindex/i.test(readFileSync(join(STAGE, page), "utf8"))) {
    problems.push(`${page} has no robots noindex meta`);
  }
}
/* The public copy must be clean. A private copy is only looked at, so its
   problems (usually in Growth Desk pages still being built) are listed and
   the copy is made anyway. */
if (problems.length && !withGrowthDesk) {
  console.error(`sync-ministry-demo: the copy has ${problems.length} problems, so ${DEST} was left as it was:`);
  for (const line of problems.slice(0, 60)) console.error(`  ${line}`);
  if (problems.length > 60) console.error(`  ... and ${problems.length - 60} more`);
  process.exit(1);
}

/* ── put the copy in place ─────────────────────────────────────────── */

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });
cpSync(STAGE, DEST, { recursive: true });
if (withGrowthDesk) writeFileSync(join(DEST, PRIVATE_MARK), "A private copy of the Genesis Ministry demo, with the Growth Desk. Never publish it.\n");

/* ── the report ────────────────────────────────────────────────────── */

const where = inside(ROOT, DEST) ? relative(ROOT, DEST).split(sep).join("/") : DEST;
console.log(`${withGrowthDesk ? "Private copy, with the Growth Desk" : "Public copy"} in ${where}/`);
console.log(`  ${files.length} files, ${pages.length} HTML pages, noindex added to ${stamped}.`);
console.log("  Not copied (DESIGN.md section 12): tools/, voice-samples/, brand/, BASELINE.md, LAUNCH.md, README.md, shared/test.html, shared/hope-check.html, templates/PHOTO-CLAIMS.txt.");
for (const [why, list] of skipped) {
  const shown = list.length > 6 ? `${list.slice(0, 6).join(", ")} and ${list.length - 6} more` : list.join(", ");
  console.log(`  Left out ${why}: ${list.length} ${list.length === 1 ? "entry" : "entries"} (${shown}).`);
}
if (editReport.length) {
  const total = editReport.reduce((n, { lines }) => n + lines.length, 0);
  console.log(`  ${total} edits to the public copy:`);
  for (const { file, lines } of editReport) {
    console.log(`    ${file}`);
    for (const line of lines) console.log(`      ${line}`);
  }
  console.log("  Checked: the plans, prices and staff logins are the ones /ministry shows (Care $149 with 2, Shepherd $299 with 5, Plus $499 with 15).");
  console.log("  Checked: no public file keeps a Level 01 to 03 label, a draft level note or pricing set with Genesis.");
  console.log('  Checked: no public file names a sales-* page, the words "Growth Desk" or the Growth Desk\'s work.');
  console.log(`  Checked: the only geai.us link is ${SITE_LINKS.join(", ")}, by its path.`);
}
if (problems.length) {
  console.warn(`  ${problems.length} ${problems.length === 1 ? "problem" : "problems"} in this private copy:`);
  for (const line of problems.slice(0, 60)) console.warn(`    ${line}`);
} else console.log("  Checked: every local link resolves, every script compiles, every page is noindex.");
