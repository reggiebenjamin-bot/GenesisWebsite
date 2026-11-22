import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { editions, ministryEdition } from "../lib/editions.ts";
import { FUNDING_LINE } from "../lib/legal.ts";
import {
  MINISTRY_OPERATION_TYPE,
  ministryConsultationNote,
  ministryConsultationNotes,
  ministryContact,
  ministryDemo,
  ministryDemoAction,
  ministryDemoFile,
  ministryFaq,
  ministryHero,
  ministryLevels,
  ministryLooks,
  ministryMedia,
  ministryPlatform,
  ministryProcess,
  ministryWalkthrough,
} from "../lib/ministryPage.ts";
import * as ministryPage from "../lib/ministryPage.ts";
import { fullTitle, seoPage } from "../lib/seo.ts";

/* The three dash characters that must never appear in visitor copy. */
const DASHES = ["-", "–", "—"];
/* Any emoji or pictographic character is banned from visitor copy. */
const EMOJI = /\p{Extended_Pictographic}/u;
/* Ministry has no public prices: no currency, no "per month", no "a month". */
const PRICE = /[$€£]|\bper month\b|\ba month\b|\bfree trial\b/i;

/** Every string reachable from a value, paired with the key path that reached it. */
function strings(value: unknown, path: string): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => strings(inner, `${path}.${key}`));
  }
  return [];
}

/** URLs, paths, slugs, ids and colors are not visitor copy. */
function isCopy(path: string, text: string): boolean {
  if (/^(https?:\/\/|\/)/.test(text)) return false;
  return !/\.(slug|id|href|image|video|poster|captions)$/.test(path);
}

const allCopy = [
  ...strings(ministryEdition, "ministryEdition"),
  ...Object.entries(ministryPage)
    .filter(([, value]) => typeof value !== "function")
    .flatMap(([name, value]) => strings(value, name)),
].filter(({ path, text }) => isCopy(path, text));

test("Ministry is Edition 05 and stays off the homepage edition list", () => {
  assert.equal(ministryEdition.no, "05");
  assert.equal(ministryEdition.href, "/ministry");
  assert.equal(ministryEdition.name, "Genesis Ministry");
  assert.equal(editions.length, 4, "the homepage keeps its four edition cards");
  assert.ok(!editions.some((edition) => edition.href === "/ministry"));
  assert.equal(ministryEdition.points.length, 3);
});

test("Ministry is software for churches, not funding", () => {
  assert.notEqual(ministryEdition.disclaimer, FUNDING_LINE);
  assert.match(ministryEdition.disclaimer, /^Genesis is software\./);
});

test("the hero books a consultation, then opens the guided demo", () => {
  assert.equal(ministryHero.primary.label, "Book a Consultation");
  assert.match(ministryHero.primary.href, /^\/contact\b/);
  assert.equal(ministryHero.secondary.label, "Take the Guided Demo");
  assert.equal(ministryHero.secondary.href, "/ministry-demo/platform/index.html?tour=1");
  assert.deepEqual(
    ministryEdition.ctas.map((cta) => cta.href),
    [ministryHero.primary.href, ministryHero.secondary.href],
  );
});

test("every link is an internal route", () => {
  for (const { path, text } of strings(ministryPage, "ministryPage")) {
    if (/\.href$/.test(path)) assert.ok(text.startsWith("/"), `${path} is not internal: ${text}`);
  }
  for (const cta of ministryEdition.ctas) assert.ok(cta.href.startsWith("/"), cta.href);
});

test("the four looks link to their previews and ship their screenshots", () => {
  assert.deepEqual(
    ministryLooks.items.map((look) => look.name),
    ["Bright and Modern", "Bold and Dark", "Classic and Timeless", "Warm Community"],
  );
  for (const look of ministryLooks.items) {
    assert.equal(ministryDemo.template(look.slug), `/ministry-demo/templates/${look.slug}/index.html`);
    assert.equal(look.image, `/images/ministry/look-${look.slug}.jpg`);
    assert.ok(look.alt.length > 40, `${look.name} needs real alt text`);
  }
});

test("the platform rows have their silent loops and the demo has captions", () => {
  assert.deepEqual(
    ministryPlatform.rows.map((row) => row.id),
    ["frontOffice", "backOffice", "memberApp"],
  );
  for (const row of ministryPlatform.rows) {
    const media = ministryMedia[row.id];
    assert.match(media.video, /^\/video\/ministry\/loop-[a-z-]+\.mp4$/);
    assert.equal(media.poster, media.video.replace(/\.mp4$/, ".jpg"));
    assert.ok(row.stillAlt.length > 40, `${row.id} needs alt text for its poster`);
  }
  assert.ok(ministryHero.stillAlt.length > 40, "the hero poster needs alt text");
  assert.match(ministryMedia.demo.captions, /\.vtt$/);
});

