import { systemLayers } from "@/lib/content";
import { Reveal } from "./Reveal";

export function SystemLayers({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`system-layers ${compact ? "system-layers--compact" : ""}`}>
      {systemLayers.map((layer, index) => (
        <Reveal key={layer.number} className="system-layer" delay={index * 0.06}>
          <div className="system-layer__top">
            <span>{layer.number}</span>
            <span className="system-layer__connector" aria-hidden="true" />
          </div>
          <h3>{layer.title}</h3>
          <p>{layer.description}</p>
          {!compact ? (
            <ul>
              {layer.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      ))}
    </div>
  );
}
