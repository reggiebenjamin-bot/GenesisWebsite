import Link from "next/link";
import { Card, Figure, Points } from "@/components/ui/Blocks";
import { genesisTools } from "@/lib/offers";

/**
 * The three Genesis Tools as three cards: the tool, its headline and what it
 * does, three points, and what it costs. Each tool's own page has the rest.
 */
export function ToolCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {genesisTools.map((tool) => (
        // Two across on a tablet, with the recurring tool spanning the row below.
        <Card key={tool.id} as="li" className="flex flex-col sm:max-lg:last:col-span-2">
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
          <p className="mt-2 text-[1.05rem] leading-snug tracking-[-0.01em]">{tool.tagline}</p>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-dark">{tool.body}</p>

          <Points items={tool.keyPoints} className="mt-6" />

          <div className="mt-auto pt-8">
            <div className="flex items-end justify-between gap-4 border-t border-line-light pt-5">
              <Figure value={tool.price.display} unit={`/ ${tool.price.unit}`} />
              <Link
                href={`/tools/${tool.id}`}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.88rem] font-bold text-ink transition-colors duration-200 hover:text-gold-dark"
              >
                View {tool.name}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </ul>
  );
}
