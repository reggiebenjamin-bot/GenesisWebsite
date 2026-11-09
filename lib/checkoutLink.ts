/*
 * Direct checkout links for texts and emails:
 *   GET /api/managed/checkout?plan=managed-750 | managed-1750 | managed-4500
 *   GET /start/750 | /start/1750 | /start/4500 (alias)
 * Link previews (iMessage, Slack, Teams, mail scanners) fetch a URL before a
 * person taps it. Those requests go to the pricing page instead of creating
 * an abandoned Stripe Checkout Session.
 *
 * No path aliases in this file: tests import it directly under Node.
 */

import { isManagedPlanId } from "./offers.ts";

const PREVIEW_AGENT =
  /bot\b|bot\/|crawl|spider|slurp|preview|facebookexternalhit|facebot|whatsapp|telegram|discord|skype|teams|microsoft office|outlook|googleimageproxy|google-read-aloud|feedfetcher|embedly|iframely|vkshare|pinterest|redditbot|applebot|bingpreview|mimecast|proofpoint|barracuda|symantec|safelinks|headless|python-requests|go-http-client|okhttp|axios|node-fetch|undici|wget|libwww|httpclient|java\//i;

/** True for a link preview or scanner, or a request with no browser user agent. */
export function isLinkPreviewAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  if (!ua) return true;
  if (!/mozilla\//i.test(ua)) return true;
  return PREVIEW_AGENT.test(ua);
}

/** Plan id from ?plan= or a /start/<tier> segment. Empty when unknown. */
export function planFromLink(value: string | null | undefined): string {
  const raw = (value ?? "").trim().toLowerCase();
  const plan = /^\d+$/.test(raw) ? `managed-${raw}` : raw;
  return isManagedPlanId(plan) ? plan : "";
}
