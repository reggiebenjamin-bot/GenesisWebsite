import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HAWK_IMAGE_SRC, HAWK_IMAGE_SRCSET, HAWK_IMAGE_WIDTHS } from "../components/home/hawkAsset.ts";
import { aiEmployeePersonas } from "../lib/aiEmployees.ts";
import { GA_MEASUREMENT_ID_ENV, gaMeasurementId } from "../lib/analytics.ts";
import {
  CHURCH_PERSONA,
  assessmentFindings,
  assessmentSteps,
  churchFindings,
  churchSteps,
  levelGapNote,
  questionLabel,
  suggestedLevel,
} from "../lib/assessment.ts";
import { isPrefetchRequest } from "../lib/checkoutLink.ts";
import { bookACall, pricingFaqs } from "../lib/content.ts";
import { editionKeys, editionLevels, levelsFaqAnswer } from "../lib/editionPlans.ts";
import { ministryMeta, ministryPlanFromTopic } from "../lib/ministryPage.ts";
import { LENDER_PERSONA, REAL_ESTATE_TEAM_PERSONA, SERVICE_PERSONA } from "../lib/personas.ts";
import { enterpriseServiceSchema, offerDescription } from "../lib/schema.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const DASHES = ["-", "–", "—"];

test("a link prefetch never opens a Stripe Checkout Session", () => {
  const url = "https://www.geai.us/start/750?edition=lending";
  assert.equal(isPrefetchRequest(new Headers({ RSC: "1" }), url), true);
  assert.equal(isPrefetchRequest(new Headers({ "Next-Router-Prefetch": "1" }), url), true);
  assert.equal(isPrefetchRequest(new Headers({ "Sec-Purpose": "prefetch;prerender" }), url), true);
  assert.equal(isPrefetchRequest(new Headers(), `${url}&_rsc=abc`), true);
  assert.equal(isPrefetchRequest(new Headers(), url), false);
  /* The link entry runs the prefetch gate before it ever calls Stripe. */
  const start = read("lib/managedCheckoutStart.ts");
  const link = start.slice(start.indexOf("export async function startManagedCheckoutFromLink"));
  assert.ok(link.indexOf("gateCheckoutLink(") > 0 && link.indexOf("gateCheckoutLink(") < link.indexOf("startManagedCheckout(request"));
});

test("the business assessment is six steps plus the snapshot form, like the church path", () => {
  assert.equal(assessmentSteps.length, 6);
  assert.equal(churchSteps.length, 6);
  const pressure = assessmentSteps.find((step) => step.id === "pressure")!;
  assert.deepEqual(pressure.questions.map((question) => question.id), ["operational_pain_points", "desired_outcomes"]);
  const transfer = assessmentSteps.flatMap((step) => step.questions).find((question) => question.id === "manual_transfer_frequency")!;
  assert.equal(transfer.kind === "single" && transfer.optional, true);
});

test("the seat question sets the Level, and 6 to 25 says Level 02 may still fit", () => {
  const team = assessmentSteps[0].questions.find((question) => question.id === "team_size")!;
  assert.match(team.label, /use Genesis day to day/);
  const mid = suggestedLevel("business", "6 to 25");
  assert.equal(mid?.step, "03");
  assert.match(mid?.reason ?? "", /Level 02 fits instead/);
  assert.match(suggestedLevel("lending", "Just me")?.reason ?? "", /just you/);
});

test("questions use each edition's own nouns", () => {
  const documents = assessmentSteps.flatMap((step) => step.questions).find((question) => question.id === "document_storage")!;
  assert.match(questionLabel(documents, LENDER_PERSONA), /borrower files/);
  assert.match(questionLabel(documents, SERVICE_PERSONA), /job paperwork/);
  assert.match(questionLabel(documents, REAL_ESTATE_TEAM_PERSONA), /deal documents/);
});

test("every business finding carries a fit line and its Level, for every edition", () => {
  const worst = {
    operational_pain_points: [
      "Missed or after hours calls",
      "Leads slipping through",
      "Inconsistent follow up",
      "Too many systems",
      "Typing the same information twice",
      "Documents hard to find",
      "Hard to see the pipeline",
      "Team handoffs",
      "Too much rests on the owner",
      "Repetitive admin work",
    ],
    follow_up_process: "Mostly from memory or the inbox",
    handoff_quality: "They have to ask someone",
    document_storage: "Several places",
    manual_transfer_frequency: "Constantly",
  };
  for (const persona of [LENDER_PERSONA, SERVICE_PERSONA, REAL_ESTATE_TEAM_PERSONA, "Other"]) {
    const findings = assessmentFindings({ ...worst, persona });
    assert.ok(findings.length > 0 && findings.length <= 3);
    for (const finding of findings) {
      assert.ok(finding.fit, `${persona}: ${finding.id} has a fit line`);
      assert.match(finding.level ?? "", /^0[123]$/);
    }
  }
  /* A solo lender whose biggest gap starts above Level 01 is told so, plainly. */
  const solo = assessmentFindings({ persona: LENDER_PERSONA, follow_up_process: "Mostly from memory or the inbox", lead_response: "Rarely", operational_pain_points: ["Inconsistent follow up"] });
  assert.equal(solo[0].id, "follow-up-dependency");
  assert.match(levelGapNote(solo, "01") ?? "", /covered from Level 02/);
  assert.equal(levelGapNote(solo, "02"), null);
});

