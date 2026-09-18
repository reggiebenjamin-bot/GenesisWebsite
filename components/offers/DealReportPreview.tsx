import type { DataProvenance } from "@/lib/offers";
import { cn } from "@/lib/utils";

type Row = { label: string; value: string; source: DataProvenance; note?: string };

/* Illustrative figures only, internally consistent: total cost is purchase
   plus rehab, spread is ARV minus total cost, and cash assumes the stated
   purchase financing with the rehab paid in cash. */
const ROWS: readonly Row[] = [
  { label: "Property type", value: "Single-family", source: "Known" },
  { label: "Purchase price", value: "$210,000", source: "User provided" },
  { label: "Rehab budget", value: "$48,000", source: "User provided" },
  { label: "ARV", value: "$335,000", source: "User provided" },
  { label: "Total project cost", value: "$258,000", source: "Calculated" },
  { label: "Estimated gross spread", value: "$77,000", source: "Calculated" },
  {
    label: "Estimated cash requirement",
    value: "$90,000",
    source: "Estimated",
    note: "Assumes 80% purchase financing",
  },
  { label: "Title information", value: "Not provided", source: "Missing" },
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
 * What a Deal Architect report looks like: every figure carries where it came
 * from, and what is missing is reported as missing. An illustrative example,
 * labelled as one, with real text rather than a picture of text.
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
            <dt className="text-[0.88rem] text-ink/78">
              {row.label}
              {row.note ? (
                <span className="block text-[0.74rem] text-muted-dark">{row.note}</span>
              ) : null}
            </dt>
            <dd
              className={cn(
                "text-right text-[0.95rem] tabular-nums",
                row.source === "Missing" ? "text-muted-dark italic" : "font-medium text-ink",
              )}
            >
              {row.value}
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
          Rehab budget has no stated contingency.
        </p>
        <p>
          <span className="block font-display text-[0.58rem] tracking-[0.14em] text-muted-dark uppercase">
            Next action
          </span>
          Request title information before relying on the exit.
        </p>
      </div>

      <figcaption className="sr-only">
        Illustrative Deal Architect report for an example property. Each figure is
        labelled known, user provided, calculated, estimated, or missing.
      </figcaption>
    </figure>
  );
}
