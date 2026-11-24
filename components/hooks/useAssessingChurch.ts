"use client";

import { useSyncExternalStore } from "react";
import { AUDIENCE_EVENT } from "@/lib/assessmentHandoff";

/*
 * Whether the assessment on this page is on the church path. The assessment
 * marks it on <html data-audience> and fires AUDIENCE_EVENT, so a part of the
 * page that mounts after the assessment (the footer) reads it as well as one
 * that mounts before (the header).
 */
function subscribe(onChange: () => void) {
  window.addEventListener(AUDIENCE_EVENT, onChange);
  return () => window.removeEventListener(AUDIENCE_EVENT, onChange);
}

const read = () => document.documentElement.dataset.audience === "church";

export function useAssessingChurch(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Called by the assessment: marks the path and tells whoever is listening. */
export function announceAudience(audience: "church" | "business") {
  document.documentElement.dataset.audience = audience;
  window.dispatchEvent(new CustomEvent(AUDIENCE_EVENT, { detail: audience }));
}