test("a church that says care comes through one shared place never hears it is scattered", () => {
  const answers = { persona: CHURCH_PERSONA, care_requests: "Through one shared place", church_pain_points: ["Knowing who needs care next"] };
  const findings = churchFindings(answers);
  for (const finding of findings) assert.doesNotMatch(finding.body, /more than one way/);
  assert.ok(findings.some((finding) => finding.id === "care-next" && /Person pages and reports/.test(finding.fit)));
});

test("the tools finding names the tools the church picked, and says Genesis links to them", () => {
  const [tools] = churchFindings({
    persona: CHURCH_PERSONA,
    church_tools: ["Planning Center", "Pushpay", "Breeze"],
    church_pain_points: ["Our tools do not talk to each other"],
  });
  assert.equal(tools.id, "tools-apart");
  assert.match(tools.fit, /Planning Center, Pushpay and Breeze keep running/);
  assert.match(tools.fit, /links to them rather than syncing/);
  assert.doesNotMatch(tools.fit, /Subsplash/);
});

test("each edition answers the Levels question from its own Level bullets", () => {
  for (const key of editionKeys) {
    const answer = levelsFaqAnswer(key);
    const own = editionLevels(key).flatMap(({ bullets }) => bullets.filter((bullet) => !bullet.startsWith("Everything")));
    for (const bullet of own) assert.ok(answer.toLowerCase().includes(bullet.toLowerCase()), `${key}: ${bullet}`);
    for (const other of editionKeys.filter((candidate) => candidate !== key)) {
      for (const bullet of editionLevels(other).flatMap(({ bullets }) => bullets)) {
        if (own.includes(bullet) || bullet.startsWith("Everything")) continue;
        assert.equal(answer.toLowerCase().includes(bullet.toLowerCase()), false, `${key} mentions ${other}'s "${bullet}"`);
      }
    }
    for (const dash of DASHES) assert.equal(answer.includes(dash), false, answer);
    assert.doesNotMatch(answer, /\baI\b/, "acronyms keep their capitals");
  }
  assert.doesNotMatch(pricingFaqs[0].answer, /quotes|appointments/, "the all-edition answer names no one edition's features");
  assert.match(read("components/sections/EditionLanding.tsx"), /levelsFaqAnswer\(key\)/);
});

test("each edition's AI employee day uses its own nouns, and no page claims every Level gets the whole team", () => {
  for (const persona of aiEmployeePersonas) {
    assert.match(persona.editionDay.lending, /borrower|loan officer|files/);
    assert.match(persona.editionDay.real_estate, /buyer|seller|deal|agent|showing/);
    assert.match(persona.editionDay.business, /job|quote|customer/);
    assert.ok(persona.role.split(" ").length <= 2, `${persona.name}: "${persona.role}" fits one line`);
  }
  assert.doesNotMatch(read("components/sections/EditionLanding.tsx"), /works inside every Level/);
});

test("edition Offers read as one sentence, and Enterprise has its own Service", () => {
  assert.equal(offerDescription({ userLimit: "1 user", setupLine: "plus $500 setup" }), "1 user, plus $500 setup.");
  const enterprise = enterpriseServiceSchema();
  assert.equal(enterprise["@type"], "Service");
  assert.match(enterprise.offers.description, /on a call/);
  assert.match(read("components/sections/EditionLanding.tsx"), /enterpriseServiceSchema\(\)/);
});

test("church links share a church preview, and a church plan reaches the CRM as a field", () => {
  for (const meta of [ministryMeta.assessment, ministryMeta.contact]) {
    assert.match(meta.title, /\| Genesis AI$/);
    assert.match(meta.description, /church/i);
    assert.ok(meta.description.length <= 170);
  }
  assert.equal(ministryPlanFromTopic("ministry-shepherd"), "shepherd");
  assert.equal(ministryPlanFromTopic("ministry"), "");
  assert.equal(ministryPlanFromTopic("ministry-gold"), "");
  assert.match(read("app/api/consultation/route.ts"), /MINISTRY_PLAN_IDS/);
});

