import type { Pack } from "@/packs/types";
import { platformCopy } from "@/lib/platform/copy";
import { SampleMark } from "./Chrome";

/** Product preview. Stage labels only. Lender names are not part of this view. */
export function ProductPreview({ pack }: { pack: Pack }) {
  return (
    <div
      data-testid="product-preview"
      className="rounded-[6px] border border-line-light bg-paper p-6 text-ink shadow-[0_18px_44px_rgb(8_9_14/0.06)] sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold-dark uppercase">
          {pack.label}
        </p>
        <SampleMark />
      </div>
      <p className="mt-4 text-[1.75rem] leading-none tracking-[-0.04em]">{pack.previewTitle}</p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        {pack.kpis.map((kpi) => (
          <div key={kpi.id} className="rounded-[6px] border border-line-light px-4 py-4">
            <p className="text-[0.95rem] text-ink/70">{kpi.label}</p>
            <p className="mt-2 text-[1.75rem] leading-none tracking-[-0.04em] tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>
      <ol className="mt-4">
        {pack.stages.map((stage) => (
          <li
            key={stage.id}
            className="flex items-center justify-between gap-4 border-t border-line-light py-2 text-[1rem]"
          >
            <span>{stage.label}</span>
            <span className="text-ink/50 tabular-nums">{stage.items.length}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[0.95rem] text-ink/60">{platformCopy.dryRun}</p>
    </div>
  );
}
