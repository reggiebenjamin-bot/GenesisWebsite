/**
 * Mirrors a public lead form submission to the Genesis lead endpoint so
 * Reginald gets an instant speed-to-lead alert. Server only, additive, and
 * best-effort: it never throws and never blocks the caller's own handling, and
 * it never logs PII — only a short failure line carrying the HTTP status.
 */

export type GenesisLead = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  property?: string;
  want?: "borrow" | "buy" | "sell" | "other";
};

const LEAD_URL =
  process.env.GENESIS_LEAD_URL || "https://genesisaisolutions.cloud/api/web_lead";

/** Every field is trimmed; the free-text message is capped before it is sent. */
const TIMEOUT_MS = 4000;
const MESSAGE_CAP = 600;

const clean = (value: string | undefined, max?: number) => {
  const trimmed = (value ?? "").trim();
  return max ? trimmed.slice(0, max) : trimmed;
};

export async function mirrorToGenesis(lead: GenesisLead, src: string): Promise<void> {
  // Build the body from known fields only, so a honeypot can never ride along.
  const payload = {
    name: clean(lead.name),
    phone: clean(lead.phone),
    email: clean(lead.email),
    message: clean(lead.message, MESSAGE_CAP),
    property: clean(lead.property),
    want: lead.want,
    src,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(LEAD_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("genesis mirror failed", response.status);
    }
  } catch {
    // Timeout or network error — swallow so the visitor's request is unaffected.
    console.error("genesis mirror failed");
  } finally {
    clearTimeout(timeout);
  }
}
