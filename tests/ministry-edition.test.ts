import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { isNavGroup, navigation, navigationLinks, uniqueByHref } from "../lib/content.ts";
import { allEditions, editions, ministryEdition } from "../lib/editions.ts";
import { FUNDING_LINE } from "../lib/legal.ts";
import {
  MINISTRY_OPERATION_TYPE,
  isMinistryTopic,
  isWebsiteCheckTopic,
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
  ministryPriceAnswer,
  ministryProcess,
  ministryProtection,
  ministryWalkthrough,
  ministryWebsiteCheck,
} from "../lib/ministryPage.ts";
import * as ministryPage from "../lib/ministryPage.ts";
import { ministryServiceSchema } from "../lib/schema.ts";
import { absoluteUrl, fullTitle, seoPage } from "../lib/seo.ts";
import { MINISTRY_PLANS, PRICE_ANSWER } from "../scripts/ministry-demo-public.mjs";

/* The three dash characters that must never appear in visitor copy. */
const DASHES = ["-", "–", "—"];
/* Any emoji or pictographic character is banned from visitor copy. */
const EMOJI = /\p{Extended_Pictographic}/u;
/* Anything that reads like a price: a currency, "per month", "a month", a trial or a setup fee. */
const PRICE = /[$€£]|\bper month\b|\ba month\b|\bfree trial\b|\bsetup\b/i;
/* The only amounts Ministry may print are the three plan prices. */
const PLAN_AMOUNTS = ["$149", "$299", "$499"];
/** Where a price may appear: the plan cards, the price sentence and what is built from them. */
function mayShowPrice(path: string, text: string): boolean {
  if (/^ministryLevels\.(levels\[\d\]\.priceDisplay|priceUnit)$/.test(path)) return true;
  if (/^ministryConsultationNotes\.ministry-(care|shepherd|plus)$/.test(path)) return true;
  /* The line under the hero buttons: the first plan's price, built from the plans. */
  if (path === "ministryPlansCue.line") return text === `Plans from ${ministryLevels.levels[0].priceDisplay} a month.`;
  return text.includes(ministryPriceAnswer);
}

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

test("Ministry is Edition 05: its own card, not one of the four business editions", () => {
  assert.equal(ministryEdition.no, "05");
  assert.equal(ministryEdition.href, "/ministry");
  assert.equal(ministryEdition.name, "Genesis Ministry");
  assert.equal(editions.length, 4, "the four business editions share the funding line and the assessment");
  assert.ok(!editions.some((edition) => edition.href === "/ministry"));
  assert.equal(ministryEdition.points.length, 3);
  /* allEditions is every edition, Ministry last: the homepage, the navigation and the footer. */
  assert.deepEqual(allEditions.map((edition) => edition.href), [...editions.map((edition) => edition.href), "/ministry"]);
});

test("the homepage features Ministry as a fifth edition card, built like the other four, with its plans", () => {
  const story = readFileSync(join(process.cwd(), "components", "home", "story", "StorySections.tsx"), "utf8");
  /* All five editions from one list, Ministry last, with one card structure (three across, then two). */
  assert.match(story, /allEditions\.map/);
  assert.match(story, /Edition \{e\.no\}/);
  /* Disclaimers live in the footer and on each edition page, not stacked under the cards. */
  assert.doesNotMatch(story, /\{ministryEdition\.disclaimer\}/);
  assert.doesNotMatch(story, /FUNDING_LINE/);
  /* Its plans start where the plan cards say, in the other cards' words: "From $149 a month", built from ministryLevels. */
  assert.match(story, /`From \$\{ministryLevels\.levels\[0\]\.priceDisplay\} a month`/);
  /* The same structure as the other cards: no mark of its own, so the G is not repeated per card. */
  assert.doesNotMatch(story, /\/brand\/mark-gold-on-light\.svg/);
  /* The Levels block names the church plans too, linked to /ministry#levels. */
  assert.match(story, /href=\{`\$\{ministryEdition\.href\}#levels`\}/);
});

