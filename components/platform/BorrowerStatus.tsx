import Link from "next/link";
import { borrowerView } from "@/lib/platform/desk";
import { platformCopy } from "@/lib/platform/copy";
import { cn } from "@/lib/utils";
import { FundingDisclaimer, SampleMark, SiteFoot } from "./Chrome";
import { Logo } from "@/components/layout/Logo";

/** Customer status. This module does not import lender names. */
export function BorrowerStatus() {
  const model = borrowerView();
  return (
    <div className="min-h-dvh bg-paper text-ink" data-testid="borrower-status">
      <header className="border-b border-line-dark bg-ink md:border-line-light md:bg-paper">
        <div className="mx-auto flex min-h-16 w-full max-w-xl items-center justify-between px-4">
          <span className="md:hidden">
            <Logo light />
          </span>
          <span className="hidden md:inline-flex">
            <Logo />
          </span>
          <Link href="/work" className="min-h-11 text-[1rem] font-medium text-ivory underline-offset-4 hover:underline md:text-ink">
            {platformCopy.status.back}
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-xl px-4 py-12">
        <SampleMark />
        <p className="mt-4 font-display text-[0.69rem] tracking-[0.18em] text-gold-dark uppercase">
          {platformCopy.status.previewFor}
        </p>
        <h1 className="mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.04em]">{model.title}</h1>
        <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">{model.lede}</p>
        <p className="mt-8 text-[1.5rem] leading-none tracking-[-0.04em]">{model.sampleTitle}</p>
        <ol className="mt-8 grid gap-2" aria-label={model.title}>
          {model.stages.map((stage, index) => (
            <li
              key={stage.id}
              aria-current={stage.state === "current" ? "step" : undefined}
              className={cn(
                "flex min-h-14 items-center gap-4 rounded-[6px] border px-4",
                stage.state === "current" ? "border-ink bg-ink text-ivory" : "border-line-light bg-white",
              )}
            >
              <span className="font-display text-[0.8rem] tracking-[0.14em] tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[1.125rem]">{stage.label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <FundingDisclaimer text={model.disclaimer} />
        </div>
      </main>
      <SiteFoot />
    </div>
  );
}
