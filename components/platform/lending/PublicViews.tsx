"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { SubmitButton } from "@/components/ui/Button";
import { docPhases, fundingDisclaimer, lendingStages, publicDeal, stageLabel } from "@/lib/platform/lending/model";
import { Notice, SampleMark, fieldLabel, textInput } from "../Chrome";
import { useDesk } from "./session";

const quiet =
  "inline-flex min-h-12 items-center justify-center rounded-[6px] border border-line-light px-4 text-[1rem]";

/**
 * Borrower facing screens. They read public deal fields only.
 * Do not render source names here.
 */
export function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-line-light">
        <div className="mx-auto flex min-h-16 w-full max-w-xl items-center justify-between px-4">
          <Logo />
          <Link href="/desk/status" className="min-h-11 text-[1rem] font-medium">
            Deal status
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-xl px-4 py-10">
        {children}
      </main>
      <footer className="bg-ink px-4 py-8 text-ivory">
        <p className="mx-auto max-w-xl text-[1rem] leading-relaxed text-ivory/80">
          508 Pat Booker Rd #5147, Universal City, TX 78148
        </p>
        <p className="mx-auto mt-2 max-w-xl text-[1rem] leading-relaxed text-ivory/70">{fundingDisclaimer}</p>
      </footer>
    </div>
  );
}

export function PortalHome() {
  const { deals } = useDesk();
  const rows = deals.filter((deal) => deal.outcome !== "closed").map(publicDeal);
  return (
    <div className="grid gap-6" data-testid="lending-portal">
      <SampleMark />
      <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-[-0.04em]">Your deals</h1>
      <p className="text-[1.125rem] leading-relaxed text-ink/75">Stages only. This page does not show a funding source.</p>
      <div>
        <p className={fieldLabel}>Overall progress. Sample data.</p>
        <div className="mt-2 h-2 rounded-full bg-ivory-deep" role="progressbar" aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 w-2/5 rounded-full bg-gold" />
        </div>
      </div>
      <ol className="grid gap-2">
        {lendingStages.map((stage, index) => (
          <li key={stage.id} className="flex min-h-14 items-center gap-4 rounded-[6px] border border-line-light px-4">
            <span className="font-display text-[0.8rem] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-[1.125rem]">{stage.label}</span>
          </li>
        ))}
      </ol>
      <ul className="grid gap-2">
        {rows.map((deal) => (
          <li key={deal.id} className="rounded-[6px] border border-line-light px-4 py-4">
            <p className="text-[1.125rem]">{deal.title}</p>
            <p className="mt-1 text-[1rem] text-ink/70">{deal.stage}. {deal.amount}. Sample data.</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Link className={quiet} href="/desk/portal/upload">Upload</Link>
        <Link className={quiet} href="/desk/portal/options">Options</Link>
        <Link className={quiet} href="/desk/intake">Intake</Link>
      </div>
    </div>
  );
}

export function UploadPage() {
  const [receipt, setReceipt] = useState<string | null>(null);
  return (
    <div className="grid gap-6" data-testid="lending-upload">
      <SampleMark />
      <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] leading-none tracking-[-0.04em]">Upload</h1>
      <p className="text-[1.125rem] leading-relaxed text-ink/75">A receipt on this screen. Nothing is uploaded.</p>
      {docPhases.map((phase) => (
        <section key={phase.id}>
          <h2 className="text-[1.3rem]">{phase.label}</h2>
          <ul className="mt-2 grid gap-2">
            {phase.items.map((item) => (
              <li key={item} className="flex min-h-12 items-center justify-between gap-3 rounded-[6px] border border-line-light px-4">
                <span>{item}</span>
                <span className={fieldLabel}>Waiting</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <label className="grid gap-2">
        <span className={fieldLabel}>File</span>
        <input
          type="file"
          className="min-h-12 text-[1rem]"
          onChange={(event) => {
            const name = event.target.files?.[0]?.name;
            setReceipt(name ? "Receipt noted on this screen. Nothing was uploaded." : null);
          }}
        />
      </label>
      {receipt ? <Notice tone="success" title="Ready">{receipt}</Notice> : null}
    </div>
  );
}

export function OptionsPage() {
  const options = [
    { id: "a", title: "Sample option A", detail: "A sample structure on this screen. Not an offer." },
    { id: "b", title: "Sample option B", detail: "Another sample structure. Not a placement." },
  ];
  return (
    <div className="grid gap-6" data-testid="lending-options">
      <SampleMark />
      <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] leading-none tracking-[-0.04em]">Your options</h1>
      <p className="text-[1.125rem] leading-relaxed text-ink/75">Stages and sample structures only.</p>
      <ul className="grid gap-3">
        {options.map((option) => (
          <li key={option.id} className="rounded-[6px] border border-line-light p-4">
            <p className="text-[1.35rem]">{option.title}</p>
            <p className="mt-2 text-[1.05rem] text-ink/75">{option.detail}</p>
            <p className="mt-2 text-[1rem]">Stage shown to you: {stageLabel("terms_ready")}</p>
          </li>
        ))}
      </ul>
      <Link className={quiet} href="/desk/portal/upload">Send supporting documents</Link>
      <p className="text-[1.05rem] leading-relaxed">{fundingDisclaimer}</p>
    </div>
  );
}

const intakeSteps = [
  { title: "About you", fields: ["Full name", "Email", "Phone", "Entity"] },
  { title: "Financing", fields: ["Loan type"] },
  { title: "The property", fields: ["Address", "City", "Amount"] },
  { title: "Experience", fields: ["A short history", "Credit range"] },
  { title: "Documents", fields: [] },
  { title: "Review", fields: [] },
] as const;

export function IntakeWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const current = intakeSteps[step];
  return (
    <div className="grid gap-6" data-testid="lending-intake">
      <SampleMark />
      <p className={fieldLabel}>Step {step + 1} of {intakeSteps.length}</p>
      <div className="h-2 rounded-full bg-ink/10" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={6}>
        <div className="h-full rounded-full bg-gold" style={{ width: `${((step + 1) / intakeSteps.length) * 100}%` }} />
      </div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">{current?.title}</h1>
      {done ? (
        <Notice tone="success" title="Ready">Request noted on this screen. Nothing was sent.</Notice>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < intakeSteps.length - 1) setStep(step + 1);
            else setDone(true);
          }}
        >
          {current?.fields.map((field) => (
            <label key={field} className="grid gap-2">
              <span className={fieldLabel}>{field}</span>
              {field === "Loan type" ? (
                <select className={textInput} defaultValue="Purchase">
                  {["Purchase", "Refinance", "Construction", "Bridge"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <input className={textInput} />
              )}
            </label>
          ))}
          {step === 4 ? <p className="text-[1.05rem] text-ink/75">Documents are optional. Nothing is uploaded in this preview.</p> : null}
          {step === 5 ? <p className="text-[1.05rem]">Review the sample answers on this screen, then record the request.</p> : null}
          <div className="flex gap-2">
            {step > 0 ? (
              <button type="button" className={quiet} onClick={() => setStep(step - 1)}>Back</button>
            ) : null}
            <SubmitButton type="submit" className="min-h-14 flex-1">{step === 5 ? "Record the request" : "Continue"}</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