test("front door links to the assessment are measured", () => {
  for (const file of [
    "components/home/HawkHero.tsx",
    "components/home/story/StorySections.tsx",
    "components/layout/Footer.tsx",
    "app/(marketing)/pricing/page.tsx",
    "components/sections/EditionLanding.tsx",
  ]) {
    const source = read(file);
    if (/href="\/assessment|href=\{[^}]*assessment/.test(source) || file.includes("Footer")) {
      assert.match(source, /TrackClick event="assessment_link_clicked"/, `${file} measures its assessment links`);
    }
  }
  assert.match(read("components/home/story/StorySections.tsx"), /event="edition_link_clicked"/);
  assert.match(read("components/ministry/MinistrySections.tsx"), /church_website_check_clicked/);
});

test("Book a Call promises a reply within one business day and offers the calendar", () => {
  assert.equal(bookACall.replyPromise, "We reply within one business day.");
  assert.equal(bookACall.pickTime.label, "Pick a Time");
  assert.equal(
    bookACall.pickTime.href,
    "https://outlook.office.com/bookwithme/user/9aad5fd73bf342e9a8b09822b37992b7@powerlandgroup.com?anonymous",
  );
  const form = read("app/(marketing)/contact/ConsultationForm.tsx");
  /* Under the form's button and again on the thanks screen, both counted as secondary actions. */
  assert.match(form, /<PickATime from="contact_form_pick_time" \/>/);
  assert.match(form, /<PickATime from="contact_success_pick_time" \/>/);
  assert.match(form, /TrackClick event="secondary_cta_clicked" from=\{from\}/);
  const button = form.slice(form.indexOf("function PickATime"), form.indexOf("export function ConsultationForm"));
  assert.match(button, /target="_blank"/);
  assert.match(button, /rel="noopener"/);
  assert.match(button, /min-h-\[52px\]/, "at least 44px tall");
  /* The promise is said in the one sentence, on the form and in the thanks heading. */
  assert.equal(form.split("bookACall.replyPromise").length, 3);
  assert.doesNotMatch(form, /one business day/, "the promise comes from lib/content.ts, not a second copy");
});

test("the hero hawk is served from this site, in three sizes", () => {
  assert.equal(
    HAWK_IMAGE_SRCSET,
    "/images/home/hawk-hero-600.webp 600w, /images/home/hawk-hero-900.webp 900w, /images/home/hawk-hero-1200.webp 1200w",
  );
  assert.equal(HAWK_IMAGE_SRC, "/images/home/hawk-hero-1200.webp");
  for (const width of HAWK_IMAGE_WIDTHS) {
    const file = readFileSync(new URL(`../public/images/home/hawk-hero-${width}.webp`, import.meta.url));
    assert.equal(file.subarray(0, 4).toString("latin1"), "RIFF", `${width}: a WebP file`);
    assert.equal(file.subarray(8, 12).toString("latin1"), "WEBP", `${width}: a WebP file`);
  }
  /* No other host is asked for the hero image, and the credit stays with the asset. */
  const hero = read("components/home/HawkHero.tsx");
  assert.doesNotMatch(hero, /preconnect|images\.unsplash\.com/);
  assert.match(hero, /preload\(HAWK_IMAGE_SRC/);
  const asset = read("components/home/hawkAsset.ts");
  assert.doesNotMatch(asset, /images\.unsplash\.com/);
  assert.match(asset, /Andy Spark on Unsplash/);
  assert.doesNotMatch(read("next.config.ts"), /unsplash/i);
});

test("Google Analytics 4 loads only with a measurement ID in NEXT_PUBLIC_GA_MEASUREMENT_ID", () => {
  assert.equal(GA_MEASUREMENT_ID_ENV, "NEXT_PUBLIC_GA_MEASUREMENT_ID");
  assert.equal(gaMeasurementId(undefined), "");
  assert.equal(gaMeasurementId(""), "");
  assert.equal(gaMeasurementId("UA-12345-1"), "");
  assert.equal(gaMeasurementId('G-ABC"onload='), "");
  assert.equal(gaMeasurementId(" G-TEST123456 "), "G-TEST123456");
  const loader = read("components/seo/GoogleAnalytics.tsx");
  assert.match(loader, /if \(!id\) return null;/);
  assert.match(loader, /googletagmanager\.com\/gtag\/js\?id=\$\{id\}/);
  assert.match(read("app/layout.tsx"), /<GoogleAnalytics \/>/);
  /* No measurement ID is written into the repository. */
  for (const file of ["components/seo/GoogleAnalytics.tsx", "lib/analytics.ts", "app/layout.tsx"]) {
    assert.doesNotMatch(read(file), /["'`]G-[A-Z0-9]{6,}["'`]/, file);
  }
});
