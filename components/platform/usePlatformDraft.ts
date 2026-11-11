"use client";

import { useSyncExternalStore } from "react";
import {
  getDraftSnapshot,
  getServerDraftSnapshot,
  saveDraft,
  subscribeDraft,
} from "@/lib/platform/storage";

function subscribeReady() {
  return () => {};
}

export function usePlatformDraft() {
  const hydrated = useSyncExternalStore(subscribeReady, () => true, () => false);
  const draft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getServerDraftSnapshot);
  return { hydrated, draft, save: saveDraft };
}
