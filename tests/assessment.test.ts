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
  /* Every Ministry call link lands on the form itself. */
  assert.equal(recommended.call.href, "/contact?topic=ministry#consultation-form");
  assert.equal(recommended.eyebrow, "Recommended for your church");
  assert.doesNotMatch(recommended.eyebrow, /Edition/);
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
    ["business", "leads", "systems", "follow-up", "deals", "pressure"],
    "the business steps keep their order, with what hurts and what would help on one step",
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
    church_staff: "1 or 2",
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
    "guest-follow-up": /list of every new guest|Today view/,
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

test("every option on both paths is free of dashes and emojis, and team sizes read in words", async () => {
  const { assessmentQuestions, assessmentSteps, assessmentCopy } = await import("../lib/assessment.ts");
  const texts = [
    ...assessmentQuestions.flatMap((question) => [
      question.label,
      ...("options" in question ? question.options.map((option) => option.label) : []),
    ]),
    ...assessmentSteps.map((step) => step.heading),
    assessmentCopy.cardEyebrow,
    assessmentCopy.church.eyebrow,
    assessmentCopy.church.headline,
    ...assessmentCopy.church.summary,
    ...assessmentCopy.summary,
    assessmentCopy.contact.heading,
  ];
  for (const text of texts) {
    for (const dash of ["–", "—"]) assert.equal(text.includes(dash), false, `"${text}" contains "${dash}"`);
    assert.equal(/\p{Extended_Pictographic}/u.test(text), false, `"${text}" contains an emoji`);
  }
  const team = assessmentQuestions.find((question) => question.id === "team_size");
  assert.ok(team && "options" in team);
  /* The sizes break where the Levels do: 1 user, up to 5, up to 25, then Enterprise. */
  assert.deepEqual(team.options.map((option) => option.value), ["Just me", "2 to 5", "6 to 25", "26 to 50", "More than 50"]);
  /* Labels read in words: no slashes standing in for "or". */
  for (const text of texts) assert.equal(text.includes(" / "), false, `"${text}" uses a slash`);
  /* The step seven label is a question, so the form's own "choose all" hint is the only one. */
  const outcomes = assessmentQuestions.find((question) => question.id === "desired_outcomes");
  assert.doesNotMatch(outcomes?.label ?? "", /apply/i);
});

test("a choice that stands alone clears the others, and the others clear it", async () => {
  const { assessmentQuestions, toggleChoice } = await import("../lib/assessment.ts");
  const tools = assessmentQuestions.find((question) => question.id === "church_tools");
  assert.ok(tools && tools.kind === "multi");
  assert.deepEqual(tools.exclusive, ["None yet"]);
  assert.deepEqual(toggleChoice(tools, ["Planning Center"], "None yet"), ["None yet"]);
  assert.deepEqual(toggleChoice(tools, ["None yet"], "Breeze"), ["Breeze"]);
  assert.deepEqual(toggleChoice(tools, ["Planning Center"], "Breeze"), ["Planning Center", "Breeze"]);
  assert.deepEqual(toggleChoice(tools, ["Planning Center", "Breeze"], "Breeze"), ["Planning Center"]);
});

test("a link can open the assessment on a path, and only known values are read", async () => {
  const { CHURCH_PERSONA, personaFromParams, assessmentQuestions } = await import("../lib/assessment.ts");
  const read = (query: string) => personaFromParams(new URLSearchParams(query));
  assert.equal(read("for=church"), CHURCH_PERSONA);
  assert.equal(read("persona=lending"), "Lender or loan officer");
  assert.equal(read("persona=real-estate"), "Real estate team");
  assert.equal(read("persona=business"), "Service business or trade (HVAC, plumbing, roofing and more)");
  /* A page's searchParams object reads the same way, so the server can render the path. */
  assert.equal(personaFromParams({ for: "church" }), CHURCH_PERSONA);
  assert.equal(personaFromParams({ persona: ["lending"] }), undefined);
  for (const bad of ["for=toString", "persona=<script>", "", "for=Church"]) assert.equal(read(bad), undefined, bad);
  /* Every preset is an answer the API accepts. */
  const persona = assessmentQuestions.find((question) => question.id === "persona");
  assert.ok(persona && "options" in persona);
  for (const query of ["for=church", "persona=lending", "persona=real-estate", "persona=business"]) {
    assert.ok(persona.options.some((option) => option.value === read(query)), query);
  }
});

