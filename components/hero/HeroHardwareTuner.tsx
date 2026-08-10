"use client";

import { useEffect, useState } from "react";

type Mode = "desktop" | "mobile";
type Geometry = Record<"x" | "y" | "w" | "h", number>;

const defaults: Record<Mode, Geometry> = {
  desktop: { x: 39.88, y: 56.464, w: 20.227, h: 19.886 },
  mobile: { x: 31.939, y: 53.121, w: 36.078, h: 12.916 },
};

const fields: Array<{ key: keyof Geometry; label: string; max: number }> = [
  { key: "x", label: "Left", max: 100 },
  { key: "y", label: "Top", max: 100 },
  { key: "w", label: "Width", max: 60 },
  { key: "h", label: "Height", max: 60 },
];

/** Development-only art-direction control. Values live only in the current
 * document; reload resets them to the calibrated defaults. */
export function HeroHardwareTuner() {
  const [mode, setMode] = useState<Mode>("desktop");
  const [geometry, setGeometry] = useState(defaults);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const updateMode = () => setMode(query.matches ? "mobile" : "desktop");

    updateMode();
    query.addEventListener("change", updateMode);
    return () => query.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    const root = document.documentElement.style;
    (Object.entries(geometry) as Array<[Mode, Geometry]>).forEach(
      ([device, values]) => {
        (Object.entries(values) as Array<[keyof Geometry, number]>).forEach(
          ([key, value]) => {
            root.setProperty(`--hero-hardware-${device}-${key}`, `${value}%`);
          },
        );
      },
    );
  }, [geometry]);

  const updateValue = (key: keyof Geometry, value: number) => {
    setGeometry((current) => ({
      ...current,
      [mode]: { ...current[mode], [key]: value },
    }));
  };

  const values = geometry[mode];

  return (
    <aside
      className="fixed right-4 bottom-4 z-110 w-72 rounded-md border border-gold/45 bg-ink/95 p-4 text-ivory shadow-2xl backdrop-blur"
      aria-label="Temporary MacBook position controls"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-[0.62rem] tracking-[0.16em] text-gold-light uppercase">
            Temporary hardware tuner
          </p>
          <p className="mt-1 text-xs text-ivory/65">
            {mode === "desktop" ? "Desktop" : "Mobile"} viewport
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGeometry(defaults)}
          className="text-xs font-semibold text-gold-light underline underline-offset-4"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-3">
        {fields.map(({ key, label, max }) => (
          <label key={key} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-xs">
            <span className="text-ivory/80">{label}</span>
            <output className="font-display text-[0.65rem] text-gold-light">
              {values[key].toFixed(3)}%
            </output>
            <input
              className="col-span-2 accent-gold"
              type="range"
              min="0"
              max={max}
              step="0.01"
              value={values[key]}
              onChange={(event) => updateValue(key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      <p className="mt-3 border-t border-ivory/12 pt-3 text-[0.68rem] leading-relaxed text-ivory/55">
        Values are session-only. Send the four numbers once the laptop is aligned.
      </p>
    </aside>
  );
}
