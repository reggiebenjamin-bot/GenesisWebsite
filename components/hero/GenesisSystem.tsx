"use client";

import Image from "next/image";
import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";
import { useReducedMotion } from "motion/react";
import { GenesisCompileLogo } from "@/components/layout/GlobalLogoIntro";
import { AnimatedBeam } from "@/components/ui/animated-beam";

type Stage = {
  index: string;
  title: string;
  note?: string;
  body: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

type OutgoingStage = {
  index: number | null;
  transitionId: number;
};

const stages: Stage[] = [
  {
    index: "01",
    title: "Microsoft 365 Foundation",
    body: "Business email, identity, calendars, Teams, and documents — professionally provisioned as the base of the operation.",
    icon: FoundationIcon,
  },
  {
    index: "02",
    title: "AI Workflows & Automation",
    body: "Practical workflows for follow-up, administration, document handling, routing, and repetitive real-estate work.",
    icon: WorkflowIcon,
  },
  {
    index: "03",
    title: "Genesis CRM",
    note: "Optional",
    body: "Pipelines, campaigns, booking, marketing automation, and structured follow-up when the operation needs them.",
    icon: CrmIcon,
  },
  {
    index: "04",
    title: "Fully Managed",
    note: "Ongoing",
    body: "Monitoring, support, maintenance, workflow refinement, and continued improvement after implementation.",
    icon: ManagedIcon,
  },
];

const nodePositions = [
  "left-[21%] top-[29%] max-sm:left-[27%] max-sm:top-[22%]",
  "left-[21%] top-[71%] max-sm:left-[27%] max-sm:top-[78%]",
  "left-[79%] top-[29%] max-sm:left-[73%] max-sm:top-[22%]",
  "left-[79%] top-[71%] max-sm:left-[73%] max-sm:top-[78%]",
] as const;

const stageKickers = [
  "Foundation",
  "Automation",
  "Optional layer",
  "Ongoing management",
] as const;

const HubGlowCircle = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className: string }
>(({ children, className }, ref) => (
  <div ref={ref} className={`genesis-circle ${className}`}>
    <div className="genesis-circle-surface">
      <span className="genesis-circle-sheen" aria-hidden="true" />
      <span className="genesis-circle-content">{children}</span>
    </div>
  </div>
));

HubGlowCircle.displayName = "HubGlowCircle";

const SystemCircle = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => (
    <HubGlowCircle
      ref={ref}
      className="z-10 size-14 text-gold-light sm:size-16"
    >
      {children}
    </HubGlowCircle>
  ),
);

SystemCircle.displayName = "SystemCircle";

/**
 * Shared by the live destination and the static laptop preview. Every system
 * layer connects directly to the central Genesis hub rather than to one another.
 */