test("a church's results suggest the plan its findings point to", async () => {
  const { CHURCH_PERSONA, churchFindings, planLabel, suggestedMinistryPlan } = await import("../lib/assessment.ts");
  const { ministryConsultationNote, ministryLevels } = await import("../lib/ministryPage.ts");

  const shepherd = { persona: CHURCH_PERSONA, guest_follow_up: "It often does not happen", church_staff: "3 to 5" };
  const found = churchFindings(shepherd);
  const plan = suggestedMinistryPlan(shepherd, found);
  assert.equal(plan?.id, "shepherd");
  assert.equal(plan?.price, "$299");
  /* Each fit line's plan is said once beside it, and is the suggestion or one below it. */
  for (const finding of found) {
    assert.match(planLabel(finding.plan), finding.plan === "shepherd" ? /Shepherd/ : /every plan/);
    assert.doesNotMatch(finding.fit, /^From the/);
  }
  /* The call link opens on the form with the plan and its price already in the note. */
  assert.equal(plan?.href, "/contact?topic=ministry-shepherd#consultation-form");
  assert.ok(ministryConsultationNote("ministry-shepherd"));

  const care = { persona: CHURCH_PERSONA, church_pain_points: ["Our website is hard to use on a phone"] };
  assert.equal(suggestedMinistryPlan(care, churchFindings(care))?.id, "care");

  /* A larger staff that wants to see who needs care next starts where its findings start
     (Shepherd), and hears that Plus adds person pages and reports, as a later step, never an upsell. */
  const larger = {
    persona: CHURCH_PERSONA,
    church_staff: "6 to 15",
    weekly_attendance: "251 to 500",
    care_requests: "Paper cards",
    church_pain_points: ["Knowing who needs care next"],
  };
  const start = suggestedMinistryPlan(larger, churchFindings(larger));
  assert.equal(start?.id, "shepherd");
  assert.match(start?.later ?? "", /Plus later/);
  /* Seeing who needs care next is its own finding, labelled In Plus, but Plus is still never the start. */
  assert.ok(churchFindings(larger).some((finding) => finding.id === "care-next" && finding.plan === "plus"));
  assert.equal(suggestedMinistryPlan({ ...larger, church_pain_points: ["Knowing who needs care next"], care_requests: "Through one shared place" }, churchFindings({ ...larger, care_requests: "Through one shared place" }))?.id, "shepherd");
  assert.equal(suggestedMinistryPlan({ ...larger, church_staff: "1 or 2" }, churchFindings(larger))?.later, null);
  assert.ok(ministryLevels.levels.find((level) => level.id === "plus")?.bullets.some((bullet) => /Person pages|Reports/.test(bullet)));

  /* No findings, no suggestion: a call decides it. */
  const calm = { persona: CHURCH_PERSONA, guest_follow_up: "A set process, with someone responsible" };
  assert.deepEqual(churchFindings(calm), []);
  assert.equal(suggestedMinistryPlan(calm, []), null);
});

test("a church picks staff sizes the church contact form also offers", async () => {
  const { churchSteps } = await import("../lib/assessment.ts");
  const { ministryContact } = await import("../lib/ministryPage.ts");
  const staff = churchSteps.flatMap((step) => step.questions).find((question) => question.id === "church_staff");
  assert.ok(staff && "options" in staff);
  assert.deepEqual(staff.options.map((option) => option.value), [...ministryContact.form.staffSizes]);
});

