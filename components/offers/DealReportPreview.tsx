import type { DataProvenance } from "@/lib/offers";
import { cn } from "@/lib/utils";

type Row = {
  label: string;
  source: DataProvenance;
  revealedValue?: string;
  maskWidth?: string;
};

/* This is a layout example, not a free analysis. No calculated or sensitive
   result is present in the markup, even behind a visual blur. */
const ROWS: readonly Row[] = [
  { label: "Property type", revealedValue: "Single-family", source: "Known" },
  { label: "Purchase price", source: "User provided", maskWidth: "w-24" },
  { label: "Rehab budget", source: "User provided", maskWidth: "w-20" },
  { label: "ARV", source: "User provided", maskWidth: "w-24" },
  { label: "Total project cost", source: "Calculated", maskWidth: "w-28" },
  { label: "Estimated gross spread", source: "Calculated", maskWidth: "w-20" },
  { label: "Estimated cash requirement", source: "Estimated", maskWidth: "w-24" },
];

/* Distinguished by shape as well as tone, so the label is never carried by
   colour alone. */
const SOURCE_STYLE: Record<DataProvenance, string> = {
  Known: "border-ink/15 bg-ink/[0.06] text-ink",
  "User provided": "border-navy/25 bg-navy/[0.07] text-navy",
  Calculated: "border-gold-dark/30 bg-gold/15 text-gold-dark",
  Estimated: "border-dashed border-gold-dark/55 bg-transparent text-gold-dark",
  Missing: "border-dashed border-ink/30 bg-transparent text-muted-dark",
};

/**
 * A non-interactive illustration of the report format. Harmless structure and
 * provenance labels are visible, while the actual analysis is absent.
 */
export function DealReportPreview({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        /* min-w-0: the truncating header line would otherwise set a grid
           column's minimum width and push the page sideways on a phone. */
        "min-w-0 overflow-hidden rounded-2xl border border-line-light bg-white/70 text-ink shadow-[0_24px_60px_rgb(8_9_14/0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line-light px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-dark uppercase">
            Deal Architect
          </p>
          <p className="mt-1 truncate text-[0.98rem] font-medium tracking-[-0.01em]">
            Analysis report · Example property
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line-light px-2.5 py-1 text-[0.7rem] text-muted-dark">
          Illustrative example
        </span>
      </div>

      <dl className="divide-y divide-line-light px-5 sm:px-6">
        {ROWS.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-3 sm:grid-cols-[minmax(0,1fr)_auto_7.25rem]"
          >
            <dt className="text-[0.88rem] text-ink/78">{row.label}</dt>
            <dd className="flex min-h-5 items-center justify-end text-right text-[0.95rem] font-medium text-ink">
              {row.revealedValue ? (
                row.revealedValue
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-3 rounded-[3px] bg-gradient-to-r from-ink/[0.11] via-ink/[0.18] to-ink/[0.09]",
                      row.maskWidth,
                    )}
                  />
                  <span className="sr-only">Hidden in this example</span>
                </>
              )}
            </dd>
            <dd className="col-span-2 sm:col-span-1 sm:text-right">
              <span
                className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 font-display text-[0.58rem] tracking-[0.1em] uppercase",
                  SOURCE_STYLE[row.source],
                )}
              >
                {row.source}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 border-t border-line-light bg-ivory/60 px-5 py-4 text-[0.84rem] sm:grid-cols-2 sm:px-6">
        <p>
          <span className="block font-display text-[0.58rem] tracking-[0.14em] text-muted-dark uppercase">
            Risk flag
          </span>
          <span aria-hidden="true" className="mt-2 block h-2.5 w-4/5 rounded-[3px] bg-ink/[0.14]" />
          <span aria-hidden="true" className="mt-1.5 block h-2.5 w-2/3 rounded-[3px] bg-ink/[0.09]" />
          <span className="sr-only">Details hidden in this example</span>
        </p>
        <p>
          <span className="block font-display text-[0.58rem] tracking-[0.14em] text-muted-dark uppercase">
            Next action
          </span>
          <span aria-hidden="true" className="mt-2 block h-2.5 w-11/12 rounded-[3px] bg-ink/[0.14]" />
          <span aria-hidden="true" className="mt-1.5 block h-2.5 w-1/2 rounded-[3px] bg-ink/[0.09]" />
          <span className="sr-only">Details hidden in this example</span>
        </p>
      </div>

      <figcaption className="border-t border-line-light px-5 py-3 text-[0.74rem] leading-relaxed text-muted-dark sm:px-6">
        Example layout only. Figures, risk analysis, and next actions are masked until purchase.
      </figcaption>
    </figure>
  );
}
