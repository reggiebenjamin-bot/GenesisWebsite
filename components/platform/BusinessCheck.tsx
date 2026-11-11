"use client";

import { useState } from "react";
import { platformCopy } from "@/lib/platform/copy";
import { SubmitButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { Notice, fieldLabel, textInput } from "./Chrome";

const check = platformCopy.check;

export function BusinessCheck() {
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/platform/business-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          city,
          email,
          note,
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setStatus("error");
        setError(body?.error || platformCopy.errors.check);
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError(platformCopy.errors.network);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12" data-testid="business-check">
      <Eyebrow>{check.eyebrow}</Eyebrow>
      <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.04em] text-balance">{check.title}</h1>
      <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">{check.lede}</p>
      <p className="mt-4 text-[1.05rem] leading-relaxed text-ink/70">{check.confirm}</p>

      {status === "success" ? (
        <div className="mt-8">
          <Card>
            <Notice tone="success" title={check.successTitle}>
              {check.successBody}
            </Notice>
            <p className="mt-6 text-[1.05rem] leading-relaxed text-ink/75">{check.confirm}</p>
            <p className="mt-4 text-[1rem] leading-relaxed text-ink/70">{platformCopy.address}</p>
          </Card>
        </div>
      ) : (
        <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
          {status === "loading" ? (
            <Notice tone="loading" title={check.preparing}>
              {check.preparing}
            </Notice>
          ) : null}
          {error ? (
            <Notice tone="error" title="Error">
              {error}
            </Notice>
          ) : null}
          <Field label={check.business} value={businessName} autoComplete="organization" onChange={setBusinessName} />
          <Field label={check.city} value={city} help={check.cityHelp} autoComplete="address-level2" onChange={setCity} />
          <Field label={check.email} value={email} type="email" autoComplete="email" onChange={setEmail} />
          <label className="grid gap-2">
            <span className={fieldLabel}>{check.note}</span>
            <textarea
              className={`${textInput} min-h-28 py-3`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <span className="text-[1rem] leading-relaxed text-ink/65">{check.noteHelp}</span>
          </label>
          <SubmitButton type="submit" className="min-h-14 w-full text-[1rem]" disabled={status === "loading"}>
            {status === "loading" ? check.preparing : check.submit}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  help,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className={fieldLabel}>{label}</span>
      <input
        className={textInput}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {help ? <span className="text-[1rem] leading-relaxed text-ink/65">{help}</span> : null}
    </label>
  );
}