test("business results name the edition built for the persona, with its Levels and its disclaimer", async () => {
  const { businessRecommendation, CHURCH_PERSONA } = await import("../lib/assessment.ts");
  const { managedPlans } = await import("../lib/offers.ts");
  const { FUNDING_LINE } = await import("../lib/legal.ts");

  const { LENDER_PERSONA, SERVICE_PERSONA } = await import("../lib/personas.ts");
  assert.equal(businessRecommendation(LENDER_PERSONA, "Just me")?.href, "/lending");
  assert.equal(businessRecommendation("Brokerage", "2 to 5")?.href, "/real-estate");
  assert.equal(businessRecommendation(SERVICE_PERSONA, "6 to 25")?.href, "/business");
  assert.equal(businessRecommendation("Other", undefined)?.href, "/business");
  assert.equal(businessRecommendation(CHURCH_PERSONA, undefined), null);
  assert.equal(businessRecommendation(undefined, undefined), null);

  const lender = businessRecommendation(LENDER_PERSONA, "26 to 50");
  assert.ok(lender);
  assert.equal(lender.disclaimer, FUNDING_LINE);
  assert.equal(lender.pricingHref, "/lending#levels");
  /* More than 25 users is Enterprise: the same line the Levels print under Level 03. */
  assert.equal(lender.suggested?.step, null);
  assert.equal(lender.suggested?.label, "Genesis Enterprise");
  assert.equal(managedPlans.at(-1)?.userLimit, "Up to 25 users");
  assert.match(managedPlans.at(-1)?.enterpriseNote ?? "", /More than 25 users/);
  /* Each team size lands on the Level whose user limit covers it. */
  const steps = ["Just me", "2 to 5", "6 to 25"].map((size) => businessRecommendation(LENDER_PERSONA, size)?.suggested?.step);
  assert.deepEqual(steps, ["01", "02", "03"]);
  assert.equal(businessRecommendation(LENDER_PERSONA, undefined)?.suggested, null);
  assert.deepEqual(
    lender.levels,
    managedPlans.map((plan) => `Level ${plan.step}, ${plan.priceDisplay} a month, ${plan.setupLine}`),
  );
});

test("business findings speak the visitor's trade and name only what the edition lists", async () => {
  const { assessmentFindings, businessRecommendation } = await import("../lib/assessment.ts");
  const { LENDER_PERSONA, SERVICE_PERSONA } = await import("../lib/personas.ts");
  const { editionPricing } = await import("../lib/editionPlans.ts");
  const { editions } = await import("../lib/editions.ts");
  const heavy = {
    lead_response: "Only when someone notices",
    follow_up_process: "Mostly from memory or the inbox",
    handoff_quality: "They have to ask someone",
    document_storage: "Several places",
    operational_pain_points: ["Missed or after hours calls", "Inconsistent follow up", "Team handoffs", "Documents hard to find"],
  };
  const lender = assessmentFindings({ ...heavy, persona: LENDER_PERSONA });
  assert.ok(lender.some((finding) => /borrower|file/.test(finding.body)), "a lender reads about borrowers and files");
  assert.ok(lender.every((finding) => !/during a job/.test(finding.body)));
  const trade = assessmentFindings({ ...heavy, persona: SERVICE_PERSONA });
  assert.ok(trade.some((finding) => /job|quote|customer/.test(finding.body)));
  /* Every fit line names something on that edition's card or Level bullets. */
  for (const [persona, key, href] of [
    [LENDER_PERSONA, "lending", "/lending"],
    [SERVICE_PERSONA, "business", "/business"],
    ["Brokerage", "real_estate", "/real-estate"],
  ] as const) {
    const listed = [
      ...editions.find((edition) => edition.href === href)!.points,
      ...Object.values(editionPricing[key].bullets).flat(),
    ].join(" ").toLowerCase();
    for (const finding of assessmentFindings({ ...heavy, persona })) {
      if (!finding.fit) continue;
      const named = ["calls answered", "instant first reply", "same day lead response", "quotes followed up", "document follow up", "team roles and routing", "clear owner", "connected systems", "file status in one view", "live deal board", "automation across workflows", "guided first touch", "appointments confirmed", "ai follow up"];
      const hit = named.filter((phrase) => finding.fit!.toLowerCase().includes(phrase));
      assert.ok(hit.length, `${finding.id} for ${key} names a listed feature: ${finding.fit}`);
      for (const phrase of hit) assert.ok(listed.includes(phrase), `${key} lists "${phrase}"`);
    }
    assert.ok(businessRecommendation(persona, "2 to 5"));
  }
});

test("a missed call is its own finding for a business", async () => {
  const { assessmentFindings } = await import("../lib/assessment.ts");
  const findings = assessmentFindings({ operational_pain_points: ["Missed or after hours calls"] });
  assert.equal(findings[0]?.id, "missed-calls");
});

test("a church lead is labelled as the Ministry assessment", async () => {
  const { readFileSync } = await import("node:fs");
  const route = readFileSync(new URL("../app/api/assessment/route.ts", import.meta.url), "utf8");
  assert.match(route, /assessmentEdition\(answers\.persona\) \? "Genesis Ministry Assessment" : "Genesis Infrastructure Assessment"/);
});

