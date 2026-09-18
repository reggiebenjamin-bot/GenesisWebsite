import { DealReportPreview } from "@/components/offers/DealReportPreview";
import { Disclosure, Points, SectionIntro } from "@/components/ui/Blocks";
import {
  dataProvenance,
  dataProvenanceMeaning,
  neverFabricated,
  numbersHandled,
} from "@/lib/offers";

/**
 * How Deal Architect handles numbers, shown rather than told: the sample
 * report carries the section, with three points beside it and the label
 * definitions waiting behind a disclosure. For an ink sheet.
 */
export function NumbersSplit() {
  return (
    <div className="grid items-center gap-[clamp(40px,6vw,88px)] lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <SectionIntro
          eyebrow="How the numbers are handled"
          title={numbersHandled.title}
          titleId="numbers-title"
          className="mb-8"
        />
        <Points items={numbersHandled.points} />

        <Disclosure summary="What the labels mean" className="mt-9">
          <dl className="grid gap-2.5">
            {dataProvenance.map((label) => (
              <div key={label} className="grid gap-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
                <dt className="font-display text-[0.64rem] leading-6 tracking-[0.14em] text-gold uppercase">
                  {label}
                </dt>
                <dd>{dataProvenanceMeaning[label]}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4">
            <span className="text-ivory">Never fabricated:</span>{" "}
            {neverFabricated.join(", ").toLowerCase()}.
          </p>
        </Disclosure>
      </div>

      {/* Opaque on ink: the card's default translucent white is meant for paper. */}
      <DealReportPreview className="bg-paper" />
    </div>
  );
}
