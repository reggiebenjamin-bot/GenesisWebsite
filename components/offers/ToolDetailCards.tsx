import { Card, Disclosure, Figure, Points } from "@/components/ui/Blocks";
import { genesisTools } from "@/lib/offers";

/**
 * One card per tool: what it is, three things it does, and what it costs.
 * The longer answers — what it exists for, who brings it work, and the steps
 * it runs — wait behind a disclosure, so the page reads as three cards until
 * a card is asked a question.
 */
export function ToolDetailCards() {
  return (
    <ul className="grid items-start gap-4 lg:grid-cols-3">
      {genesisTools.map((tool) => (
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
            {tool.name}
          </h3>
          <p className="mt-2 text-[0.98rem] leading-snug text-muted-dark">{tool.tagline}</p>

          <Points items={tool.keyPoints} className="mt-6" />

          <div className="mt-auto pt-8">
            <div className="flex items-end justify-between gap-4 border-t border-line-light pt-5">
              <Figure value={tool.price.display} unit={`/ ${tool.price.unit}`} />
            </div>

            <Disclosure summary="What it covers" className="mt-5">
              <p>{tool.purpose}</p>
              {tool.primaryUsers ? (
                <p className="mt-3">
                  <span className="font-medium opacity-100">For: </span>
                  {tool.primaryUsers}
                </p>
              ) : null}

              <p className="mt-5 font-display text-[0.62rem] tracking-[0.16em] uppercase opacity-70">
                {tool.structure.label}
              </p>
              <ol className="mt-3 flex flex-wrap gap-1.5">
                {tool.structure.steps.map((step, index) => (
                  <li
                    key={step}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-light bg-white/55 px-2.5 py-1 text-[0.78rem]"
                  >
                    {tool.structure.label === "Structured workflow" ? (
                      <span className="font-display text-[0.6rem] text-gold-dark">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    ) : null}
                    {step}
                  </li>
                ))}
              </ol>
            </Disclosure>
          </div>
        </Card>
      ))}
    </ul>
  );
}
