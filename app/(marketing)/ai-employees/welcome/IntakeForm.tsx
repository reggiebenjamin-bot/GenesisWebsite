"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { intakeMessages } from "@/lib/onboardingIntake";

const label =
  "grid gap-2 text-left text-[0.78rem] tracking-[0.08em] text-muted-dark uppercase";
const control =
  "min-h-12 w-full rounded-[6px] border border-line-light bg-paper px-4 text-[0.95rem] tracking-normal text-ink normal-case transition-colors duration-200 focus:border-gold-dark focus:outline-none";

export function IntakeForm({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/ai-employees/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || intakeMessages.invalid);
        return;
      }
      form.reset();
      setStatus("success");
      setMessage(intakeMessages.sent);
    } catch {
      setStatus("error");
      setMessage(intakeMessages.error);
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="text-[1.02rem] leading-relaxed text-ink">
        {message}
      </p>
    );
  }

  return (
    <form
      action="/api/ai-employees/intake"
      method="POST"
      onSubmit={onSubmit}
      className="grid gap-4"
    >
      <input type="hidden" name="session_id" value={sessionId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Business name
          <input className={control} name="businessName" type="text" autoComplete="organization" required minLength={2} />
        </label>
        <label className={label}>
          Your name
          <input className={control} name="name" type="text" autoComplete="name" required minLength={2} />
        </label>
        <label className={label}>
          Email
          <input className={control} name="email" type="email" autoComplete="email" required />
        </label>
        <label className={label}>
          Phone
          <input className={control} name="phone" type="tel" autoComplete="tel" required />
        </label>
        <label className={label}>
          Website
          <input className={control} name="website" type="url" autoComplete="url" />
        </label>
        <label className={label}>
          Brand colors or logo link
          <input className={control} name="brandColorsOrLogo" type="text" />
        </label>
        <label className={label}>
          The phone number your AI employee should use
          <input className={control} name="aiPhone" type="tel" />
        </label>
        <label className={label}>
          The inbox it should watch
          <input className={control} name="inbox" type="email" />
        </label>
      </div>

      <label className={label}>
        What you sell
        <textarea className={`${control} min-h-24 py-3`} name="whatYouSell" rows={3} maxLength={2000} />
      </label>
      <label className={label}>
        Main goal for the first 30 days
        <textarea className={`${control} min-h-24 py-3`} name="mainGoal" rows={3} maxLength={2000} />
      </label>
      <label className={label}>
        Preferred kickoff times
        <textarea className={`${control} min-h-20 py-3`} name="kickoffTimes" rows={2} maxLength={2000} />
      </label>

      <input
        name="website_url_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      {status === "error" ? (
        <p role="alert" className="text-[0.92rem] text-ink">
          {message}
        </p>
      ) : null}

      <SubmitButton variant="secondary" className="w-full sm:w-auto" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending" : "Send intake"}
      </SubmitButton>
    </form>
  );
}
