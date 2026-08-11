"use client";

import { useEffect, useState } from "react";

const DEFAULTS = {
  x: 40,
  y: 56.584,
  w: 20,
  h: 20.186,
} as const;

type Control = keyof typeof DEFAULTS;

const controls: Array<{ key: Control; label: string; min: number; max: number; step: number }> = [
  { key: "x", label: "Left", min: 28, max: 52, step: 0.01 },
  { key: "y", label: "Top", min: 45, max: 68, step: 0.01 },
  { key: "w", label: "Width", min: 10, max: 34, step: 0.01 },
  { key: "h", label: "Height", min: 10, max: 34, step: 0.01 },
];

/** Development-only desktop calibration panel. Values are applied to the
 * document in real time and deliberately stay in runtime state only. */
export function DesktopHardwareTuner() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const desktop = window.matchMedia("(min-width: 768px)");

    const apply = () => {
      if (desktop.matches) {
        root.style.setProperty("--hero-hardware-x", `${values.x}%`);
        root.style.setProperty("--hero-hardware-y", `${values.y}%`);
        root.style.setProperty("--hero-hardware-w", `${values.w}%`);
        root.style.setProperty("--hero-hardware-h", `${values.h}%`);
      } else {
        root.style.removeProperty("--hero-hardware-x");
        root.style.removeProperty("--hero-hardware-y");
        root.style.removeProperty("--hero-hardware-w");
        root.style.removeProperty("--hero-hardware-h");
      }
    };

    apply();
    desktop.addEventListener("change", apply);

    return () => {
      desktop.removeEventListener("change", apply);
      root.style.removeProperty("--hero-hardware-x");
      root.style.removeProperty("--hero-hardware-y");
      root.style.removeProperty("--hero-hardware-w");
      root.style.removeProperty("--hero-hardware-h");
    };
  }, [values]);

  const reset = () => setValues(DEFAULTS);

  const copy = async () => {
    const snippet = [
      `--hero-hardware-x: ${values.x.toFixed(3)}%;`,
      `--hero-hardware-y: ${values.y.toFixed(3)}%;`,
      `--hero-hardware-w: ${values.w.toFixed(3)}%;`,
      `--hero-hardware-h: ${values.h.toFixed(3)}%;`,
    ].join("\n");

    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <aside
      className="fixed right-4 bottom-4 z-[100] hidden w-56 rounded-md border border-gold/50 bg-ink/95 p-3 font-display text-[0.65rem] text-ivory shadow-2xl backdrop-blur md:block"
      aria-label="Desktop laptop alignment controls"
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-ivory/15 pb-2">
        <span className="tracking-[0.12em] text-gold-light uppercase">Desktop alignment</span>
        <button type="button" onClick={reset} className="text-ivory/70 underline underline-offset-2">
          Reset
        </button>
      </div>

      <div className="grid gap-2.5">
        {controls.map(({ key, label, min, max, step }) => (
          <label key={key} className="grid gap-1">
            <span className="flex items-center justify-between text-ivory/75">
              {label}
              <output>{values[key].toFixed(3)}%</output>
            </span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={values[key]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [key]: Number(event.target.value) }))
              }
              className="accent-gold"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={copy}
        className="mt-3 w-full rounded border border-gold/65 bg-gold/10 px-2 py-2 text-gold-light transition-colors hover:bg-gold/20"
      >
        {copied ? "Copied values" : "Copy CSS values"}
      </button>
    </aside>
  );
}
