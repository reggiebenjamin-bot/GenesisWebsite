import assert from "node:assert/strict";
import test from "node:test";
import { assessmentFindings } from "../lib/assessment.ts";

test("assessment results never exceed three focused findings", () => {
  const findings = assessmentFindings({
    lead_response: "It depends on someone noticing it",
    manual_transfer_frequency: "Constantly",
    follow_up_process: "Mostly from memory / inbox",
    communication_channels: ["Email", "Text", "Phone", "Multiple places depending on the person"],
    document_storage: "Depends on the employee",
    handoff_quality: "They normally have to ask someone",
    operational_pain_points: [
      "Leads slipping through",
      "Inconsistent follow-up",
      "Too many systems",
      "Re-entering information",
      "Documents difficult to find",
      "Poor pipeline visibility",
      "Team handoffs",
      "Too much owner involvement",
      "Repetitive administrative work",
      "Communication scattered across systems",
      "Processes living in people's heads",
      "Difficulty knowing what needs attention next",
    ],
  });

  assert.equal(findings.length, 3);
  assert.equal(new Set(findings.map((finding) => finding.id)).size, 3);
});

test("assessment results stay empty when answers carry no friction signal", () => {
  const findings = assessmentFindings({
    lead_response: "Almost always",
    manual_transfer_frequency: "Rarely",
    follow_up_process: "Mostly automated",
    document_storage: "One organized system",
    handoff_quality: "Yes, consistently",
  });

  assert.deepEqual(findings, []);
});

test("a church can say so, and the result recommends Genesis Ministry", async () => {
  const { CHURCH_PERSONA, assessmentCopy, assessmentEdition, assessmentSteps } = await import("../lib/assessment.ts");
  const { pricingPathForPersona } = await import("../lib/editionPlans.ts");
  const { ministryLevels } = await import("../lib/ministryPage.ts");

  const persona = assessmentSteps[0].questions.find((question) => question.id === "persona");
  assert.ok(persona && persona.kind === "single");
  const values = persona.options.map((option) => option.value);
  assert.ok(values.includes(CHURCH_PERSONA));
  assert.equal(CHURCH_PERSONA, "Church or ministry");
  assert.equal(values.at(-1), "Other", "Other stays last");

  const recommended = assessmentEdition(CHURCH_PERSONA);
  assert.ok(recommended);
  assert.equal(recommended.edition, "ministry");
  assert.equal(recommended.name, "Genesis Ministry");
  assert.equal(recommended.page.href, "/ministry");
  assert.equal(recommended.plansLink.href, "/ministry#levels");
  assert.equal(recommended.call.label, "Book a Call");
  assert.equal(recommended.call.href, "/contact?topic=ministry");
  assert.deepEqual(
    recommended.plans,
    ministryLevels.levels.map((plan) => `${plan.name}, ${plan.priceDisplay} a month`),
  );
  assert.deepEqual(recommended.plans, ["Care, $149 a month", "Shepherd, $299 a month", "Plus, $499 a month"]);

  for (const other of values.filter((value) => value !== CHURCH_PERSONA)) {
    assert.equal(assessmentEdition(other), null, `${other} keeps the business results`);
    assert.notEqual(pricingPathForPersona(other), "/ministry#levels");
  }
  assert.equal(assessmentEdition(undefined), null);
  assert.equal(pricingPathForPersona(CHURCH_PERSONA), "/ministry#levels");

  const copy = [
    recommended.eyebrow,
    recommended.body,
    recommended.stepNote,
    recommended.page.label,
    recommended.plansLink.label,
    recommended.call.label,
    ...recommended.plans,
    ...recommended.points,
    assessmentCopy.results.churchCtaHeadline,
    assessmentCopy.results.churchCtaBody,
    persona.label,
  ];
  for (const text of copy) {
    for (const dash of ["-", "–", "—"]) assert.equal(text.includes(dash), false, `"${text}" contains "${dash}"`);
    assert.equal(/\p{Extended_Pictographic}/u.test(text), false, `"${text}" contains an emoji`);
  }
});

