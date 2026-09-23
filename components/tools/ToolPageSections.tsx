import Image from "next/image";
import Link from "next/link";
import { DealReportPreview } from "@/components/offers/DealReportPreview";
import { Card, SectionIntro } from "@/components/ui/Blocks";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { FactList } from "@/components/ui/FactList";
import { Eyebrow } from "@/components/ui/Section";
import {
  dataProvenance,
  dataProvenanceMeaning,
  genesisTools,
  neverFabricatedSentence,
  type GenesisTool,
} from "@/lib/offers";
import type { ToolPage } from "@/lib/toolPages";
import { getWorkspaceTool } from "@/lib/toolWorkspace";
import { cn } from "@/lib/utils";

const pad = (index: number) => String(index + 1).padStart(2, "0");

/* ── catalog ────────────────────────────────────────────────────────── */

/**
 * Three peer entries into distinct product pages. Photography identifies each
 * job; each page begins with a read-only example and a free brief.
 */
export function ToolCatalog() {
  return (
    <ul className="grid gap-4 lg:grid-cols-3">
      {genesisTools.map((tool) => {
        const { heroImage } = getWorkspaceTool(tool.id);
        return (
          <li key={tool.id} id={tool.id} className="min-w-0 scroll-mt-28">
            <Link
              href={tool.workspaceHref}
              aria-label={`View ${tool.name} example and start a brief`}
              className="group relative isolate flex min-h-[390px] overflow-hidden rounded-[24px] border border-ivory/18 bg-ink-soft text-ivory transition-colors duration-300 hover:border-gold/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold lg:min-h-[470px]"
            >
              <Image
                src={heroImage}
                alt=""
                fill
                sizes="(max-width: 1023px) 100vw, 33vw"
                className="object-cover object-[62%_center] opacity-90 transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transition-none"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgb(8_9_14/0.98)_0%,rgb(8_9_14/0.8)_38%,rgb(8_9_14/0.06)_100%)]" />
              <div className="relative z-10 flex w-full flex-col justify-end p-[clamp(24px,3vw,36px)]">
                <span className="font-display text-[0.7rem] tracking-[0.15em] text-gold uppercase">
                  {tool.job}
                </span>
                <h2 className="mt-3 text-[clamp(2rem,3vw,3rem)] leading-none tracking-[-0.045em]">
                  {tool.name}
                </h2>
                <p className="mt-3 max-w-[31ch] text-[1rem] leading-snug text-ivory/76">
                  {tool.tagline}
                </p>
                <span className="mt-7 flex min-h-11 items-center justify-between border-t border-ivory/22 pt-4 text-[0.9rem] font-bold">
                  View product
                  <span aria-hidden="true" className="text-gold transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">↗</span>
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ── hero ───────────────────────────────────────────────────────────── */

/**
 * A focused public overview for search visitors. The selected product opens
 * on its own page, with an example and a free brief before purchase.
 */
export function ToolHero({ page, workspaceHref }: { page: ToolPage; workspaceHref: string }) {
  const { tool } = page;
  const workspaceTool = getWorkspaceTool(tool.id);

  return (
    <section className="relative overflow-hidden border-b border-line-dark bg-ink pt-[calc(var(--header-height)+56px)] pb-[clamp(64px,8vw,112px)] text-ivory">
      <Image
        src={workspaceTool.heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center opacity-90"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(8_9_14/0.99)_0%,rgb(8_9_14/0.93)_43%,rgb(8_9_14/0.18)_72%,rgb(8_9_14/0.4)_100%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgb(8_9_14/0.65),transparent_52%)]"
      />
      <div className="shell relative">
        <Breadcrumbs path={`/tools/${tool.id}`} light />

        <div className="mt-[clamp(40px,6vw,72px)] max-w-[800px]">
          <Eyebrow>Genesis Tools · {tool.job}</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.9rem,6.4vw,5.6rem)] leading-[0.98] tracking-[-0.05em]">
            {tool.name}
          </h1>
          <p className="mt-6 max-w-[28ch] text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.2] tracking-[-0.02em] text-balance text-ivory/88">
            {tool.tagline}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={workspaceHref}>View {tool.name} example</Button>
            <p className="max-w-[27ch] text-[0.86rem] leading-snug text-ivory/72">
              View the example and prepare your brief free. Pay {tool.price.display} once for the finished {tool.price.unit}.
            </p>
          </div>
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
 * What the tool produces, plus the workflow or output detail needed to
 * understand the result before entering the workspace.
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

      <ol className="grid border-t border-line-light sm:grid-cols-2">
        {tool.highlights.map((highlight, index) => (
          <li
            key={highlight}
            className="flex items-baseline gap-4 border-b border-line-light py-5 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
          >
            <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
              {pad(index)}
            </span>
            <p className="text-[1.05rem] leading-snug">{highlight}</p>
          </li>
        ))}
      </ol>

      <details className="group mt-10 border-t border-line-light">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] font-medium [&::-webkit-details-marker]:hidden">
          See the full workflow and result list
          <span aria-hidden="true" className="text-xl leading-none transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span>
        </summary>
        <div className="grid gap-8 border-t border-line-light py-6 lg:grid-cols-2">
          <div>
            <p className="font-display text-[0.62rem] tracking-[0.16em] text-muted-dark uppercase">
              {tool.structure.label}
            </p>
            <ul className="mt-4 border-t border-line-light">
              {tool.structure.steps.map((step) => (
                <li key={step} className="border-b border-line-light py-3 text-[0.88rem]">
                  {step}
                </li>
              ))}
            </ul>
          </div>
          {tool.outputs ? (
            <div>
              <p className="font-display text-[0.62rem] tracking-[0.16em] text-muted-dark uppercase">
                Potential outputs
              </p>
              <ul className="mt-4 border-t border-line-light">
                {tool.outputs.map((output) => (
                  <li key={output} className="border-b border-line-light py-3 text-[0.88rem]">
                    {output}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </details>
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
