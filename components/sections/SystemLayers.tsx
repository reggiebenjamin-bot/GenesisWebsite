import { systemLayers } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { SolutionMicroVisual, type SolutionVisualKind } from "./SolutionMicroVisual";

export function SystemLayers({
  compact = false,
  tone = "dark",
  visuals = false,
}: {
  compact?: boolean;
  tone?: "dark" | "light";
  visuals?: boolean;
}) {
  const light = tone === "light";
  const visualKinds: SolutionVisualKind[] = ["foundation", "workflows", "crm", "managed"];

  return (
    <div className={`grid border-y md:grid-cols-2 lg:grid-cols-4 ${light ? "border-line-light" : "border-line-dark"}`}>
      {systemLayers.map((layer, index) => (
        <Reveal
          key={layer.number}
          delay={index * 0.06}
          className={`group relative px-0 pt-8 pb-10 max-md:border-b max-md:last:border-b-0 md:border-l md:px-[30px] md:first:border-l-0 lg:nth-[3]:border-l ${
            light ? "border-line-light" : "border-line-dark"
          } ${
            visuals ? "lg:min-h-[590px]" : compact ? "lg:min-h-[390px]" : "lg:min-h-[420px]"
          } md:max-lg:nth-[-n+2]:border-b md:max-lg:nth-[3]:border-l-0`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-[420ms] ease-editorial group-hover:scale-x-100"
          />

          <div className={`flex items-center gap-4 font-display text-[0.65rem] text-gold ${visuals ? "mb-7" : "mb-11 lg:mb-[88px]"}`}>
            <span>{layer.number}</span>
            <span aria-hidden="true" className="h-px w-[34px] bg-gold/42" />
          </div>

          {visuals ? <SolutionMicroVisual kind={visualKinds[index]} /> : null}

          <h3 className={`mb-[18px] lg:min-h-14 ${light ? "text-ink" : "text-ivory"}`}>{layer.title}</h3>
          <p className={`text-[0.93rem] ${light ? "text-muted-dark" : "text-muted-light"}`}>{layer.description}</p>

          {!compact ? (
            <ul className={`mt-6 border-t pt-5 ${light ? "border-line-light" : "border-line-dark"}`}>
              {layer.details.map((detail) => (
                <li
                  key={detail}
                  className={`relative py-[5px] pl-4 text-[0.93rem] before:absolute before:top-[13px] before:left-0 before:size-[5px] before:bg-gold before:content-[''] ${light ? "text-muted-dark" : "text-muted-light"}`}
                >
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      ))}
    </div>
  );
}
