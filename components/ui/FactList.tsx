import type { ReactNode } from "react";
import { Card } from "@/components/ui/Blocks";
import { cn } from "@/lib/utils";

export type Fact = { label: string; value: ReactNode };

/**
 * Plain labels and plain answers, in a card: the block a reader scans for one
 * fact, and a search engine or answer engine reads without having to guess.
 */
export function FactList({ facts, className }: { facts: readonly Fact[]; className?: string }) {
  return (
    <Card className={cn("py-2 sm:py-3", className)}>
      <dl>
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="grid gap-1 border-b border-line-light py-4 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
          >
            <dt className="font-display text-[0.62rem] leading-6 tracking-[0.16em] text-gold-dark uppercase">
              {fact.label}
            </dt>
            <dd className="text-[0.96rem] leading-relaxed">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
