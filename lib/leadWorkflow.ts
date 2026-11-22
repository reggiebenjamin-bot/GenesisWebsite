import type { CSSProperties } from "react";
import type { WorkflowAction, WorkflowApp, WorkflowGraph } from "@/components/ui/interactive-workflow-blueprint";
import { softwareDisclaimer } from "./aiEmployees.ts";

/**
 * An illustration of one lead moving from first contact through follow up.
 * The steps restate the employees' daily work. They are not measured results.
 */
export const leadWorkflowIntro = {
  eyebrow: "How it works",
  title: "One lead, from first contact through follow up.",
  summary:
    "Hawk, Ava, Susan, and Darius work one lead in order. This diagram shows the path. It does not report results.",
  canvasTitle: "How a lead moves",
  disclaimer: softwareDisclaimer,
} as const;

const lead = "/brand/genesis-icon.svg";
/** Persona portraits, 160px square. Ava is Speed to Lead. Shannon has no step on this path. */
const hawk = "/brand/workflow/hawk.webp";
const ava = "/brand/workflow/ava.webp";
const susan = "/brand/workflow/susan.webp";
const darius = "/brand/workflow/darius.webp";
const hawkAlt = "Hawk, operations";
const avaAlt = "Ava, Speed to Lead";
const susanAlt = "Susan, marketing";
const dariusAlt = "Darius, sales and prospecting";

export const leadWorkflowGraph: WorkflowGraph = {
  nodes: [
    {
      id: "lead",
      type: "blueprint",
      position: { x: 24, y: 16 },
      data: {
        label: "New lead",
        detail: "A lead arrives and first contact begins.",
        kind: "trigger",
        logo: lead,
      },
    },
    {
      id: "ava",
      type: "blueprint",
      position: { x: 270, y: 16 },
      data: {
        label: "Ava answers",
        detail: "Ava answers from approved information and offers an open time.",
        kind: "agent",
        tool: "Ava",
        logo: ava,
        logoAlt: avaAlt,
      },
    },
    {
      id: "hawk",
      type: "blueprint",
      position: { x: 516, y: 16 },
      data: {
        label: "Hawk sets the next step",
        detail: "Hawk keeps the lead in view and names the next action.",
        kind: "agent",
        tool: "Hawk",
        logo: hawk,
        logoAlt: hawkAlt,
      },
    },
    {
      id: "darius",
      type: "blueprint",
      position: { x: 24, y: 240 },
      data: {
        label: "Darius drafts first contact",
        detail: "Darius drafts the first note and logs it for a person to approve.",
        kind: "agent",
        tool: "Darius",
        logo: darius,
        logoAlt: dariusAlt,
      },
    },
    {
      id: "approve",
      type: "blueprint",
      position: { x: 270, y: 240 },
      data: {
        label: "A person approves",
        detail: "Nothing is sent until someone on the team approves the draft.",
        kind: "review",
        tool: "Your team",
      },
    },
    {
      id: "susan",
      type: "blueprint",
      position: { x: 516, y: 240 },
      data: {
        label: "Susan lines up follow up",
        detail: "Susan prepares the next message from facts you already approved.",
        kind: "delivery",
        tool: "Susan",
        logo: susan,
        logoAlt: susanAlt,
      },
    },
  ],
  edges: [
    { id: "lead-ava", source: "lead", target: "ava" },
    { id: "ava-hawk", source: "ava", target: "hawk" },
    { id: "hawk-darius", source: "hawk", target: "darius" },
    { id: "darius-approve", source: "darius", target: "approve" },
    { id: "approve-susan", source: "approve", target: "susan" },
  ],
};

export const leadWorkflowApps: WorkflowApp[] = [
  {
    id: "hawk",
    name: "Hawk",
    logo: hawk,
    logoAlt: hawkAlt,
    actions: [
      {
        label: "Name the next step",
        detail: "Give the lead a next action and keep it visible.",
        kind: "agent",
        tool: "Hawk",
      },
      {
        label: "Surface stalled work",
        detail: "Bring a quiet lead back into view before the day ends.",
        kind: "agent",
        tool: "Hawk",
      },
    ],
  },
  {
    id: "ava",
    name: "Ava",
    logo: ava,
    logoAlt: avaAlt,
    actions: [
      {
        label: "Answer a question",
        detail: "Answer a common question from approved information.",
        kind: "agent",
        tool: "Ava",
      },
      {
        label: "Offer an open time",
        detail: "Offer an open time and confirm the appointment.",
        kind: "delivery",
        tool: "Ava",
      },
      {
        label: "Route to a person",
        detail: "Send anything that needs a person to the right one.",
        kind: "review",
        tool: "Ava",
      },
    ],
  },
  {
    id: "susan",
    name: "Susan",
    logo: susan,
    logoAlt: susanAlt,
    actions: [
      {
        label: "Draft a message",
        detail: "Draft a message from facts you approve.",
        kind: "agent",
        tool: "Susan",
      },
      {
        label: "Line up follow up",
        detail: "Prepare the next message and keep a record of what was sent.",
        kind: "delivery",
        tool: "Susan",
      },
    ],
  },
  {
    id: "darius",
    name: "Darius",
    logo: darius,
    logoAlt: dariusAlt,
    actions: [
      {
        label: "Draft first contact",
        detail: "Draft the first note for a person to approve.",
        kind: "agent",
        tool: "Darius",
      },
      {
        label: "Mark ready for a person",
        detail: "Mark the people who are ready for someone to call.",
        kind: "review",
        tool: "Darius",
      },
    ],
  },
];

export const leadWorkflowAgent: WorkflowAction = {
  label: "New step",
  detail: "Describe what this step does for the lead.",
  kind: "agent",
  tool: "Genesis",
};

/** Ivory ground, gold action. Passed through the blueprint's own variables. */
export const leadWorkflowColors = {
  colorScheme: "light",
  "--color-background": "#f4efe8",
  "--color-foreground": "#08090e",
  "--color-card": "#faf7f2",
  "--color-muted-foreground": "#6d6c69",
  "--color-border": "rgb(201 165 94 / 0.55)",
  "--color-primary": "#c9a55e",
  "--color-primary-foreground": "#08090e",
  "--color-chart-2": "#765426",
  "--color-chart-3": "#c9a55e",
} as CSSProperties;

const copyRoots = [leadWorkflowIntro, leadWorkflowGraph, leadWorkflowApps, leadWorkflowAgent];

/** Visitor facing sentences in the lead diagram. Paths stay out. */
export function leadWorkflowPublicCopy(): string[] {
  const sentences: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") {
      if (value.startsWith("/") || value.startsWith("#") || value.startsWith("rgb")) return;
      sentences.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, inner] of Object.entries(value)) {
        if (key === "id" || key === "kind" || key === "type" || key === "source" || key === "target") continue;
        walk(inner);
      }
    }
  };
  copyRoots.forEach(walk);
  return sentences;
}
