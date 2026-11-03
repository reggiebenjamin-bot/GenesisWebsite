"use client";

import { useSearchParams } from "next/navigation";

export function StatusNotice({
  checkout,
  inquiry,
}: {
  checkout: Record<string, string>;
  inquiry: Record<string, string>;
}) {
  const params = useSearchParams();
  const checkoutState = params.get("checkout") ?? "";
  const inquiryState = params.get("inquiry") ?? "";
  const lines = [checkout[checkoutState], inquiry[inquiryState]].filter(
    (line): line is string => Boolean(line),
  );

  if (!lines.length) return null;

  const alert = ["error", "unavailable", "invalid", "unconfigured"].includes(
    checkoutState || inquiryState,
  );

  return (
    <div
      role={alert ? "alert" : "status"}
      className="mx-auto mt-8 max-w-[46ch] rounded-[6px] border border-gold/45 bg-ink-soft px-5 py-4 text-center text-[0.95rem] leading-relaxed text-ivory"
    >
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
