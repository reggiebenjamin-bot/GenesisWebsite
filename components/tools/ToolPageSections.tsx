import Link from "next/link";
import { DealReportPreview } from "@/components/offers/DealReportPreview";
import { Card, SectionIntro } from "@/components/ui/Blocks";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TextLink } from "@/components/ui/Button";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FactList } from "@/components/ui/FactList";
import { Eyebrow } from "@/components/ui/Section";
import {
  dataProvenance,
  dataProvenanceMeaning,
  genesisTools,
  neverFabricatedSentence,
  toolFlow,
  toolJourney,
  toolsToManaged,
  type GenesisTool,
} from "@/lib/offers";
import type { ToolPage } from "@/lib/toolPages";
import { cn } from "@/lib/utils";

const pad = (index: number) => String(index + 1).padStart(2, "0");

/* ── hero ───────────────────────────────────────────────────────────── */

/**
 * The tool's name as the page's one H1, what it is in a sentence, and what it
 * costs with the way to ask about it — everything a search result or an
 * answer engine needs, in the first screen of server-rendered HTML.
 */
export function ToolHero({ page, interestHref }: { page: ToolPage; interestHref: string }) {
  const { tool } = page;

  return (
    <section className="relative overflow-hidden border-b border-line-dark bg-ink pt-[calc(var(--header-height)+56px)] pb-[clamp(64px,8vw,112px)] text-ivory">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgb(201_165_94/0.14),transparent_46%)]"
      />
      <div className="shell relative">
        <Breadcrumbs path={`/tools/${tool.id}`} light />

        <div className="mt-[clamp(40px,6vw,72px)] grid items-end gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <div>
            <Eyebrow>Genesis Tools · {tool.number}</Eyebrow>
            <h1 className="mt-5 text-[clamp(2.9rem,6.4vw,5.6rem)] leading-[0.98] tracking-[-0.05em]">
              {tool.name}
            </h1>
            <p className="mt-6 max-w-[26ch] text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.2] tracking-[-0.02em] text-balance text-ivory/88">
              {tool.tagline}
            </p>
            <p className="mt-6 max-w-[62ch] text-[1rem] leading-relaxed text-ivory/62">
              {page.definition}
            </p>
          </div>

          <Card tone="dark" className="relative overflow-hidden border-gold/30">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(242_216_149/0.7),transparent)]"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold uppercase">
                Price
              </p>
              {tool.price.cadence === "monthly" ? (
                <span className="rounded-full border border-line-dark px-2.5 py-0.5 text-[0.72rem] text-muted-light">
                  Recurring
                </span>
              ) : null}
            </div>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-[clamp(2.6rem,4vw,3.4rem)] leading-none tracking-[-0.05em] tabular-nums">
                {tool.price.display}
              </span>
              <span className="text-[0.95rem] text-muted-light">per {tool.price.unit}</span>
            </p>
            <div className="mt-7 grid gap-4">
              <ConsultationButton href={interestHref} className="w-full">
                Ask About {tool.name}
              </ConsultationButton>
              <TextLink light href="/pricing" className="justify-self-start text-[0.88rem]">
                Compare all pricing
              </TextLink>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ── at a glance ────────────────────────────────────────────────────── */

/** The fact block: plain labels, plain answers. */
export function ToolFacts({ page }: { page: ToolPage }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
      <SectionIntro
        eyebrow="At a glance"
        title={`${page.tool.name}, in brief.`}
        titleId="facts-title"
        className="mb-0"
      />
      <FactList facts={page.facts} />
    </div>
  );
}

/* ── what you get ───────────────────────────────────────────────────── */

/**
 * What the tool produces, then — for Deal Architect — the steps it works
 * through, or — for Funding Ready — everything it can produce.
 */
