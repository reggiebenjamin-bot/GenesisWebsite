"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowClockwise, Pause, Play } from "@phosphor-icons/react";
import type { WorkspaceToolId } from "@/lib/toolWorkspace";
import styles from "./ExampleWalkthrough.module.css";

type Demo = {
  fields: readonly { label: string; value: string }[];
  document: string;
  sections: readonly string[];
};

const demos: Record<WorkspaceToolId, Demo> = {
  "deal-architect": {
    fields: [
      { label: "Property", value: "Ridgeview renovation" },
      { label: "Strategy", value: "Renovate and resell" },
      { label: "Purchase estimate", value: "$145,000" },
    ],
    document: "Deal assessment",
    sections: ["Decision overview", "Transaction review", "Risks to verify"],
  },
  "deal-packager": {
    fields: [
      { label: "Property", value: "Parkside multifamily" },
      { label: "Location", value: "Austin, Texas" },
      { label: "Package for", value: "Investor review" },
    ],
    document: "Investor package",
    sections: ["Opportunity", "Investment overview", "Supporting evidence"],
  },
  "capital-advisor": {
    fields: [
      { label: "Project", value: "Oakline acquisition" },
      { label: "Purpose", value: "Acquisition and rehab" },
      { label: "Funding request", value: "$200,000" },
    ],
    document: "Capital plan",
    sections: ["Sources and uses", "Financing assumptions", "Readiness notes"],
  },
};

const FIELD_PAUSE_TICKS = 8;

export function ExampleWalkthrough({ toolId }: { toolId: WorkspaceToolId }) {
  const demo = demos[toolId];
  const totalTicks = useMemo(
    () => demo.fields.reduce((total, field) => total + field.value.length + FIELD_PAUSE_TICKS, 0),
    [demo],
  );
  const [ticks, setTicks] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      const timeout = window.setTimeout(() => {
        setTicks(totalTicks);
        setPlaying(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }
    if (!playing) return;
    const interval = window.setInterval(() => {
      setTicks((current) => Math.min(current + 1, totalTicks));
    }, 76);
    return () => window.clearInterval(interval);
  }, [playing, totalTicks]);

  useEffect(() => {
    if (ticks >= totalTicks && playing) {
      const timeout = window.setTimeout(() => setPlaying(false), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [ticks, totalTicks, playing]);

  const visibleFields = demo.fields.map((field, index) => {
    const position = demo.fields.slice(0, index).reduce(
      (total, previous) => total + previous.value.length + FIELD_PAUSE_TICKS,
      0,
    );
    const value = field.value.slice(0, Math.max(0, Math.min(field.value.length, ticks - position)));
    const active = ticks >= position && ticks < position + field.value.length + FIELD_PAUSE_TICKS;
    return { ...field, visible: value, active };
  });
  const activeIndex = visibleFields.findIndex((field) => field.active);
  const finished = ticks >= totalTicks;

  function togglePlayback() {
    if (finished) {
      setTicks(0);
      setPlaying(true);
    } else {
      setPlaying((current) => !current);
    }
  }

  return (
    <section className={styles.walkthrough} aria-label="Read-only product example">
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.demoForm}>
          <div className={styles.demoFormHeading}>
            <span className={styles.sparkle}>✦</span>
            <span>Preparing a sample brief</span>
          </div>
          <div className={styles.demoFields}>
            {visibleFields.map((field) => (
              <div className={styles.demoField} key={field.label}>
                <span>{field.label}</span>
                <div className={`${styles.fakeInput} ${field.active ? styles.activeInput : ""}`}>
                  {field.visible}
                  {field.active && playing && !finished ? <i className={styles.caret} /> : null}
                </div>
              </div>
            ))}
            {activeIndex >= 0 ? (
              <span className={styles.fakeCursor} style={{ transform: `translateY(calc(${activeIndex} * var(--cursor-step)))` }}>
                <svg width="22" height="25" viewBox="0 0 22 25" fill="none" aria-hidden="true"><path d="M2 2L18 13H10L7 22L2 2Z" fill="#17150f" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.demoOutput}>
          <div className={styles.paperBack} />
          <div className={styles.paper}>
            <div className={styles.paperBrand}>GENESIS</div>
            <h3>{demo.document}</h3>
            <div className={styles.paperRule} />
            {demo.sections.map((section) => (
              <div key={section} className={styles.paperSection}>
                <span>{section}</span>
                <i /><i /><i />
              </div>
            ))}
          </div>
          <span className={styles.maskNotice}>Sample output masked</span>
        </div>
      </div>
      <div className={styles.playback}>
        <button type="button" onClick={togglePlayback} aria-label={finished ? "Replay example" : playing ? "Pause example" : "Play example"}>
          {finished ? <ArrowClockwise aria-hidden="true" size={19} /> : playing ? <Pause aria-hidden="true" size={18} weight="fill" /> : <Play aria-hidden="true" size={18} weight="fill" />}
        </button>
        <div>
          <span>Example walkthrough</span>
          <div className={styles.progressTrack}><div style={{ transform: `scaleX(${ticks / totalTicks})` }} /></div>
        </div>
        <small>{finished ? "Complete" : playing ? "Playing" : "Paused"}</small>
      </div>
      <p className={styles.a11yDescription}>This is a read-only animated example. It types sample details into a form and shows a masked sample result. Your own brief starts below.</p>
    </section>
  );
}