test("the navigation lists every edition once, features the assessment, and the footer lists each link once", () => {
  const editionsGroup = navigation.find((entry) => entry.label === "Editions");
  assert.ok(editionsGroup && isNavGroup(editionsGroup), "an Editions dropdown");
  assert.deepEqual(editionsGroup.items.map((item) => item.href), allEditions.map((edition) => edition.href));
  for (const item of editionsGroup.items) assert.ok(item.description, `${item.href} has a line`);
  /* The feature is the next step for every edition; Ministry is listed once. */
  assert.equal(editionsGroup.feature?.href, "/assessment");
  assert.equal(editionsGroup.items.filter((item) => item.href === "/ministry").length, 1);
  assert.equal(editionsGroup.items.find((item) => item.href === "/ministry")?.description, "For churches.");
  for (const text of [editionsGroup.feature?.title, editionsGroup.feature?.description, editionsGroup.feature?.action, ...editionsGroup.items.flatMap((item) => [item.label, item.description])]) {
    for (const dash of DASHES) assert.equal(String(text).includes(dash), false, `nav copy has "${dash}": ${text}`);
    assert.equal(EMOJI.test(String(text)), false);
  }
  const links = [...editionsGroup.items, { label: "Again", href: "/ministry" }, ...navigationLinks(navigation)];
  const unique = uniqueByHref(links);
  assert.equal(new Set(unique.map((link) => link.href)).size, unique.length);
  assert.equal(unique.filter((link) => link.href === "/ministry")[0].label, "Ministry");
  const footer = readFileSync(join(process.cwd(), "components", "layout", "Footer.tsx"), "utf8");
  assert.match(footer, /uniqueByHref\(/);
});

test("Ministry is software for churches, not funding", () => {
  assert.notEqual(ministryEdition.disclaimer, FUNDING_LINE);
  assert.match(ministryEdition.disclaimer, /^Genesis is software\./);
});

test("the hero books a call, then opens the guided demo", () => {
  /* The house label for the church conversion, everywhere: the page, the header and the assessment. */
  assert.equal(ministryHero.primary.label, "Book a Call");
  assert.equal(ministryContact.form.submit, "Book a Call");
  const header = readFileSync(join(process.cwd(), "components", "layout", "Header.tsx"), "utf8");
  /* The header books the same call the page does, from the same place, and lands on the form. */
  assert.match(header, /return ministryHero\.primary;/);
  assert.equal(ministryHero.primary.href, "/contact?topic=ministry#consultation-form");
  assert.doesNotMatch(JSON.stringify(ministryPage), /Book a Consultation/);
  assert.match(ministryHero.primary.href, /^\/contact\b/);
  assert.equal(ministryHero.secondary.label, "Take the Guided Demo");
  /* The guided demo starts as Lampstand Church, the sample church in the stills. */
  assert.equal(ministryHero.secondary.href, "/ministry-demo/platform/index.html?tour=1&church=bold-dark&pace=short");
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

test("the three plans are Care, Shepherd and Plus at $149, $299 and $499 a month", () => {
  assert.deepEqual(
    ministryLevels.levels.map((plan) => [plan.id, plan.name, plan.monthlyPriceUsd, plan.priceDisplay]),
    [
      ["care", "Care", 149, "$149"],
      ["shepherd", "Shepherd", 299, "$299"],
      ["plus", "Plus", 499, "$499"],
    ],
  );
  for (const plan of ministryLevels.levels) {
    assert.equal(plan.priceDisplay, `$${plan.monthlyPriceUsd}`, `${plan.name} prints the price it is sold at`);
  }
  assert.equal(ministryLevels.priceUnit, "per month");
  assert.equal(ministryLevels.eyebrow, "Choose your plan");
  assert.doesNotMatch(JSON.stringify(ministryLevels), /Welcome"|Connect"|Level 0|Pricing set|set with Genesis/);
});

test("each plan and Enterprise books a call that names what was picked", () => {
  for (const action of [...ministryLevels.levels.map((plan) => plan.action), ministryLevels.enterprise.action]) {
    assert.equal(action.label, "Book a Call");
    assert.ok(action.href.startsWith("/contact?topic=ministry"), action.href);
    assert.ok(noteFor(action.href), `${action.href} opens with no starting note`);
  }
  assert.deepEqual(
    ministryLevels.levels.map((plan) => noteFor(plan.action.href)),
    [
      "Genesis Ministry, the Care plan at $149 a month. ",
      "Genesis Ministry, the Shepherd plan at $299 a month. ",
      "Genesis Ministry, the Plus plan at $499 a month. ",
    ],
  );
  /* The draft level topics are gone. */
  for (const old of ["ministry-welcome", "ministry-connect"]) assert.equal(ministryConsultationNote(old), "", old);
  /* Enterprise, for more than one campus, stays scoped on a call, with no price. */
  assert.equal(ministryLevels.enterprise.name, "Enterprise");
  assert.match(ministryLevels.enterprise.line, /more than one campus/i);
  assert.match(ministryLevels.enterprise.line, /scoped with you on a call/);
  assert.doesNotMatch(ministryLevels.enterprise.line + noteFor(ministryLevels.enterprise.action.href), PRICE);
});

test("each plan keeps exactly what its draft level included", () => {
  /* Care was Level 01 (Welcome), Shepherd was Level 02 (Connect), Plus was Level 03 (Shepherd).
     Sunday sermon notes come with every plan; daily devotionals, with email, from Shepherd. */
  assert.deepEqual(
    ministryLevels.levels.map((plan) => [plan.summary, [...plan.bullets]]),
    [
      [
        "Everything a guest sees first.",
        [
          "Website in one of four looks",
          "Brand board",
          "Social marketing plan",
          "Hope on your website",
          "Plan a Visit and prayer forms by email",
          "Newsletter sign up",
          "Sunday sermon notes on your website",
        ],
      ],
      [
        "Every guest followed up.",
        [
          "Everything in Care",
          "The Today view",
          "One list of every new guest",
          "Member app",
          "Care inbox",
          "Team roles, with your prayer team named",
          "Hope drafts that wait for approval",
          "Daily devotionals, in the member app and by email",
        ],
      ],
      [
        "Care for every person, over time.",
        [
          "Everything in Shepherd",
          "Person pages",
          "A record of who opened each person's page",
          "Spiritual gifts, with a church wide view for pastors",
          "Reports",
          "Custom roles and named gift viewers",
          "More staff seats",
        ],
      ],
    ],
  );
});

test("the price sentence is the same on the page and in the demo", () => {
  assert.equal(
    ministryPriceAnswer,
    "Genesis Ministry has three plans: Care at $149 a month, Shepherd at $299 a month and Plus at $499 a month.",
  );
  assert.equal(PRICE_ANSWER, ministryPriceAnswer);
  assert.deepEqual(
    MINISTRY_PLANS.map((plan) => [plan.name, plan.price]),
    ministryLevels.levels.map((plan) => [plan.name, plan.priceDisplay]),
  );
  /* The demo's draft levels map to the plans in order. */
  assert.deepEqual(
    MINISTRY_PLANS.map((plan) => `${plan.level} ${plan.was}`),
    ["01 Welcome", "02 Connect", "03 Shepherd"],
  );
});

test("the questions give the prices, and no setup fee is named", () => {
  const cost = ministryFaq.items.find((item) => item.question === "What does Genesis Ministry cost?");
  assert.ok(cost, "there is a price question");
  assert.ok(cost.answer.startsWith(ministryPriceAnswer), cost.answer);
  assert.match(cost.answer, /Enterprise is scoped with you on a call/);
  const custom = ministryFaq.items.find((item) => /customization/i.test(item.question));
  assert.ok(custom);
  assert.doesNotMatch(custom.answer, /set with Genesis|on a call/);
  assert.doesNotMatch(JSON.stringify(ministryPage), /setup fee|set up fee|one time fee/i);
});

test("the structured data carries the three plans at the prices the cards print", () => {
  const service = ministryServiceSchema();
  assert.equal(service["@type"], "Service");
  assert.equal(service.url, absoluteUrl("/ministry"));
  const offers = service.hasOfferCatalog.itemListElement;
  assert.deepEqual(
    offers.map((offer) => [offer.name, offer.price, offer.priceCurrency, offer.priceSpecification.unitText]),
    [
      ["Genesis Ministry Care", 149, "USD", "per month"],
      ["Genesis Ministry Shepherd", 299, "USD", "per month"],
      ["Genesis Ministry Plus", 499, "USD", "per month"],
    ],
  );
  for (const offer of offers) {
    assert.equal(offer.priceSpecification.price, offer.price);
    assert.equal(offer.url, `${absoluteUrl("/ministry")}#levels`);
  }
  const page = readFileSync(join(process.cwd(), "app", "(marketing)", "ministry", "page.tsx"), "utf8");
  assert.match(page, /ministryServiceSchema\(\)/);
});

test("the business pricing page points churches to the Ministry plans", () => {
  const pricing = readFileSync(join(process.cwd(), "app", "(marketing)", "pricing", "page.tsx"), "utf8");
  /* The same sentence as the plan cards, the demo and Hope: all three plans with their prices. */
  assert.match(pricing, /\{ministryPriceAnswer\} Enterprise, for more than one campus, is scoped on a call\./);
  assert.match(pricing, /href="\/ministry#levels">See the Ministry Plans</);
  /* Its own card with its own heading, so the business setup lines below never read as a church's. */
  assert.match(pricing, /Genesis Ministry, for churches/);
  assert.doesNotMatch(pricing.slice(pricing.indexOf("pricing-churches-title"), pricing.indexOf("</aside>")), /setup/i);
  assert.doesNotMatch(pricing, /set with Genesis on a call|Ministry Levels/);
  assert.match(seoPage("/ministry").description, /Plans from \$149 a month\./);
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
  assert.equal(form.company, "Church name");
  /* The executive pastor and the administrator, who often make this decision, each have a role. */
  assert.deepEqual([...form.roles], [
    "Senior or lead pastor",
    "Executive pastor",
    "Church administrator or operations",
    "Communications or guest services",
    "Other staff",
    "Volunteer",
  ]);
  assert.equal(MINISTRY_OPERATION_TYPE, "Church");
  assert.match(ministryContact.intro.description[0], /church/);
  /* Every Ministry topic link on the page opens the church version. */
  for (const topic of Object.keys(ministryConsultationNotes)) {
    assert.ok(ministryConsultationNote(topic), topic);
  }
  /* The church consultation names the plans in the same sentence as the page, then links to them. */
  assert.ok(ministryContact.aside.plans.line.startsWith(ministryPriceAnswer));
  assert.equal(ministryContact.aside.plans.link.href, "/ministry#levels");
  const contactPage = readFileSync(join(process.cwd(), "app", "(marketing)", "contact", "page.tsx"), "utf8");
  assert.match(contactPage, /church && !websiteCheck \?/);
  assert.match(contactPage, /ministryContact\.aside\.plans\.line/);
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

test("no copy string has a dash or an emoji, and prices only where the plans are", () => {
  assert.ok(allCopy.length > 100, "the walk found the page copy");
  let priced = 0;
  for (const { path, text } of allCopy) {
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `${path} contains "${dash}": ${text}`);
    }
    assert.equal(EMOJI.test(text), false, `${path} contains an emoji: ${text}`);
    if (!PRICE.test(text)) continue;
    priced++;
    assert.ok(mayShowPrice(path, text), `${path} reads like a price outside the plans: ${text}`);
    for (const amount of text.match(/\$[\d,.]+/g) ?? []) {
      assert.ok(PLAN_AMOUNTS.includes(amount), `${path} names ${amount}, which is not a plan price`);
    }
  }
  assert.ok(priced >= 8, "the plan prices were found");
});

test("the plans match the demo: team roles in Shepherd, custom roles in Plus", () => {
  const [care, shepherd, plus] = ministryLevels.levels.map((plan) => plan.bullets.join(" | "));
  assert.match(care, /Plan a Visit and prayer forms by email/);
  assert.match(care, /Newsletter sign up/);
  assert.match(shepherd, /Team roles/);
  assert.match(shepherd, /Hope drafts that wait for approval/);
  assert.match(plus, /Custom roles and named gift viewers/);
  assert.doesNotMatch(plus, /Team roles/);
  /* The demo hub and Hope's levels answer are checked in tests/ministry-demo-public.test.ts. */
});

test("the protection rules do not promise more than the product does", () => {
  const [prayer, approval] = ministryProtection.rules;
  assert.doesNotMatch(prayer.body, /Nobody else\.$/);
  assert.match(prayer.body, /in your church/);
  /* Each rule says which plan keeps it, as the demo hub does: the Care plan has no locked prayer
     inbox, no person pages and no access record. */
  const record = ministryProtection.rules[4];
  assert.equal("plan" in prayer ? prayer.plan : "", "Shepherd plan and up");
  assert.match(prayer.body, /On the Care plan, prayer forms go by email to the pastors' address only\./);
  /* The tag and the body agree: person pages and the record of opens start at Shepherd. */
  assert.equal("plan" in record ? record.plan : "", "Shepherd plan and up");
  assert.match(record.body, /recorded from the Shepherd plan/);
  /* Hope answers on the website and the crisis reply goes out on its own; the rule says so. */
  assert.match(approval.body, /Hope's answers/);
  assert.match(approval.body, /crisis reply/);
  assert.doesNotMatch(ministryEdition.points.join(" "), /every message/);
});

test("the Website Check opens its own version of the contact page", () => {
  assert.ok(isWebsiteCheckTopic("church-website-check"));
  assert.ok(!isWebsiteCheckTopic("ministry"));
  assert.ok(isMinistryTopic("church-website-check") && isMinistryTopic("ministry-demo"));
  assert.ok(!isMinistryTopic("pricing") && !isMinistryTopic(undefined));
  assert.equal(noteFor(ministryWebsiteCheck.action.href), "Free Church Website Check. ");

  const check = ministryContact.websiteCheck;
  assert.match(check.intro.title, /Website Check/);
  assert.equal(check.form.submit, "Request My Website Check");
  assert.equal(check.form.website, "Church Website");
  assert.deepEqual([...check.aside.areas], [...ministryWebsiteCheck.checks]);
  assert.doesNotMatch(ministryWebsiteCheck.note, /notes field/);
});

test("a church picks a church staff size, and the consultation route accepts it", () => {
  const sizes = [...ministryContact.form.staffSizes];
  assert.deepEqual(sizes, ["1 or 2", "3 to 5", "6 to 15", "16 or more"]);
  const route = readFileSync(join(process.cwd(), "app", "api", "consultation", "route.ts"), "utf8");
  assert.match(route, /\.\.\.ministryContact\.form\.staffSizes/);
  const form = readFileSync(join(process.cwd(), "app", "(marketing)", "contact", "ConsultationForm.tsx"), "utf8");
  assert.match(form, /churchForm\.staffSizes\.map/);
  /* The Website Check's address field is not named "website": that is the route's honeypot. */
  assert.match(form, /name="church_website"/);
  assert.match(route, /if \(data\.website\)/);
});

test("each film also has a 3:4 phone still, 1170 by 1560", () => {
  for (const [id, media] of Object.entries(ministryMedia)) {
    assert.equal(media.posterPhone, media.poster.replace(/\.jpg$/, "-phone.jpg"), id);
    const file = join(process.cwd(), "public", media.posterPhone);
    assert.ok(existsSync(file), `${id}: ${media.posterPhone} is missing`);
    assert.deepEqual(jpegSize(readFileSync(file)), { width: 1170, height: 1560 }, `${id}: ${media.posterPhone}`);
  }
});
