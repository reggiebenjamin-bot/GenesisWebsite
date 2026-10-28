"use client";

const slices = ["#08090e", "#c9a55e", "#765426", "#101929", "#6d6c69"];

export function VerticalBars({
  items,
  max,
  height = 152,
  tone = "gold",
}: {
  items: { label: string; value: number; future?: boolean; title?: string }[];
  max: number;
  height?: number;
  tone?: "gold" | "ivory";
}) {
  const ceiling = max || 1;
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {items.map((item) => {
        const ratio = item.future ? 0 : Math.max(0, Math.min(1, item.value / ceiling));
        return (
          <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1" title={item.title}>
            <div className="flex w-full flex-1 items-end">
              <div
                className={
                  tone === "ivory"
                    ? "w-full rounded-t-[2px] bg-gold-light motion-reduce:transition-none"
                    : "w-full rounded-t-[2px] bg-gold motion-reduce:transition-none"
                }
                style={{ height: `${Math.round(ratio * 100)}%` }}
              />
            </div>
            <span className={`text-center text-[0.65rem] tabular-nums ${item.future ? "text-ivory/40" : tone === "ivory" ? "text-ivory/70" : "text-ink/55"}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HorizontalBars({
  items,
}: {
  items: { label: string; value: number; note?: string }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-[0.95rem]">
            <span>{item.label}</span>
            <span className="tabular-nums text-ink/70">{item.note}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-ivory-deep">
            <div className="h-2 rounded-full bg-gold" style={{ width: `${Math.round((item.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Donut({
  parts,
  center,
}: {
  parts: { share: number }[];
  center: string;
}) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const arcs = parts.reduce<{ share: number; offset: number }[]>((list, part) => {
    const used = list.reduce((sum, item) => sum + item.share, 0);
    return [...list, { share: part.share, offset: (used / 100) * circumference }];
  }, []);
  return (
    <svg viewBox="0 0 120 120" className="size-32" role="img" aria-label={center}>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e7ded2" strokeWidth="12" />
      {arcs.map((part, index) => {
        const length = (part.share / 100) * circumference;
        return (
          <circle
            key={index}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={slices[index % slices.length]}
            strokeWidth="12"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-part.offset}
            transform="rotate(-90 60 60)"
          />
        );
      })}
      <text x="60" y="64" textAnchor="middle" fill="#08090e" fontSize="14">
        {center}
      </text>
    </svg>
  );
}

export function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <svg viewBox="0 0 120 120" className="size-28" role="img" aria-label={label}>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e7ded2" strokeWidth="8" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#c9a55e"
        strokeWidth="8"
        strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="64" textAnchor="middle" fill="#08090e" fontSize="16">
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}

export function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points, 1);
  const step = points.length > 1 ? 280 / (points.length - 1) : 0;
  const line = points.map((point, index) => `${index * step},${40 - (point / max) * 32}`).join(" ");
  return (
    <svg viewBox="0 0 280 40" className="h-10 w-full" role="img" aria-label="Sample trend">
      <polyline fill="none" stroke="#c9a55e" strokeWidth="2" points={line} />
    </svg>
  );
}
