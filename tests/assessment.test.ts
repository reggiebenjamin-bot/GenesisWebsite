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
