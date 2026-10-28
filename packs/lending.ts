import { fundingDisclaimer } from "../lib/platform/copy.ts";
import type { Pack } from "./types.ts";

/**
 * Lending pack. Genesis is the tool.
 * When broker_mode is true, the client keeps their own lender list.
 * When it is false, the client is the lender.
 * Customer status never receives clientDesk.lenders.
 */
export const lending: Pack = {
  id: "lending",
  label: "Lending",
  promise: "The Lending pack for lenders. Genesis is the tool. Your deal desk and your lender list stay with you.",
  benefits: [
    "Deal intake on your deal desk",
    "Your lender list stays with you",
    "Stages you can rename in the pack",
    "The same core system",
  ],
  previewTitle: "Your deal desk",
  deskTitle: "Your deal desk",
  fundingDisclaimer,
  broker_mode: true,
  questions: [
    {
      id: "loan_types",
      prompt: "Which loan types should the desk expect?",
      help: "[CONFIRM] This is a starting list.",
      kind: "multi",
      options: [
        { value: "Purchase", label: "Purchase" },
        { value: "Refinance", label: "Refinance" },
        { value: "Construction", label: "Construction" },
        { value: "Bridge", label: "Bridge" },
        { value: "Business purpose", label: "Business purpose" },
        { value: "Consumer purpose", label: "Consumer purpose" },
      ],
    },
    {
      id: "states",
      prompt: "Which states?",
      help: "The states this desk covers.",
      kind: "text",
    },
    {
      id: "intake_channel",
      prompt: "Where should deal intake land?",
      help: "Where new deals arrive on your deal desk.",
      kind: "single",
      mapsTo: "channels",
      options: [
        { value: "Email", label: "Email" },
        { value: "Web form", label: "Web form" },
        { value: "Shared inbox", label: "Shared inbox" },
        { value: "Desk note", label: "Desk note" },
      ],
    },
  ],
  kpis: [
    { id: "submitted", label: "Submitted", value: "4", note: "Sample count. Not a forecast." },
    { id: "review", label: "In review", value: "2", note: "Sample count. Not a forecast." },
    { id: "list", label: "On your list", value: "3", note: "Sample count. Names stay on your desk." },
    { id: "sends", label: "Sends", value: "0", note: "Dry run." },
  ],
  activity: [
    { id: "a1", title: "Sample file moved to In review", detail: "Sample data. No name shown." },
    { id: "a2", title: "Sample intake arrived", detail: "Email. Sample data." },
    { id: "a3", title: "Sample reply held", detail: "Dry run. Nothing sent." },
  ],
  stages: [
    {
      id: "submitted",
      label: "Submitted",
      items: [{ id: "d1", title: "Sample purchase file", meta: "Sample data" }],
    },
    {
      id: "in_review",
      label: "In review",
      items: [{ id: "d2", title: "Sample refinance file", meta: "Sample data" }],
    },
    {
      id: "matched",
      label: "Matched",
      items: [{ id: "d3", title: "Sample file", meta: "Sample data. No name shown." }],
    },
    { id: "terms_ready", label: "Terms ready", items: [] },
    { id: "closing", label: "Closing", items: [] },
    { id: "funded", label: "Funded", items: [] },
  ],
  leads: [
    { id: "l1", title: "Sample deal contact", source: "Email", status: "Submitted" },
    { id: "l2", title: "Sample referral", source: "Desk note", status: "In review" },
  ],
  inbox: [
    {
      id: "i1",
      from: "Sample contact",
      subject: "Question about a file",
      body: "Sample message. Nothing here was received. No lender name is in this thread.",
    },
  ],
  approvals: [
    { id: "p1", title: "Sample reply", detail: "Held in dry run. Nothing sends." },
  ],
  nextStep: "Hold outbound for approval.",
  borrower: {
    title: "Deal status",
    lede: "This page shows the stage of the deal.",
    sampleTitle: "Sample deal",
    currentStage: "in_review",
  },
  clientDesk: {
    modeLabel: "Broker mode",
    modeHelp: "You keep your own lender list. Customers see stages only.",
    modeOffHelp: "You are the lender. Your deal desk and your lender list stay with you.",
    panelTitle: "Lender match",
    panelHelp: "Your lender list. These names stay on your desk.",
    panelPrivate: "Private",
    panelEmpty: "Sample names are hidden. Your lender list stays with you.",
    customerLink: "Customer status",
    lenders: [
      { id: "sample_a", name: "Sample Lender A", note: "Sample data." },
      { id: "sample_b", name: "Sample Lender B", note: "Sample data." },
      { id: "sample_c", name: "Sample Lender C", note: "Sample data." },
    ],
  },
};