test("the assessment hands its details to the contact form through storage, never the URL", async () => {
  const { readAssessmentHandoff } = await import("../lib/assessmentHandoff.ts");
  assert.equal(readAssessmentHandoff(null), null);
  assert.equal(readAssessmentHandoff("{nope"), null);
  assert.equal(readAssessmentHandoff(JSON.stringify({ path: "admin" })), null);
  assert.deepEqual(readAssessmentHandoff(JSON.stringify({ path: "church", name: "Ana Ruiz", email: "a@b.org", staff: "3 to 5", extra: 1 })), {
    path: "church",
    name: "Ana Ruiz",
    email: "a@b.org",
    phone: "",
    company: "",
    staff: "3 to 5",
    summary: "",
  });
  /* The summary carries what the assessment found into the contact form's notes. */
  const { assessmentSummary } = await import("../lib/assessment.ts");
  assert.equal(
    assessmentSummary({ weekly_attendance: "251 to 500" }, [{ id: "a", title: "Care requests are scattered", body: "", review: "" }]),
    "Weekend attendance: 251 to 500. Assessment findings: Care requests are scattered.",
  );
  const { readFileSync } = await import("node:fs");
  const form = readFileSync(new URL("../app/(marketing)/assessment/AssessmentForm.tsx", import.meta.url), "utf8");
  assert.match(form, /sessionStorage\.setItem\(ASSESSMENT_HANDOFF_KEY/);
});

test("the homepage chapters run in order, with no gap", async () => {
  const { readFileSync } = await import("node:fs");
  const story = readFileSync(new URL("../components/home/story/StorySections.tsx", import.meta.url), "utf8");
  const words = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
  const found = [...story.matchAll(/eyebrow="Chapter (\w+)\./g)].map((match) => match[1]);
  assert.deepEqual(found, words.slice(0, found.length));
  /* The page itself: the questions are chapter seven, and the Levels are priced once, in chapter six. */
  const page = readFileSync(new URL("../app/(marketing)/page.tsx", import.meta.url), "utf8");
  assert.match(page, /eyebrow="Chapter seven\. Questions"/);
  assert.doesNotMatch(page, /PlanCards|CustomInfrastructureSections|OperatingThesis/, "the Levels are priced once on the homepage");
  assert.equal((story.match(/<ProcessTimeline/g) ?? []).length, 1, "the timeline is told once, in chapter five");
});

test("church finding titles are statements, not topic labels", async () => {
  const { churchFindings, CHURCH_PERSONA } = await import("../lib/assessment.ts");
  const everything = churchFindings({
    persona: CHURCH_PERSONA,
    guest_follow_up: "A pastor handles it personally",
    care_requests: "Paper cards",
    church_tools: ["Planning Center", "Breeze", "Pushpay"],
    church_pain_points: [
      "Guests slip away after one visit",
      "Our website is hard to use on a phone",
      "Getting the word out each week",
      "Our tools do not talk to each other",
    ],
  });
  const verbs = /\b(is|are|can|carry|carries|starts|do|does|takes|wait)\b/;
  for (const finding of everything) assert.match(finding.title, verbs, `"${finding.title}" reads as a statement`);
});

test("a link that names the path starts on it, with the persona folded to one row", async () => {
  const { readFileSync } = await import("node:fs");
  const form = readFileSync(new URL("../app/(marketing)/assessment/AssessmentForm.tsx", import.meta.url), "utf8");
  /* The server passes the persona from the link, so the first render is already on that path. */
  const page = readFileSync(new URL("../app/(marketing)/assessment/page.tsx", import.meta.url), "utf8");
  assert.match(page, /personaFromParams\(await searchParams\)/);
  assert.match(form, /useState\(Boolean\(initialPersona\)\)/);
  assert.match(form, /collapsed=\{question\.id === "persona" && personaCollapsed\}/);
  assert.doesNotMatch(form, /requestAnimationFrame\(\(\) =>\s*setAnswers/, "no preset applied a frame late");
});

test("the house label is Book a Call: no visitor copy says Book a Consultation", async () => {
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
    });
  for (const file of ["app", "components", "lib"].flatMap((dir) => walk(join(process.cwd(), dir)))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /Book a consultation/i, file);
  }
});
