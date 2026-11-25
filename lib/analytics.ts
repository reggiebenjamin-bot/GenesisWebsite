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
  /* The assessment funnel */
  | "assessment_started"
  | "assessment_step_completed"
  | "assessment_completed"
  | "assessment_lead_captured"
  | "assessment_result_viewed"
  /* The edition the results recommend (business or church), its page opened, a Ministry call booked */
  | "assessment_edition_recommended"
  | "assessment_edition_link_clicked"
  | "ministry_call_cta_clicked"
  /* The church cue on the homepage hero, the phone menu and the Editions menu */
  | "ministry_cue_clicked"
  /* An edition page opened from the homepage hero, the edition cards or the Levels block */
  | "edition_link_clicked"
  | "ministry_demo_opened"
  | "church_website_check_clicked"
  /* A link into the assessment from another page, such as /ministry */
  | "assessment_link_clicked"
  | "infrastructure_review_cta_clicked"
  | "infrastructure_review_booked"
  | "direct_consultation_booked"
  /* Pricing: a Start Level button, with its level and edition */
  | "managed_plan_selected"
  /* A Start Level press on /pricing, before the edition check runs */
  | "managed_plan_attempted"
  /* Secondary actions: How It Works, an edition's pricing, the Ministry plans, a call */
  | "how_it_works_clicked"
  | "edition_pricing_viewed"
  | "secondary_cta_clicked"
  | "consultation_cta_clicked"
  /* /classes: asked to be told about the next class */
  | "classes_notify_requested"
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
