import { systemLayers } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function SystemLayers({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid border-y border-line-dark md:grid-cols-2 lg:grid-cols-4">
      {systemLayers.map((layer, index) => (
        <Reveal
          key={layer.number}
          delay={index * 0.06}
          className={`group relative border-line-dark px-0 pt-8 pb-10 max-md:border-b max-md:last:border-b-0 md:border-l md:px-[30px] md:first:border-l-0 lg:nth-[3]:border-l ${
            compact ? "lg:min-h-[390px]" : "lg:min-h-[420px]"
          } md:max-lg:nth-[-n+2]:border-b md:max-lg:nth-[3]:border-l-0`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-[420ms] ease-editorial group-hover:scale-x-100"
          />

          <div className="mb-11 flex items-center gap-4 font-display text-[0.65rem] text-gold lg:mb-[88px]">
            <span>{layer.number}</span>
            <span aria-hidden="true" className="h-px w-[34px] bg-gold/42" />
          </div>

          <h3 className="mb-[18px] text-ivory lg:min-h-14">{layer.title}</h3>
          <p className="text-[0.93rem] text-muted-light">{layer.description}</p>

          {!compact ? (
            <ul className="mt-6 border-t border-line-dark pt-5">
              {layer.details.map((detail) => (
                <li
                  key={detail}
                  className="relative py-[5px] pl-4 text-[0.93rem] text-muted-light before:absolute before:top-[13px] before:left-0 before:size-[5px] before:bg-gold before:content-['']"
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
