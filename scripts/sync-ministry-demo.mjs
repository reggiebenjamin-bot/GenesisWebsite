/*
 * Copies the Genesis Ministry previews into public/ministry-demo/, where the
 * /ministry page links to them, and refreshes the four look screenshots the
 * page shows:
 *
 *   /ministry-demo/index.html                     the four looks, side by side
 *   /ministry-demo/templates/<slug>/index.html    each look, with a made up church
 *   /ministry-demo/platform/index.html            the platform hub
 *   /ministry-demo/platform/index.html?tour=1     the guided demo
 *
 *   node scripts/sync-ministry-demo.mjs <genesis-ministry folder> [--looks-only] [--with-growth-desk]
 *
 * The source is the first argument, or MINISTRY_DEMO_SOURCE. There is no
 * default: the script stops if neither is given.
 *
 * What is copied: index.html, shared/, platform/ and every templates/<slug>/
 * folder. What is left out:
 *   - every Markdown file, and the build tools (*.mjs) kept beside a look;
 *   - every screenshot under shots/ except the one per look the gallery shows
 *     (shots/desktop/home-01.jpg and shots/mobile/home-01.jpg);
 *   - platform/sales-*, the Genesis Growth Desk. It is Genesis's own tool for
 *     finding and serving churches, not part of what a church buys, so it is
 *     not published unless the owner passes --with-growth-desk. The platform
 *     hub links to it: without the flag those links are listed at the end as
 *     files that were not copied.
 * The destination is replaced on each run, so a file removed from the source
 * disappears here too.
 *
 * Every copied HTML page is made noindex: the previews show made up churches
 * and must never be indexed as real ones. next.config.ts also sends
 * X-Robots-Tag: noindex for the whole folder. robots.txt deliberately does not
 * block it, so crawlers can read both.
 *
 * Every run also writes the four look cards' screenshots,
 * public/images/ministry/look-<slug>.jpg: the first 1440 by 900 of each look's
 * shots/desktop/home-01.jpg, so the cards on /ministry always match the
 * previews they open. --looks-only does just that and copies nothing else.
 *
 * Review the result with `git status` before committing it.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const sourceArg = args.find((arg) => !arg.startsWith("--")) || process.env.MINISTRY_DEMO_SOURCE;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = join(ROOT, "public", "ministry-demo");
const LOOKS_DEST = join(ROOT, "public", "images", "ministry");

/** The four looks, in page order. Must match ministryLooks in lib/ministryPage.ts. */
const LOOKS = ["bright-modern", "bold-dark", "classic-timeless", "warm-community"];
/** The first screen of each desktop screenshot, as the look cards show it. */
const CROP = { left: 0, top: 0, width: 1440, height: 900 };

const NOINDEX = '<meta name="robots" content="noindex">';

function fail(message) {
  console.error(`sync-ministry-demo: ${message}`);
  process.exit(1);
}

for (const flag of flags) {
  if (!["--looks-only", "--with-growth-desk"].includes(flag)) fail(`unknown option ${flag}`);
}
if (!sourceArg) {
  fail(
    "no source folder. Pass the genesis-ministry folder as the first argument, or set MINISTRY_DEMO_SOURCE.",
  );
}

const SOURCE = resolve(sourceArg);
if (!existsSync(join(SOURCE, "index.html")) || !existsSync(join(SOURCE, "templates"))) {
  fail(`${SOURCE} is not the genesis-ministry folder: it has no index.html or templates/.`);
}
/* Never let a bad argument point the clean-up anywhere but our own folder. */
if (relative(join(ROOT, "public"), DEST) !== "ministry-demo") fail(`refusing to write to ${DEST}`);

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
  console.log(`Wrote the four look screenshots into public/images/ministry/.`);
}

await writeLookCrops();
if (flags.has("--looks-only")) process.exit(0);

/* ── the previews ──────────────────────────────────────────────────── */

const withGrowthDesk = flags.has("--with-growth-desk");

/** Path segments of a source file, relative to the source root, with forward slashes. */
const rel = (path) => relative(SOURCE, path).split(sep).join("/");

/** Whether a source path should be copied. Folders return true so their contents are visited. */
function wanted(path) {
  const r = rel(path);
  if (r === "") return true;
  if (/\.(md|mjs)$/i.test(r)) return false;
  if (!withGrowthDesk && /^platform\/sales-/.test(r)) return false;
  /* Under shots/, only the one screenshot per look the gallery uses. */
  const shots = r.match(/^templates\/[^/]+\/shots(\/.*)?$/);
  if (shots) {
    const below = shots[1] ?? "";
    if (below === "" || below === "/desktop" || below === "/mobile") return true;
    return /^\/(desktop|mobile)\/home-01\.jpg$/.test(below);
  }
  return true;
}

rmSync(DEST, { recursive: true, force: true });

const copied = [];
const copy = (from) => {
  const source = join(SOURCE, from);
  if (!existsSync(source)) {
    console.warn(`  skipped ${from}: not in the source yet`);
    return;
  }
  cpSync(source, join(DEST, from), {
    recursive: true,
    filter: (path) => wanted(path),
  });
  copied.push(from);
};

copy("index.html");
copy("shared");
copy("platform");
for (const slug of readdirSync(join(SOURCE, "templates"))) {
  if (statSync(join(SOURCE, "templates", slug)).isDirectory()) copy(`templates/${slug}`);
}

/** Every file under a folder. */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

const files = existsSync(DEST) ? walk(DEST) : [];
const pages = files.filter((file) => /\.html?$/i.test(file));
let stamped = 0;
const missing = new Set();

for (const page of pages) {
  let html = readFileSync(page, "utf8");
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
  }
  writeFileSync(page, html);

  /* Report local files a page points at that did not come across. */
  for (const [, url] of html.matchAll(/(?:src|href)=["']([^"'#?]+)/gi)) {
    if (/^(?:[a-z]+:|\/\/|\/|data:)/i.test(url)) continue;
    const target = resolve(dirname(page), decodeURI(url));
    if (!existsSync(target)) missing.add(`${relative(DEST, page).split(sep).join("/")} -> ${url}`);
  }
}

console.log(`Copied ${copied.join(", ")} into public/ministry-demo/`);
console.log(`  ${files.length} files, ${pages.length} HTML pages, noindex added to ${stamped}.`);
if (!withGrowthDesk) console.log("  Left out platform/sales-* (the Growth Desk). Pass --with-growth-desk to publish it.");
if (missing.size) {
  console.warn(`  ${missing.size} local references point at files that were not copied:`);
  for (const line of [...missing].slice(0, 40)) console.warn(`    ${line}`);
}
