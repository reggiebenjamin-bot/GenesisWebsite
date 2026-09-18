import { SectionIntro, Sheet } from "@/components/ui/Blocks";
import { FaqList } from "@/components/ui/FaqList";
import { faqs } from "@/lib/content";
import type { OfferPathId } from "@/lib/offers";
import { cn } from "@/lib/utils";

/** The homepage questions for one path: the questions in view, each answer one tap away. */
export function HomeFaq({
  path,
  rise = false,
  className,
}: {
  path: OfferPathId;
  rise?: boolean;
  className?: string;
}) {
  const titleId = `faq-title-${path}`;

  return (
    <Sheet
      surface="paper"
      rise={rise}
      aria-labelledby={titleId}
      className={cn("site-section", className)}
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionIntro
          eyebrow="FAQ"
          title="Questions serious operators ask first."
          titleId={titleId}
          className="mb-0"
        />

        <FaqList items={faqs.filter((faq) => faq.paths.includes(path))} />
      </div>
    </Sheet>
  );
}
