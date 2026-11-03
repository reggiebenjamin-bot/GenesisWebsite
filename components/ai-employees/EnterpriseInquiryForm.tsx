"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { inquiryMessages } from "@/lib/aiEmployees";

const label =
  "grid gap-2 text-left text-[0.78rem] tracking-[0.08em] text-muted-dark uppercase";
const control =
  "min-h-12 w-full rounded-[6px] border border-line-light bg-paper px-4 text-[0.95rem] tracking-normal text-ink normal-case transition-colors duration-200 focus:border-gold-dark focus:outline-none";

type InquiryCopy = {
  formTitle: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  companyLabel: string;
  messageLabel: string;
  submit: string;
  sending: string;
};

export function EnterpriseInquiryForm({ copy }: { copy: InquiryCopy }) {
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
      const response = await fetch("/api/ai-employees/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || inquiryMessages.invalid);
        return;
      }
      form.reset();
      setStatus("success");
      setMessage(inquiryMessages.sent);
    } catch {
      setStatus("error");
      setMessage(inquiryMessages.unconfigured);
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
    <form action="/api/ai-employees/inquiry" method="POST" onSubmit={onSubmit} className="grid gap-4">
      <p className="font-light text-[clamp(1.4rem,2vw,1.8rem)] leading-snug tracking-[-0.03em] text-ink">
        {copy.formTitle}
      </p>

      <label className={label}>
        {copy.nameLabel}
        <input className={control} name="name" type="text" autoComplete="name" required minLength={2} />
      </label>
      <label className={label}>
        {copy.emailLabel}
        <input className={control} name="email" type="email" autoComplete="email" required />
      </label>
      <label className={label}>
        {copy.phoneLabel}
        <input className={control} name="phone" type="tel" autoComplete="tel" required />
      </label>
      <label className={label}>
        {copy.companyLabel}
        <input className={control} name="company" type="text" autoComplete="organization" />
      </label>
      <label className={label}>
        {copy.messageLabel}
        <textarea className={`${control} min-h-28 py-3`} name="message" rows={4} />
      </label>

      <input
        name="website"
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
        {status === "submitting" ? copy.sending : copy.submit}
      </SubmitButton>
    </form>
  );
}