test("a church walks a church path, and the business path is unchanged", async () => {
  const {
    CHURCH_PERSONA,
    assessmentQuestions,
    assessmentSteps,
    churchSteps,
    stepsFor,
  } = await import("../lib/assessment.ts");

  assert.equal(stepsFor(CHURCH_PERSONA), churchSteps);
  assert.equal(stepsFor("Lender"), assessmentSteps);
  assert.equal(stepsFor(undefined), assessmentSteps);
  assert.deepEqual(
    assessmentSteps.map((step) => step.id),
    ["business", "leads", "systems", "follow-up", "deals", "pressure", "outcomes"],
    "the business steps keep their order",
  );

  /* Step one keeps the same persona question, so a church can change its mind. */
  assert.equal(churchSteps[0].questions[0], assessmentSteps[0].questions[0]);

  const churchIds = churchSteps.flatMap((step) => step.questions.map((question) => question.id));
  for (const id of ["weekly_attendance", "guest_sources", "guest_follow_up", "church_tools", "church_staff", "church_volunteers"]) {
    assert.ok(churchIds.includes(id), `the church path asks ${id}`);
  }
  for (const id of ["lead_sources", "crm", "deal", "document_storage", "handoff_quality"]) {
    assert.equal(churchIds.includes(id), false, `the church path does not ask ${id}`);
  }
  const tools = churchSteps
    .flatMap((step) => step.questions)
    .find((question) => question.id === "church_tools");
  assert.ok(tools && tools.kind === "multi");
  for (const name of ["Planning Center", "Breeze"]) {
    assert.ok(tools.options.some((option) => option.value === name), name);
  }

  /* The API reads its allowed answers from assessmentQuestions: every question of both paths, once. */
  const ids = assessmentQuestions.map((question) => question.id);
  assert.equal(new Set(ids).size, ids.length, "no question is listed twice");
  for (const id of [...churchIds, ...assessmentSteps.flatMap((step) => step.questions.map((q) => q.id))]) {
    assert.ok(ids.includes(id), `${id} is accepted by the API`);
  }

  /* Church copy follows the house rules: no dashes, no emojis. */
  const copy = churchSteps.flatMap((step) => [
    step.heading,
    ...step.questions.flatMap((question) => [
      question.label,
      ...("options" in question ? question.options.map((option) => option.label) : []),
      ...("placeholder" in question && question.placeholder ? [question.placeholder] : []),
    ]),
  ]);
  for (const text of copy) {
    for (const dash of ["–", "—"]) assert.equal(text.includes(dash), false, `"${text}" contains "${dash}"`);
    assert.equal(/\p{Extended_Pictographic}/u.test(text), false, `"${text}" contains an emoji`);
  }
});

test("church findings use church words, stay at three, and name only what Ministry includes", async () => {
  const { CHURCH_PERSONA, assessmentCopy, churchFindings, findingsFor } = await import("../lib/assessment.ts");
  const { ministryLevels, ministryFaq } = await import("../lib/ministryPage.ts");

  const heavy = {
    persona: CHURCH_PERSONA,
    guest_details: "We often do not get them",
    guest_follow_up: "It depends on who met them",
    follow_up_speed: "Often not at all",
    care_requests: "Several places, depending on the person",
    church_staff: "Just the pastor",
    church_tools: ["Planning Center", "Breeze", "Pushpay", "Spreadsheets"],
    church_pain_points: [
      "Guests slip away after one visit",
      "Follow up depends on one person",
      "Prayer requests land in too many places",
      "Our website is hard to use on a phone",
      "The office answers the same questions all week",
      "Our tools do not talk to each other",
      "Knowing who needs care next",
      "Getting the word out each week",
    ],
  };
  const findings = churchFindings(heavy);
  assert.equal(findings.length, 3);
  assert.equal(findings[0].id, "guest-follow-up");
  assert.deepEqual(findingsFor(heavy), findings, "a church gets church findings");
  assert.deepEqual(
    churchFindings({ persona: CHURCH_PERSONA, guest_follow_up: "A set process, with someone responsible", follow_up_speed: "Within a day", care_requests: "Through one shared place" }),
    [],
    "a church with little friction gets no padded list",
  );
  /* A business never gets church findings. */
  assert.ok(findingsFor({ ...heavy, persona: "Lender" }).every((finding) => !("fit" in finding && finding.fit)));

  /* Every fit line names something the plans or the FAQ actually include. */
  const offered = [
    ...ministryLevels.levels.flatMap((plan) => plan.bullets),
    ministryLevels.aside,
    ...ministryFaq.items.map((item) => item.answer),
  ].join(" ");
  const named: Record<string, RegExp> = {
    "guest-follow-up": /Guest pipeline|Today view/,
    "care-scattered": /Care inbox/i,
    "first-impression": /Hope/,
    "few-hands": /drafts that wait for approval/,
    "tools-apart": /Planning Center/,
    "word-out": /social marketing plan/,
  };
  for (const finding of churchFindings({ ...heavy, guest_follow_up: "A pastor handles it personally" }).concat(findings)) {
    assert.ok(finding.fit, `${finding.id} has a fit line`);
    assert.match(offered, named[finding.id], `${finding.id} names something Ministry includes`);
  }

  const results = assessmentCopy.results;
  for (const text of [
    results.churchEyebrow,
    results.churchHeadline,
    results.churchIntro,
    results.churchClear,
    results.churchFindingsTitle,
    results.churchCaveat,
    results.churchSizeNote,
    ...findings.flatMap((finding) => [finding.title, finding.body, finding.fit]),
  ]) {
    for (const dash of ["-", "–", "—"]) assert.equal(text.includes(dash), false, `"${text}" contains "${dash}"`);
    assert.equal(/\p{Extended_Pictographic}/u.test(text), false, `"${text}" contains an emoji`);
  }
});
