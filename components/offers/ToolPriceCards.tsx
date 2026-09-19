import Link from "next/link";
import { Card } from "@/components/ui/Blocks";
import { genesisTools } from "@/lib/offers";

/**
 * The three tools priced as cards, on the same four aligned rows as the
 * managed levels beside them: what it costs, what it is, what it is for, and
 * what it produces. Subgrid keeps the rows level, so the cards stay the same
 * size and only the answers differ.
 */
export function ToolPriceCards({ headingLevel = "h3" }: { headingLevel?: "h3" | "h4" }) {
  const Heading = headingLevel;

  return (
    <ol className="grid gap-4 md:grid-cols-3 md:[grid-template-rows:repeat(4,auto)]">
      {genesisTools.map((tool) => (
        <Card
          key={tool.id}
          as="li"
          className="relative grid content-start gap-6 overflow-hidden md:row-span-4 md:gap-4 md:[grid-template-rows:subgrid]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(201_165_94/0.55),transparent)]"
          />

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-dark uppercase">
                Tool {tool.number}
              </p>
              {tool.price.cadence === "monthly" ? (
                <span className="rounded-full border border-line-light px-2.5 py-0.5 text-[0.72rem] text-muted-dark">
                  Recurring
                </span>
              ) : null}
            </div>

            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">
                {tool.price.display}
              </span>
              <span className="text-[0.9rem] text-muted-dark">per {tool.price.unit}</span>
            </p>
          </div>

          <Heading className="text-[clamp(1.35rem,2vw,1.7rem)] leading-tight tracking-[-0.03em]">
            <Link
              href={`/tools/${tool.id}`}
              className="transition-colors duration-200 hover:text-gold-dark"
            >
              {tool.name}
            </Link>
          </Heading>

          <div className="border-t border-line-light pt-4">
            <p className="font-display text-[0.6rem] tracking-[0.16em] text-muted-dark uppercase">
              What it is for
            </p>
            <p className="mt-2 text-[0.92rem] leading-snug">{tool.pricing.for}</p>
          </div>

          <div className="border-t border-line-light pt-4">
            <p className="font-display text-[0.6rem] tracking-[0.16em] text-muted-dark uppercase">
              What you get
            </p>
            <ul className="mt-3 grid gap-2">
              {tool.pricing.get.map((point) => (
                <li
                  key={point}
                  className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-[0.9rem] leading-snug"
                >
                  <span aria-hidden="true" className="mt-[0.4rem] size-1.5 rounded-full bg-gold" />
                  <span className="opacity-85">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </ol>
  );
}
