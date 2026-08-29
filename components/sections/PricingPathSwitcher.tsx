"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./PricingPathSwitcher.module.css";

type PricingPath = "mini" | "infrastructure";

const paths = [
  {
    id: "mini" as const,
    label: "Agent Dashboard",
    audience: "Software for agents & small teams",
  },
  {
    id: "infrastructure" as const,
    label: "Custom Infrastructure",
    audience: "For brokerages, lenders & complex operations",
  },
] as const;

export function PricingPathSwitcher({
  mini,
  infrastructure,
}: {
  mini: ReactNode;
  infrastructure: ReactNode;
}) {
  const [activePath, setActivePath] = useState<PricingPath>("mini");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const syncPathFromHash = () => {
      if (window.location.hash === "#infrastructure") {
        setActivePath("infrastructure");
      } else if (window.location.hash === "#mini") {
        setActivePath("mini");
      }
    };

    syncPathFromHash();
    window.addEventListener("hashchange", syncPathFromHash);
    return () => window.removeEventListener("hashchange", syncPathFromHash);
  }, []);

  function selectPath(path: PricingPath) {
    setActivePath(path);
    window.history.replaceState(null, "", `#${path}`);
  }

  function selectFromKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const keyTargets: Partial<Record<string, number>> = {
      Home: 0,
      End: paths.length - 1,
      ArrowLeft: (currentIndex - 1 + paths.length) % paths.length,
      ArrowUp: (currentIndex - 1 + paths.length) % paths.length,
      ArrowRight: (currentIndex + 1) % paths.length,
      ArrowDown: (currentIndex + 1) % paths.length,
    };
    const nextIndex = keyTargets[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    selectPath(paths[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={styles.switcher}>
      <div
        className={styles.tablist}
        role="tablist"
        aria-label="Choose a Genesis pricing path"
      >
        {paths.map((path, index) => {
          const selected = activePath === path.id;

          return (
            <button
              key={path.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`pricing-tab-${path.id}`}
              aria-controls={`pricing-panel-${path.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => selectPath(path.id)}
              onKeyDown={(event) => selectFromKeyboard(event, index)}
            >
              <strong>{path.label}</strong>
              <span>{path.audience}</span>
            </button>
          );
        })}
      </div>

      <section
        role="tabpanel"
        id="pricing-panel-mini"
        aria-labelledby="pricing-tab-mini"
        tabIndex={0}
        hidden={activePath !== "mini"}
        className={styles.panel}
      >
        {mini}
      </section>

      <section
        role="tabpanel"
        id="pricing-panel-infrastructure"
        aria-labelledby="pricing-tab-infrastructure"
        tabIndex={0}
        hidden={activePath !== "infrastructure"}
        className={styles.panel}
      >
        {infrastructure}
      </section>
    </div>
  );
}
