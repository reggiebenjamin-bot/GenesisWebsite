import Link from "next/link";
import { Card, Disclosure, Figure } from "@/components/ui/Blocks";
import { genesisTools } from "@/lib/offers";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-line-light bg-white/55 px-2.5 py-1 text-[0.78rem]";

/**
 * One card per tool, as the tools page presents it: the job it does, who it
 * is for, and what it costs. The steps it works through — and, for Funding
 * Ready, everything it can produce — wait behind a disclosure. The name and
 * "Explore" lead to the tool's own page.
 */
export function ToolDetailCards() {
  return (
    <ul className="grid items-start gap-4 lg:grid-cols-3">
      {genesisTools.map((tool) => {
        const numbered = tool.structure.label === "Structured workflow";
        const disclosure = tool.outputs
          ? `${tool.structure.label} and potential outputs`
          : tool.structure.label;

        return (
          <Card key={tool.id} as="li" id={tool.id} className="flex scroll-mt-28 flex-col">
            <div className="flex min-h-7 items-center justify-between gap-3">
              <span className="font-display text-[0.7rem] tracking-[0.14em] text-gold-dark">
                {tool.number}
              </span>
              {tool.price.cadence === "monthly" ? (
                <span className="rounded-full border border-line-light px-2.5 py-0.5 text-[0.72rem] text-muted-dark">
                  Recurring
                </span>
              ) : null}
            </div>

            <h3 className="mt-6 text-[clamp(1.6rem,2.2vw,2rem)] leading-[1.05] tracking-[-0.03em]">
              <Link
                href={`/tools/${tool.id}`}
                className="transition-colors duration-200 hover:text-gold-dark"
              >
                {tool.name}
              </Link>
            </h3>
            <p className="mt-3 text-[1.05rem] leading-snug tracking-[-0.01em]">{tool.hub.headline}</p>
            <div className="mt-3 grid gap-2 text-[0.92rem] leading-relaxed text-muted-dark">
              {tool.hub.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {tool.primaryUsers ? (
              <p className="mt-4 text-[0.88rem] leading-relaxed">
                <span className="font-display text-[0.6rem] tracking-[0.16em] text-gold-dark uppercase">
                  For{" "}
                </span>
                {tool.primaryUsers}
              </p>
            ) : null}

            <div className="mt-auto pt-8">
              <div className="flex items-end justify-between gap-4 border-t border-line-light pt-5">
                <Figure value={tool.price.display} unit={`/ ${tool.price.detail ?? tool.price.unit}`} />
                <Link
                  href={`/tools/${tool.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.88rem] font-bold text-ink transition-colors duration-200 hover:text-gold-dark"
                >
                  Explore {tool.name}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <Disclosure summary={disclosure} className="mt-5">
                <ol className="flex flex-wrap gap-1.5">
                  {tool.structure.steps.map((step, index) => (
                    <li key={step} className={chip}>
                      {numbered || tool.outputs ? (
                        <span className="font-display text-[0.6rem] text-gold-dark">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      ) : null}
                      {step}
                    </li>
                  ))}
                </ol>

                {tool.outputs ? (
                  <>
                    <p className="mt-5 font-display text-[0.62rem] tracking-[0.16em] uppercase opacity-70">
                      Potential outputs
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {tool.outputs.map((output) => (
                        <li key={output} className={chip}>
                          {output}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </Disclosure>
            </div>
          </Card>
        );
      })}
    </ul>
  );
}
