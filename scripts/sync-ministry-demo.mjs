/*
 * Copies the Genesis Ministry previews into public/ministry-demo/, where the
 * /ministry page links to them:
 *
 *   /ministry-demo/index.html                     the four looks, side by side
 *   /ministry-demo/templates/<slug>/index.html    each look, with a made up church
 *   /ministry-demo/platform/index.html            the platform hub
 *   /ministry-demo/platform/index.html?tour=1     the guided demo
 *
 * What is copied from the source folder: index.html, shared/, platform/, and
 * every templates/<slug>/ folder except its shots/mobile/ screenshots. No
 * Markdown file is copied from anywhere. The destination is replaced on each
 * run, so a file removed from the source disappears here too.
 *
 * Every copied HTML page is made noindex: the previews show made up churches
 * and must never be indexed as real ones. robots.txt also disallows the
 * folder (app/robots.ts).
 *
 *   node scripts/sync-ministry-demo.mjs [source folder]
 *
 * The source defaults to MINISTRY_DEMO_SOURCE, then to the owner's working
 * copy. Review the result with `git status` before committing it.
 */
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SOURCE = "C:/Users/vasts/OneDrive/Desktop/HCSA Website/genesis-ministry";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(process.argv[2] || process.env.MINISTRY_DEMO_SOURCE || DEFAULT_SOURCE);
const DEST = join(ROOT, "public", "ministry-demo");

const NOINDEX = '<meta name="robots" content="noindex">';

function fail(message) {
  console.error(`sync-ministry-demo: ${message}`);
  process.exit(1);
}

if (!existsSync(join(SOURCE, "index.html"))) {
  fail(`no index.html in ${SOURCE}. Pass the genesis-ministry folder as the first argument.`);
}
/* Never let a bad argument point the clean-up anywhere but our own folder. */
if (relative(join(ROOT, "public"), DEST) !== "ministry-demo") fail(`refusing to write to ${DEST}`);

/** Path segments of a source file, relative to the source root, with forward slashes. */
const rel = (path) => relative(SOURCE, path).split(sep).join("/");

/** Whether a source path should be copied. */
function wanted(path) {
  const r = rel(path);
  if (r === "") return true;
  if (/\.md$/i.test(r)) return false;
  if (/^templates\/[^/]+\/shots\/mobile(\/|$)/.test(r)) return false;
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
if (existsSync(join(SOURCE, "templates"))) {
  for (const slug of readdirSync(join(SOURCE, "templates"))) {
    if (statSync(join(SOURCE, "templates", slug)).isDirectory()) copy(`templates/${slug}`);
  }
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
if (missing.size) {
  console.warn(`  ${missing.size} local references point at files that were not copied:`);
  for (const line of [...missing].slice(0, 40)) console.warn(`    ${line}`);
}
