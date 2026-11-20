import assert from "node:assert/strict";
import test from "node:test";
import { editions, ministryEdition } from "../lib/editions.ts";
import { FUNDING_LINE } from "../lib/legal.ts";
import {
  ministryConsultationNote,
  ministryConsultationNotes,
  ministryDemo,
  ministryFaq,
  ministryHero,
  ministryLevels,
  ministryLooks,
  ministryMedia,
  ministryPlatform,
  ministryProcess,
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
  }
  assert.match(ministryMedia.demo.captions, /\.vtt$/);
});

test("the draft levels show no prices and each books a consultation", () => {
  assert.deepEqual(
    ministryLevels.levels.map((level) => level.name),
    ["Welcome", "Connect", "Shepherd", "Enterprise"],
  );
  assert.equal(ministryLevels.priceLine, "Pricing set with Genesis");
  for (const level of ministryLevels.levels) {
    assert.equal(level.action.label, "Book a Consultation");
    assert.ok(level.action.href.startsWith("/contact?topic=ministry"), level.action.href);
    assert.ok(ministryConsultationNote(new URL(level.action.href, "https://x.test").searchParams.get("topic")));
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