/** Width and height of a JPEG, from its first frame header. */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let at = 2;
  while (at + 9 < bytes.length) {
    if (bytes[at] !== 0xff) return null;
    const marker = bytes[at + 1];
    const length = bytes.readUInt16BE(at + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: bytes.readUInt16BE(at + 5), width: bytes.readUInt16BE(at + 7) };
    }
    at += 2 + length;
  }
  return null;
}

test("each film's poster is a 1920 by 1080 still in public/", () => {
  for (const [id, media] of Object.entries(ministryMedia)) {
    const file = join(process.cwd(), "public", media.poster);
    assert.ok(existsSync(file), `${id}: ${media.poster} is missing`);
    assert.deepEqual(jpegSize(readFileSync(file)), { width: 1920, height: 1080 }, `${id}: ${media.poster}`);
  }
});

/** The starting note a /contact link opens with. */
const noteFor = (href: string) => ministryConsultationNote(new URL(href, "https://x.test").searchParams.get("topic"));

test("the draft levels show no prices and each books a consultation", () => {
  assert.deepEqual(
    ministryLevels.levels.map((level) => level.name),
    ["Welcome", "Connect", "Shepherd"],
  );
  assert.deepEqual(
    ministryLevels.levels.map((level) => level.step),
    ["01", "02", "03"],
  );
  assert.equal(ministryLevels.priceLine, "Pricing set with Genesis");
  for (const action of [...ministryLevels.levels.map((level) => level.action), ministryLevels.enterprise.action]) {
    assert.equal(action.label, "Book a Consultation");
    assert.ok(action.href.startsWith("/contact?topic=ministry"), action.href);
    assert.ok(noteFor(action.href), `${action.href} opens with no starting note`);
  }
  assert.equal(ministryLevels.enterprise.name, "Enterprise");
  assert.match(ministryLevels.enterprise.line, /campus/);
});

test("the guided demo is linked only once its files are published", () => {
  assert.equal(ministryDemoFile(ministryDemo.tour), "/ministry-demo/platform/index.html");
  assert.equal(ministryDemoFile("/ministry-demo/index.html#looks"), "/ministry-demo/index.html");

  const published = ministryDemoAction((path) => path === "/ministry-demo/platform/index.html");
  assert.deepEqual(published, { label: "Take the Guided Demo", href: ministryDemo.tour, isDemo: true });

  const notYet = ministryDemoAction(() => false);
  assert.equal(notYet.isDemo, false);
  assert.equal(notYet.href, ministryWalkthrough.href);
  assert.ok(!notYet.href.startsWith("/ministry-demo/"));
  assert.ok(noteFor(notYet.href), "the walkthrough request opens with a starting note");
});

test("a church reaches a church version of the consultation form", () => {
  const { form } = ministryContact;
  assert.equal(form.company, "Church Name");
  assert.deepEqual([...form.roles], ["Senior pastor", "Church staff", "Volunteer"]);
  assert.equal(MINISTRY_OPERATION_TYPE, "Church");
  assert.match(ministryContact.intro.description[0], /church/);
  /* Every Ministry topic link on the page opens the church version. */
  for (const topic of Object.keys(ministryConsultationNotes)) {
    assert.ok(ministryConsultationNote(topic), topic);
  }
});

test("the process keeps the five shared stages", () => {
  assert.deepEqual(
    ministryProcess.steps.map((step) => step.title),
    ["Consultation", "Scoping", "Implementation", "Launch", "Managed Platform"],
  );
});

test("the questions answer what churches ask first", () => {
  const questions = ministryFaq.items.map((item) => item.question).join(" ");
  for (const topic of [/Planning Center/, /Subsplash/, /prayer/i, /AI/, /photos/, /customization/i]) {
    assert.match(questions, topic);
  }
  assert.match(ministryFaq.items[0].answer, /^No\./);
});

test("only known topics prefill the consultation note", () => {
  assert.equal(ministryConsultationNote("church-website-check"), ministryConsultationNotes["church-website-check"]);
  assert.equal(ministryConsultationNote("toString"), "");
  assert.equal(ministryConsultationNote("<script>"), "");
  assert.equal(ministryConsultationNote(["ministry"]), "");
  assert.equal(ministryConsultationNote(undefined), "");
});

test("the page is registered for search with its own title", () => {
  const page = seoPage("/ministry");
  assert.equal(page.label, "Ministry");
  assert.ok(fullTitle(page).length <= 60);
});

test("no copy string has a dash, an emoji or a price", () => {
  assert.ok(allCopy.length > 100, "the walk found the page copy");
  for (const { path, text } of allCopy) {
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
    }
    assert.equal(EMOJI.test(text), false, `${path} contains an emoji: ${text}`);
    assert.equal(PRICE.test(text), false, `${path} reads like a price: ${text}`);
  }
});