export function ToolOutputs({ tool }: { tool: GenesisTool }) {
  return (
    <div>
      {/* Where the promise is the tagline word for word, the hero already said it. */}
      <SectionIntro
        eyebrow="What you get"
        title={tool.promise === tool.tagline ? `What ${tool.name} produces.` : tool.promise}
        titleId="outputs-title"
      />

      <ol className="grid gap-4 sm:grid-cols-2">
        {tool.highlights.map((highlight, index) => (
          <Card key={highlight} as="li" className="flex items-baseline gap-4">
            <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
              {pad(index)}
            </span>
            <p className="text-[1.05rem] leading-snug">{highlight}</p>
          </Card>
        ))}
      </ol>

      {tool.structure.label === "Structured workflow" ? (
        <div className="mt-10">
          <p className="font-display text-[0.62rem] tracking-[0.16em] text-muted-dark uppercase">
            {tool.structure.label}
          </p>
          <ol className="mt-4 flex flex-wrap gap-2">
            {tool.structure.steps.map((step, index) => (
              <li
                key={step}
                className="inline-flex items-center gap-2 rounded-full border border-line-light bg-white/60 px-3.5 py-1.5 text-[0.85rem]"
              >
                <span className="font-display text-[0.6rem] text-gold-dark">{pad(index)}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {tool.outputs ? (
        <div className="mt-10">
          <p className="font-display text-[0.62rem] tracking-[0.16em] text-muted-dark uppercase">
            Potential outputs
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {tool.outputs.map((output) => (
              <li
                key={output}
                className="inline-flex items-center rounded-full border border-line-light bg-white/60 px-3.5 py-1.5 text-[0.85rem]"
              >
                {output}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ── the dark middle ────────────────────────────────────────────────── */

/**
 * Deal Architect's methodology, made public: formulas first, then
 * interpretation, and every figure labelled by where it came from.
 */
export function DealArchitectMethod() {
  return (
    <div className="grid items-center gap-[clamp(40px,6vw,88px)] lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <SectionIntro
          eyebrow="Methodology"
          title="What Deal Architect calculates, and what it interprets."
          titleId="method-title"
          className="mb-6"
        />
        <p className="max-w-[54ch] text-[1rem] leading-relaxed text-muted-light">
          Deal Architect calculates financial metrics with deterministic formulas, and the AI
          reasoning layer interprets the deal only after those calculations are complete. Every
          figure carries where it came from.
        </p>

        <ol className="mt-9 border-t border-line-dark">
          {dataProvenance.map((label, index) => (
            <li
              key={label}
              className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 border-b border-line-dark py-3.5 sm:grid-cols-[2rem_8.5rem_minmax(0,1fr)] sm:gap-x-5"
            >
              <span className="font-display text-[0.62rem] text-gold/60">{pad(index)}</span>
              <span className="font-display text-[0.64rem] tracking-[0.14em] text-gold uppercase">
                {label}
              </span>
              <span className="col-start-2 text-[0.92rem] text-ivory/80 sm:col-start-auto">
                {dataProvenanceMeaning[label]}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="min-w-0">
        <DealReportPreview className="bg-paper" />
        <p className="mt-6 text-[0.88rem] leading-relaxed text-muted-light">
          {neverFabricatedSentence}
        </p>
      </div>
    </div>
  );
}

/** The structure a tool works through, as numbered steps, for an ink sheet. */
export function ToolStructure({
  tool,
  eyebrow,
  title,
  note,
}: {
  tool: GenesisTool;
  eyebrow: string;
  title: string;
  note?: { title: string; body: string };
}) {
  return (
    <div>
      <SectionIntro eyebrow={eyebrow} title={title} titleId="structure-title" />

      <ol
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          tool.structure.steps.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3",
        )}
      >
        {tool.structure.steps.map((step, index) => (
          <Card key={step} as="li" tone="dark" className="flex flex-col gap-6">
            <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold">
              {pad(index)}
            </span>
            <p className="text-[1.1rem] leading-snug tracking-[-0.01em]">{step}</p>
          </Card>
        ))}
      </ol>

      {note ? (
        <div className="mt-8 flex flex-col gap-3 rounded-[24px] border border-gold/30 p-[clamp(22px,2.4vw,32px)] sm:flex-row sm:items-baseline sm:gap-8">
          <p className="shrink-0 font-display text-[0.64rem] tracking-[0.16em] text-gold uppercase">
            {note.title}
          </p>
          <p className="text-[0.98rem] leading-relaxed text-ivory/80">{note.body}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ── where it fits ──────────────────────────────────────────────────── */

/**
 * The three tools, with this one marked, each card linking to that tool's
 * own page. Each is where a deal can go when the work calls for it, not a
 * stage every deal has to pass through.
 */
export function ToolJourneyStrip({ current }: { current: GenesisTool["id"] }) {
  return (
    <div>
      <SectionIntro
        eyebrow="Where it fits"
        title={toolFlow.headline}
        titleId="journey-title"
      />

      <ol className="grid gap-4 md:grid-cols-3">
        {toolJourney.map((step) => {
          const tool = genesisTools.find((candidate) => candidate.id === step.tool);
          if (!tool) return null;
          const here = tool.id === current;

          return (
            <li key={tool.id}>
              <Link
                href={`/tools/${tool.id}`}
                aria-current={here ? "page" : undefined}
                className={cn(
                  "group flex h-full flex-col rounded-[24px] border p-[clamp(22px,2.4vw,32px)] transition-[border-color,box-shadow,transform] duration-300",
                  here
                    ? "border-ink bg-ink text-ivory shadow-[0_22px_50px_rgb(8_9_14/0.2)]"
                    : "border-line-light bg-white/70 text-ink shadow-[0_18px_44px_rgb(8_9_14/0.06)] hover:-translate-y-0.5 hover:border-gold/40",
                )}
              >
                <span
                  className={cn(
                    "font-display text-[0.62rem] tracking-[0.16em] uppercase",
                    here ? "text-gold" : "text-gold-dark",
                  )}
                >
                  {here ? "You are here" : step.cue}
                </span>
                <span className="mt-5 text-[clamp(1.35rem,2vw,1.6rem)] leading-tight tracking-[-0.02em]">
                  {tool.name}
                </span>
                <span
                  className={cn("mt-2 text-[0.95rem]", here ? "text-muted-light" : "text-muted-dark")}
                >
                  “{step.task}”
                </span>
                <span
                  className={cn(
                    "mt-auto pt-6 text-[0.88rem] font-bold",
                    here ? "text-ivory/60" : "text-ink group-hover:text-gold-dark",
                  )}
                >
                  {tool.price.display} per {tool.price.unit}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-[clamp(32px,4vw,48px)] flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-line-light pt-8">
        <div className="max-w-[56ch]">
          <p className="text-[1.15rem] leading-snug tracking-[-0.01em]">{toolsToManaged.headline}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-dark">{toolsToManaged.body}</p>
        </div>
        <TextLink href="/solutions">{toolsToManaged.action}</TextLink>
      </div>
    </div>
  );
}
