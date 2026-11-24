/*
 * The events worth knowing about, and one way to send them.
 *
 * Nothing is connected to this yet. `track` pushes to a tag manager or a
 * gtag if the page has one and does nothing at all if it does not, so the
 * call sites can be correct before a provider exists — and so no dashboard
 * can show a number that was never measured. Wire a provider in one place
 * here; the rest of the site already reports.
 */

export type AnalyticsEvent =
  /* Custom Infrastructure funnel */
  | "custom_infrastructure_viewed"
  | "assessment_started"
  | "assessment_step_completed"
  | "assessment_completed"
  | "assessment_lead_captured"
  | "assessment_result_viewed"
  /* A church in the assessment: Genesis Ministry recommended, its page opened, its call booked */
  | "assessment_edition_recommended"
  | "assessment_edition_link_clicked"
  | "ministry_call_cta_clicked"
  /* The church cue on the homepage hero, the phone menu and the Editions menu */
  | "ministry_cue_clicked"
  | "ministry_demo_opened"
  /* A link into the assessment from another page, such as /ministry */
  | "assessment_link_clicked"
  | "infrastructure_review_cta_clicked"
  | "infrastructure_review_booked"
  | "direct_consultation_cta_clicked"
  | "direct_consultation_booked"
  /* Pricing */
  | "managed_pricing_viewed"
  | "managed_plan_selected"
  | "tools_pricing_viewed"
  | "tools_plan_selected"
  | "one_time_tool_selected"
  /* Homepage film */
  | "hawk_demo_played";

type Props = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (command: string, event: string, props?: Props) => void;
};

/** Report an event. A no-op until a provider is connected. */
export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;

  const target = window as AnalyticsWindow;
  try {
    if (Array.isArray(target.dataLayer)) target.dataLayer.push({ event, ...props });
    if (typeof target.gtag === "function") target.gtag("event", event, props);
  } catch {
    /* Reporting must never break the page it is reporting on. */
  }
}
