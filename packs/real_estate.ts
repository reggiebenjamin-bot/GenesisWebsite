import type { Pack } from "./types.ts";

export const realEstate: Pack = {
  id: "real_estate",
  label: "Real Estate",
  promise: "The same core system, tuned for real estate.",
  benefits: [
    "Inquiry routing",
    "Lead flow from your sources",
    "Areas and buyer or seller focus",
    "The same core system",
  ],
  previewTitle: "Workspace",
  questions: [
    {
      id: "lead_sources",
      prompt: "Where do leads come from?",
      help: "Choose every source the business uses.",
      kind: "multi",
      mapsTo: "channels",
      options: [
        { value: "Website", label: "Website" },
        { value: "Portal", label: "Portal" },
        { value: "Yard sign", label: "Yard sign" },
        { value: "Referral", label: "Referral" },
        { value: "Past client", label: "Past client" },
        { value: "Social", label: "Social" },
      ],
    },
    {
      id: "areas",
      prompt: "Which areas do you serve?",
      help: "Name the areas the business serves.",
      kind: "text",
    },
    {
      id: "focus",
      prompt: "Who is the focus?",
      help: "Buyers, sellers, or both.",
      kind: "single",
      options: [
        { value: "Buyers", label: "Buyers" },
        { value: "Sellers", label: "Sellers" },
        { value: "Buyers and sellers", label: "Buyers and sellers" },
      ],
    },
  ],
  kpis: [
    { id: "new", label: "New inquiries", value: "8", note: "Sample count. Not a forecast." },
    { id: "buyers", label: "Buyers", value: "5", note: "Sample count. Not a forecast." },
    { id: "sellers", label: "Sellers", value: "3", note: "Sample count. Not a forecast." },
    { id: "sends", label: "Sends", value: "0", note: "Dry run." },
  ],
  activity: [
    { id: "a1", title: "Sample inquiry arrived", detail: "Website. Sample data." },
    { id: "a2", title: "Sample area noted", detail: "Sample data." },
    { id: "a3", title: "Sample reply held", detail: "Dry run. Nothing sent." },
  ],
  stages: [
    { id: "inquiry", label: "Inquiry", items: [{ id: "r1", title: "Sample property inquiry", meta: "Sample data" }] },
    { id: "qualified", label: "Qualified", items: [{ id: "r2", title: "Sample consult", meta: "Sample data" }] },
    { id: "motion", label: "In motion", items: [] },
    { id: "closed", label: "Closed", items: [] },
  ],
  leads: [
    { id: "l1", title: "Sample buyer", source: "Website", status: "Inquiry" },
    { id: "l2", title: "Sample seller", source: "Referral", status: "Qualified" },
  ],
  inbox: [
    {
      id: "i1",
      from: "Sample contact",
      subject: "Question about an area",
      body: "Sample message. Nothing here was received.",
    },
  ],
  approvals: [
    { id: "p1", title: "Sample reply", detail: "Held in dry run. Nothing sends." },
  ],
  nextStep: "Hold outbound for approval.",
};
