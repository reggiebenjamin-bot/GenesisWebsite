"use client";

import { useEffect, useState } from "react";

const DEFAULTS = { x: 25.5, y: 59.5, w: 5.5, h: 8.3 } as const;
type Control = keyof typeof DEFAULTS;

const controls: Array<{ key: Control; label: string; min: number; max: number }> = [
  { key: "x", label: "Left", min: 15, max: 40 },
  { key: "y", label: "Top", min: 45, max: 75 },
  { key: "w", label: "Width", min: 2, max: 16 },
  { key: "h", label: "Height", min: 3, max: 20 },
];

/** Dev-only adjustment surface for the desktop key model. It never persists
 * values or ships in production; Copy gives the final CSS declarations. */
export function DesktopKeysTuner() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const desktop = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      if (desktop.matches) {
        root.style.setProperty("--hero-keys-x", `${values.x}%`);
        root.style.setProperty("--hero-keys-y", `${values.y}%`);
        root.style.setProperty("--hero-keys-w", `${values.w}%`);
        root.style.setProperty("--hero-keys-h", `${values.h}%`);
      } else {
        root.style.removeProperty("--hero-keys-x");
        root.style.removeProperty("--hero-keys-y");
        root.style.removeProperty("--hero-keys-w");
        root.style.removeProperty("--hero-keys-h");
      }
    };
    apply();
    desktop.addEventListener("change", apply);
    return () => {
      desktop.removeEventListener("change", apply);
      root.style.removeProperty("--hero-keys-x");
      root.style.removeProperty("--hero-keys-y");
      root.style.removeProperty("--hero-keys-w");
      root.style.removeProperty("--hero-keys-h");
    };
  }, [values]);

  const reset = () => setValues(DEFAULTS);
  const copy = async () => {
    await navigator.clipboard.writeText([
      `--hero-keys-x: ${values.x.toFixed(3)}%;`,
      `--hero-keys-y: ${values.y.toFixed(3)}%;`,
      `--hero-keys-w: ${values.w.toFixed(3)}%;`,
      `--hero-keys-h: ${values.h.toFixed(3)}%;`,
    ].join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <aside className="fixed right-4 bottom-4 z-[100] hidden w-56 rounded-md border border-gold/50 bg-ink/95 p-3 font-display text-[0.65rem] text-ivory shadow-2xl backdrop-blur md:block" aria-label="Desktop keys alignment controls">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-ivory/15 pb-2">
        <span className="tracking-[0.12em] text-gold-light uppercase">Desktop keys</span>
        <button type="button" onClick={reset} className="text-ivory/70 underline underline-offset-2">Reset</button>
      </div>
      <div className="grid gap-2.5">
        {controls.map(({ key, label, min, max }) => (
          <label key={key} className="grid gap-1">
            <span className="flex items-center justify-between text-ivory/75"><span>{label}</span><output>{values[key].toFixed(3)}%</output></span>
            <input type="range" min={min} max={max} step="0.01" value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))} className="accent-gold" />
          </label>
        ))}
      </div>
      <button type="button" onClick={copy} className="mt-3 w-full rounded border border-gold/65 bg-gold/10 px-2 py-2 text-gold-light transition-colors hover:bg-gold/20">{copied ? "Copied values" : "Copy CSS values"}</button>
    </aside>
  );
}
