import type { Pack } from "./types.ts";

export const general: Pack = {
  id: "general",
  label: "General",
  promise: "The same core system, tuned for a general business.",
  benefits: [
    "One inbox for the business",
    "Lead flow from your channels",
    "A site for inquiries",
    "A workspace for approvals",
  ],
  previewTitle: "Workspace",
  questions: [
    {
      id: "how_leads",
      prompt: "How do leads reach you?",
      help: "Choose every channel that brings new work.",
      kind: "multi",
      mapsTo: "channels",
      options: [
        { value: "Email", label: "Email" },
        { value: "Web form", label: "Web form" },
        { value: "Phone", label: "Phone" },
        { value: "Text", label: "Text" },
        { value: "Walk in", label: "Walk in" },
        { value: "Referral", label: "Referral" },
      ],
    },
    {
      id: "who_answers",
      prompt: "Who answers first?",
      help: "We use this to show who owns the first reply.",
      kind: "single",
      options: [
        { value: "The owner", label: "The owner" },
        { value: "A teammate", label: "A teammate" },
        { value: "A shared inbox", label: "A shared inbox" },
        { value: "It varies", label: "It varies" },
      ],
    },
    {
      id: "hours_fit",
      prompt: "Do the standard hours fit?",
      help: "Email runs Mon to Sat, 6 AM to 8 PM CT. Text runs Mon to Sat, 9 AM to 8 PM CT. The setup file keeps these hours.",
      kind: "single",
      options: [
        { value: "The standard hours fit", label: "The standard hours fit" },
        { value: "Note an exception later", label: "Note an exception later" },
      ],
    },
  ],
  kpis: [
    { id: "open", label: "Open inquiries", value: "12", note: "Sample count. Not a forecast." },
    { id: "waiting", label: "Waiting", value: "3", note: "Sample count. Not a forecast." },
    { id: "channels", label: "Channels", value: "4", note: "Sample count. Not a forecast." },
    { id: "sends", label: "Sends", value: "0", note: "Dry run." },
  ],
  activity: [
    { id: "a1", title: "Sample inquiry arrived", detail: "Email. Sample data." },
    { id: "a2", title: "Sample note added", detail: "Shared inbox. Sample data." },
    { id: "a3", title: "Sample reply held", detail: "Dry run. Nothing sent." },
  ],
  stages: [
    { id: "new", label: "New", items: [{ id: "g1", title: "Sample web inquiry", meta: "Sample data" }] },
    { id: "active", label: "Active", items: [{ id: "g2", title: "Sample follow up", meta: "Sample data" }] },
    { id: "waiting", label: "Waiting", items: [] },
    { id: "done", label: "Done", items: [] },
  ],
  leads: [
    { id: "l1", title: "Sample contact", source: "Email", status: "New" },
    { id: "l2", title: "Sample referral", source: "Referral", status: "Active" },
  ],
  inbox: [
    {
      id: "i1",
      from: "Sample contact",
      subject: "Question about next steps",
      body: "Sample message. Nothing here was received.",
    },
  ],
  approvals: [
    { id: "p1", title: "Sample reply", detail: "Held in dry run. Nothing sends." },
  ],
  nextStep: "Hold outbound for approval.",
};
