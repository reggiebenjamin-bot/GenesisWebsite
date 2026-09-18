import { Card } from "@/components/ui/Blocks";
import { cn } from "@/lib/utils";

export type FaqItem = { question: string; answer: string };

/**
 * Questions in view, answers one tap away. Native details and summary, so the
 * list works without script, announces its state, and animates with the
 * site's disclosure easing.
 */
export function FaqList({ items, className }: { items: readonly FaqItem[]; className?: string }) {
  return (
    <Card className={cn("py-2 sm:py-3", className)}>
      {items.map((faq) => (
        <details key={faq.question} className="group border-b border-line-light last:border-b-0">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-[1.02rem] leading-snug font-medium [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span
              aria-hidden="true"
              className="text-[1.4rem] leading-none font-light text-gold-dark transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
            >
              +
            </span>
          </summary>
          <p className="max-w-[62ch] pr-8 pb-5 text-[0.95rem] leading-relaxed text-muted-dark">
            {faq.answer}
          </p>
        </details>
      ))}
    </Card>
  );
}