export function GenesisSystem({
  decorative = false,
}: {
  decorative?: boolean;
}) {
  const detailId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const foundationRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const crmRef = useRef<HTMLDivElement>(null);
  const managedRef = useRef<HTMLDivElement>(null);
  const genesisRef = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [previewStage, setPreviewStage] = useState<number | null>(null);
  const [autoStage, setAutoStage] = useState<number | null>(null);
  const [outgoingStage, setOutgoingStage] = useState<OutgoingStage | null>(
    null,
  );
  const [isEditorialTransitioning, setIsEditorialTransitioning] =
    useState(false);
  const transitionIdRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const nodeRefs = [foundationRef, workflowRef, crmRef, managedRef] as const;
  const activeStageIndex = decorative
    ? null
    : (previewStage ?? selectedStage ?? autoStage);
  const activeStage =
    activeStageIndex === null ? null : stages[activeStageIndex];
  const showBeams = !decorative;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || decorative || reduceMotion) return;

    let startTimer = 0;
    let holdTimer = 0;
    let exitTimer = 0;
    let clearTimer = 0;

    const clearTimers = () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(clearTimer);
    };

    const stopCycle = () => {
      clearTimers();
      setOutgoingStage(null);
      setIsEditorialTransitioning(false);
    };

    const showStage = (stageIndex: number) => {
      setAutoStage(stageIndex);
      setIsEditorialTransitioning(false);

      // Keep a complete stage on screen for more than five seconds, then let
      // it finish its exit before the following stage is even mounted.
      holdTimer = window.setTimeout(() => {
        transitionIdRef.current += 1;
        setOutgoingStage({
          index: stageIndex,
          transitionId: transitionIdRef.current,
        });
        setIsEditorialTransitioning(true);

        exitTimer = window.setTimeout(() => {
          setOutgoingStage(null);

          // A short clear beat makes the end of one fade unmistakable before
          // the next heading begins its own slower entrance.
          clearTimer = window.setTimeout(() => {
            showStage((stageIndex + 1) % stages.length);
          }, 350);
        }, 1300);
      }, 5200);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        stopCycle();
        if (!entry?.isIntersecting) return;

        // Preserve the overview long enough for the photographic laptop and
        // live section to crossfade before the system begins presenting layers.
        startTimer = window.setTimeout(() => {
          showStage(0);
        }, 3000);
      },
      { threshold: 0.48 },
    );

    observer.observe(section);

    return () => {
      clearTimers();
      observer.disconnect();
    };
  }, [decorative, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-svh w-full flex-col justify-center bg-ink pt-[calc(var(--header-height)+clamp(1.25rem,3vh,2.25rem))] pb-[clamp(2rem,5vh,4rem)] text-ivory"
    >
      <div className="shell grid items-center gap-[clamp(2.5rem,6vw,6rem)] lg:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)]">
        <div
          className="genesis-editorial-panel max-w-[32rem]"
          data-stage={activeStage?.index ?? "overview"}
        >
          <div
            aria-hidden="true"
            className="genesis-editorial-grid absolute inset-0"
          />
          <span
            aria-hidden="true"
            className="genesis-editorial-accent absolute top-0 left-0"
          />

          <div className="genesis-editorial-copy-stack relative z-10">
            {outgoingStage && !reduceMotion ? (
              <EditorialCopy
                key={`outgoing-${outgoingStage.transitionId}`}
                stageIndex={outgoingStage.index}
                phase="exit"
                hidden
              />
            ) : null}
            {!isEditorialTransitioning ? (
              <EditorialCopy
                key={`current-${activeStageIndex ?? "overview"}`}
                id={detailId}
                stageIndex={activeStageIndex}
                phase="enter"
              />
            ) : null}
          </div>

          {!decorative ? (
            <div
              className="genesis-editorial-progress relative z-10 mt-1 flex gap-2"
              aria-hidden="true"
            >
              {stages.map((stage, index) => (
                <span
                  key={stage.index}
                  data-active={activeStageIndex === index ? "true" : "false"}
                />
              ))}
            </div>
          ) : null}

          <div className="relative z-10 mt-4">
            {decorative ? (
              <span className="inline-flex min-h-10 items-center gap-2 border-b border-gold/30 text-[0.84rem] font-medium text-ivory/82">
                Explore the complete system
                <span aria-hidden="true">↗</span>
              </span>
            ) : (
              <Link
                href="/solutions"
                className="inline-flex min-h-10 items-center gap-2 border-b border-gold/30 text-[0.84rem] font-medium text-ivory/82 transition-colors duration-200 hover:border-gold-light hover:text-gold-light"
              >
                Explore the complete system
                <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="genesis-system-surface relative min-h-[31rem] overflow-hidden bg-ink max-lg:min-h-[28rem] max-sm:min-h-[35rem]"
        >
          {decorative ? <StaticHubConnectors /> : null}

          <div className="absolute inset-0 z-10">
            {stages.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <button
                  type="button"
                  key={stage.index}
                  aria-label={`Show details for ${stage.title}`}
                  aria-controls={decorative ? undefined : detailId}
                  aria-pressed={
                    decorative ? undefined : selectedStage === index
                  }
                  data-active={
                    !decorative && activeStageIndex === index ? "true" : "false"
                  }
                  onPointerEnter={
                    decorative ? undefined : () => setPreviewStage(index)
                  }
                  onPointerLeave={
                    decorative ? undefined : () => setPreviewStage(null)
                  }
                  onFocus={
                    decorative ? undefined : () => setPreviewStage(index)
                  }
                  onBlur={decorative ? undefined : () => setPreviewStage(null)}
                  onClick={
                    decorative
                      ? undefined
                      : () =>
                          setSelectedStage((current) =>
                            current === index ? null : index,
                          )
                  }
                  tabIndex={decorative ? -1 : 0}
                  className={`genesis-stage-trigger absolute z-10 size-px -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-inherit focus-visible:outline-none ${nodePositions[index]}`}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <SystemCircle ref={nodeRefs[index]}>
                      <Icon aria-hidden="true" className="size-5 sm:size-6" />
                    </SystemCircle>
                  </div>

                  <div className="absolute top-[calc(50%+2.5rem)] left-1/2 w-[7.5rem] -translate-x-1/2 text-center sm:top-[calc(50%+2.75rem)] sm:w-[9rem]">
                    <p className="text-[0.68rem] leading-[1.25] text-ivory sm:text-[0.78rem]">
                      {stage.title}
                      {stage.note ? (
                        <span className="ml-1.5 whitespace-nowrap font-display text-[0.4rem] tracking-[0.08em] text-gold/50 uppercase">
                          ({stage.note})
                        </span>
                      ) : null}
                    </p>
                  </div>
                </button>
              );
            })}

            <HubGlowCircle
              ref={genesisRef}
              className="absolute top-1/2 left-1/2 z-20 size-[5.5rem] -translate-x-1/2 -translate-y-1/2 sm:size-24"
            >
              {decorative ? (
                <Image
                  src="/brand/genesis-logo.svg"
                  alt="Genesis"
                  width={48}
                  height={48}
                  loading="eager"
                  className="h-auto w-10 sm:w-11"
                />
              ) : (
                <GenesisCompileLogo className="h-auto w-10 sm:w-11" />
              )}
            </HubGlowCircle>
          </div>

          {showBeams ? (
            <>
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={foundationRef}
                toRef={genesisRef}
                curvature={14}
                delay={0}
                duration={1.8}
                repeat={Infinity}
                repeatDelay={4.8}
                pathColor="#C9A55E"
                pathWidth={1.25}
                pathOpacity={0.22}
                gradientStartColor="#C9A55E"
                gradientStopColor="#F2D895"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={workflowRef}
                toRef={genesisRef}
                curvature={-14}
                delay={1.15}
                duration={1.8}
                repeat={Infinity}
                repeatDelay={4.8}
                pathColor="#C9A55E"
                pathWidth={1.25}
                pathOpacity={0.22}
                gradientStartColor="#C9A55E"
                gradientStopColor="#F2D895"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={genesisRef}
                toRef={crmRef}
                curvature={14}
                delay={2.4}
                duration={1.8}
                repeat={Infinity}
                repeatDelay={4.8}
                pathColor="#C9A55E"
                pathWidth={1.25}
                pathOpacity={0.22}
                gradientStartColor="#C9A55E"
                gradientStopColor="#F2D895"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={genesisRef}
                toRef={managedRef}
                curvature={-14}
                delay={3.6}
                duration={1.8}
                repeat={Infinity}
                repeatDelay={4.8}
                pathColor="#C9A55E"
                pathWidth={1.25}
                pathOpacity={0.22}
                gradientStartColor="#C9A55E"
                gradientStopColor="#F2D895"
              />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function EditorialCopy({
  stageIndex,
  phase,
  id,
  hidden = false,
}: {
  stageIndex: number | null;
  phase: "enter" | "exit";
  id?: string;
  hidden?: boolean;
}) {
  const stage = stageIndex === null ? null : stages[stageIndex];

  return (
    <div
      id={id}
      className="genesis-editorial-copy"
      data-phase={phase}
      aria-hidden={hidden || undefined}
    >
      <p className="font-display text-[0.62rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold uppercase">
        {stage
          ? `${stage.index} · ${stageKickers[stageIndex!]}`
          : "The Genesis System"}
      </p>

      <h2 className="mt-3 min-h-[2.05em] max-w-[16ch] text-[clamp(1.75rem,min(3vw,4.4vh),2.8rem)] leading-[1.04]">
        {stage ? stage.title : "One managed system behind the operation."}
      </h2>

      <p
        className={`mt-4 min-h-[4.35rem] max-w-[45ch] text-[clamp(0.82rem,1vw,0.94rem)] leading-relaxed text-ivory/58 ${
          stage ? "line-clamp-3" : "line-clamp-2"
        }`}
      >
        {stage
          ? stage.body
          : "Your foundation, workflows, CRM, and ongoing management—connected by Genesis."}
      </p>
    </div>
  );
}

function StaticHubConnectors() {
  const pathProps = {
    fill: "none",
    stroke: "#C9A55E",
    strokeOpacity: ".24",
    strokeWidth: ".3",
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <svg
        className="hidden size-full sm:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path d="M 25 31 C 34 31, 40 43, 44 47" {...pathProps} />
        <path d="M 25 69 C 34 69, 40 57, 44 53" {...pathProps} />
        <path d="M 56 47 C 60 43, 66 31, 75 31" {...pathProps} />
        <path d="M 56 53 C 60 57, 66 69, 75 69" {...pathProps} />
      </svg>
      <svg
        className="size-full sm:hidden"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path d="M 31 24 C 38 29, 41 42, 44 47" {...pathProps} />
        <path d="M 31 76 C 38 71, 41 58, 44 53" {...pathProps} />
        <path d="M 56 47 C 59 42, 62 29, 69 24" {...pathProps} />
        <path d="M 56 53 C 59 58, 62 71, 69 76" {...pathProps} />
      </svg>
    </div>
  );
}

function FoundationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M4 19.5h16M6 19V8l6-3 6 3v11M9 10.5h1M14 10.5h1M9 14h1M14 14h1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
    </svg>
  );
}

function WorkflowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="6" cy="6" r="2" strokeWidth="1.45" />
      <circle cx="18" cy="12" r="2" strokeWidth="1.45" />
      <circle cx="6" cy="18" r="2" strokeWidth="1.45" />
      <path
        d="M8 6h2.5a3.5 3.5 0 0 1 3.5 3.5V12m0 0h2M14 12v2.5a3.5 3.5 0 0 1-3.5 3.5H8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
    </svg>
  );
}

function CrmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M4 6h16M7 6v5m5-5v11m5-11v8"
        strokeLinecap="round"
        strokeWidth="1.45"
      />
      <rect x="5" y="11" width="4" height="4" rx=".6" strokeWidth="1.45" />
      <rect x="10" y="17" width="4" height="3" rx=".6" strokeWidth="1.45" />
      <rect x="15" y="14" width="4" height="4" rx=".6" strokeWidth="1.45" />
    </svg>
  );
}

function ManagedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 3.5 19 6v5.5c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6l7-2.5Z"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
      <path
        d="m8.7 12 2.1 2.1 4.5-4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
    </svg>
  );
}
