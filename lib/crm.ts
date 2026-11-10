/*
 * The "What CRM do you use today?" answer, asked at managed checkout and in
 * the assessment. A buyer or lead who uses another CRM or none is tagged
 * "Needs GHL" so the team knows to set up GoHighLevel for them.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

export type CrmChoice = "ghl" | "other" | "none";

export const CRM_QUESTION = "What CRM do you use today?";
export const NEEDS_GHL_TAG = "Needs GHL";

/** The answers, in the order they are offered. `label` is what the buyer reads. */
export const crmOptions: readonly { value: CrmChoice; label: string }[] = [
  { value: "ghl", label: "GoHighLevel" },
  { value: "other", label: "Another CRM" },
  { value: "none", label: "None" },
];

/** A CRM choice from a stored key or a label. Empty when the answer is unknown. */
export function crmChoice(value: unknown): CrmChoice | "" {
  if (typeof value !== "string") return "";
  const raw = value.trim().toLowerCase();
  const hit = crmOptions.find(
    (option) => option.value === raw || option.label.toLowerCase() === raw,
  );
  return hit ? hit.value : "";
}

/** The assessment form offers labels. Accept a stored key too, and return the label. */
export function crmAnswer(value: unknown): string {
  return crmLabel(crmChoice(value));
}

export function crmLabel(choice: CrmChoice | ""): string {
  return crmOptions.find((option) => option.value === choice)?.label ?? "";
}

/** True for another CRM or none: those buyers and leads are tagged Needs GHL. */
export function needsGhl(choice: CrmChoice | ""): boolean {
  return choice === "other" || choice === "none";
}

/** The CRM answer on a Stripe Checkout Session, read from its custom fields. */
export function crmFromSession(session: Record<string, unknown>): CrmChoice | "" {
  const fields = Array.isArray(session.custom_fields) ? session.custom_fields : [];
  for (const field of fields) {
    if (!field || typeof field !== "object") continue;
    const entry = field as Record<string, unknown>;
    if (entry.key !== "crm") continue;
    const dropdown = entry.dropdown as Record<string, unknown> | undefined;
    const choice = crmChoice(dropdown?.value);
    if (choice) return choice;
  }
  return "";
}

/** The Stripe Checkout dropdown. Required, so every buyer answers it. */
export function crmCheckoutField() {
  return {
    key: "crm",
    label: { type: "custom" as const, custom: CRM_QUESTION },
    type: "dropdown" as const,
    optional: false,
    dropdown: { options: crmOptions.map((option) => ({ label: option.label, value: option.value })) },
  };
}
