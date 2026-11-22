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
 *   - index.html (the gallery), early-look.jpg, four-looks.jpg and
 *     geai-ministry-page.jpg;
 *   - shared/hope-demo.js;
 *   - platform/, without platform/DESIGN.md;
 *   - templates/<slug>/ for each look, without its shots/, except the two
 *     screenshots per look the gallery shows (shots/desktop/home-01.jpg and
 *     shots/mobile/home-01.jpg), and without the *.mjs build tools.
 * Everything else (tools/, voice-samples/, BASELINE.md, shared/test.html,
 * templates/PHOTO-CLAIMS.txt) stays out.
 *
 * The default is the public copy. The Growth Desk (platform/sales-*, with the
 * two hub door screenshots of it) is Genesis's own tool for finding and
 * selling to churches, and the owner keeps it out of the public demo. The
 * public copy leaves those files out, and scripts/ministry-demo-public.mjs
 * edits the copied pages and scripts so nothing links to it, tours it or
 * points at it. Each edit must find its text exactly, or the script stops.
 * The source is never changed.
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
 *   - a public file still names a sales-* page or the words "Growth Desk";
 *   - a copied page, stylesheet or platform script points at a local file
 *     that was not copied;
 *   - a copied script, or a page's inline script, does not compile.
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
  PUBLIC_EDITS,
  applyEdits,
  growthDeskRefs,
  localRefs,
  scriptErrors,
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

/* The gallery's pictures that nothing links to: copied when present, as
   section 12 asks, and not required. */
const OPTIONAL = ["early-look.jpg", "four-looks.jpg", "geai-ministry-page.jpg"];
const REQUIRED = ["index.html", "shared/hope-demo.js", "platform"];
const templates = readdirSync(join(SOURCE, "templates"))
  .filter((slug) => statSync(join(SOURCE, "templates", slug)).isDirectory())
  .map((slug) => `templates/${slug}`);

const STAGE = mkdtempSync(join(tmpdir(), "ministry-demo-"));
process.on("exit", () => rmSync(STAGE, { recursive: true, force: true }));

/** @type {Map<string, string[]>} reason -> files */
const skipped = new Map();
const copy = (from, required) => {
  const source = join(SOURCE, from);
  if (!existsSync(source)) {
    if (required) fail(`${from} is not in ${SOURCE}.`);
    console.warn(`  ${from} is not in the source; nothing links to it, so the copy goes on without it.`);
    return;
  }
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

for (const from of REQUIRED) copy(from, true);
for (const from of OPTIONAL) copy(from, false);
for (const from of templates) copy(from, true);

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
const copiedSet = new Set(files);
for (const file of files) {
  if (!withGrowthDesk && (GROWTH_DESK_FILES.test(file) || GROWTH_DESK_PICTURES.includes(file))) {
    problems.push(`${file} is part of the Growth Desk`);
  }
  if (!TEXT.test(file)) continue;
  const text = readFileSync(join(STAGE, file), "utf8");
  if (!withGrowthDesk) {
    for (const ref of growthDeskRefs(text)) {
      problems.push(`${file}:${ref.line} names ${ref.what}: "${ref.match}" in ...${ref.context}...`);
    }
  }
  for (const ref of localRefs(file, text)) {
    if (!copiedSet.has(ref)) problems.push(`${file} points at ${ref}, which was not copied`);
  }
  for (const error of scriptErrors(file, text)) problems.push(`does not compile: ${error}`);
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
console.log("  Not copied (DESIGN.md section 12): tools/, voice-samples/, BASELINE.md, shared/test.html, templates/PHOTO-CLAIMS.txt.");
for (const [why, list] of skipped) {
  const shown = list.length > 6 ? `${list.slice(0, 6).join(", ")} and ${list.length - 6} more` : list.join(", ");
  console.log(`  Left out ${why}: ${list.length} ${list.length === 1 ? "entry" : "entries"} (${shown}).`);
}
if (editReport.length) {
  const total = editReport.reduce((n, { lines }) => n + lines.length, 0);
  console.log(`  ${total} edits so nothing public points at the Growth Desk:`);
  for (const { file, lines } of editReport) {
    console.log(`    ${file}`);
    for (const line of lines) console.log(`      ${line}`);
  }
  console.log('  Checked: no public file names a sales-* page or the words "Growth Desk".');
}
if (problems.length) {
  console.warn(`  ${problems.length} ${problems.length === 1 ? "problem" : "problems"} in this private copy:`);
  for (const line of problems.slice(0, 60)) console.warn(`    ${line}`);
} else console.log("  Checked: every local link resolves, every script compiles, every page is noindex.");
