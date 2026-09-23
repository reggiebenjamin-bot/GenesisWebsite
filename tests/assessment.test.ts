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
