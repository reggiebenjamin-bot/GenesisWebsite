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

/**
 * True for a speculative fetch rather than a person opening the link: a
 * Next.js router prefetch or RSC fetch (RSC, Next-Router-Prefetch, _rsc), or a
 * browser prefetch (Purpose or Sec-Purpose: prefetch). None of these may open
 * a Stripe Checkout Session.
 */
export function isPrefetchRequest(request: Request): boolean {
  const headers = request.headers;
  if (headers.get("rsc") !== null) return true;
  if (headers.get("next-router-prefetch") !== null) return true;
  if (headers.get("next-router-state-tree") !== null) return true;
  if (/prefetch|prerender/i.test(headers.get("purpose") ?? "")) return true;
  if (/prefetch|prerender/i.test(headers.get("sec-purpose") ?? "")) return true;
  if (/prefetch|prerender/i.test(headers.get("x-purpose") ?? "")) return true;
  if (/prefetch/i.test(headers.get("x-moz") ?? "")) return true;
  return new URL(request.url).searchParams.has("_rsc");
}

/** 303 to the pricing page, never cached, never indexed. */
export function pricingRedirect(request: Request): Response {
  const url = new URL("/pricing", request.url);
  url.hash = "custom-infrastructure";
  return new Response(null, {
    status: 303,
    headers: {
      Location: url.toString(),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      Vary: "RSC, Next-Router-Prefetch, Purpose, Sec-Purpose, User-Agent",
    },
  });
}

/**
 * Gate for GET /start/<tier>. Unknown plans, prefetches, and link previews go
 * to pricing. Only a person opening the link reaches `start`, which creates
 * the Checkout Session.
 */
export async function gateCheckoutLink(
  request: Request,
  rawPlan: string | null,
  start: (plan: string, edition: string | null) => Promise<Response>,
): Promise<Response> {
  const plan = planFromLink(rawPlan);
  if (!plan) return pricingRedirect(request);
  if (isPrefetchRequest(request)) return pricingRedirect(request);
  if (isLinkPreviewAgent(request.headers.get("user-agent"))) return pricingRedirect(request);
  const edition = new URL(request.url).searchParams.get("edition");
  return start(plan, edition);
}
