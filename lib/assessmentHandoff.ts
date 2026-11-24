/*
 * What a finished assessment hands to the contact form, so booking the call
 * does not ask for the same details twice. It is kept in sessionStorage for
 * the one tab, never in a URL, and read only by /contact.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

export const ASSESSMENT_HANDOFF_KEY = "genesis:assessment-contact";

export type AssessmentHandoff = {
  path: "church" | "business";
  name: string;
  email: string;
  phone: string;
  company: string;
  /** The church staff size, or a business's team size, in the buckets the contact form uses. */
  staff: string;
  /** Attendance or team size and the finding titles, for the contact form's notes. */
  summary: string;
};

/** A stored handoff, or null when there is none or it is not the shape we wrote. */
export function readAssessmentHandoff(raw: string | null): AssessmentHandoff | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.path !== "church" && value.path !== "business") return null;
    const text = (key: string) => (typeof value[key] === "string" ? (value[key] as string).slice(0, 200) : "");
    return {
      path: value.path,
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      company: text("company"),
      staff: text("staff"),
      summary: typeof value.summary === "string" ? value.summary.slice(0, 600) : "",
    };
  } catch {
    return null;
  }
}

/** Fired by the assessment when a visitor takes the church path, so the header can speak to a church. */
export const AUDIENCE_EVENT = "genesis:assessment-audience";
