import {
  ArrowsClockwise,
  Blueprint,
  Buildings,
  CalendarBlank,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Crane,
  Cube,
  EnvelopeSimple,
  FileText,
  Gear,
  Handshake,
  House,
  ListChecks,
  MagnifyingGlass,
  MapPin,
  Megaphone,
  PlugsConnected,
  ShieldCheck,
  TreeStructure,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { BriefFunnel } from "./scenes/BriefFunnel";
import { ConvergeHub } from "./scenes/ConvergeHub";
import { CycleHub } from "./scenes/CycleHub";
import { IntakeChain } from "./scenes/IntakeChain";
import { LayerStack } from "./scenes/LayerStack";
import { RadialHub } from "./scenes/RadialHub";
import { ReviveCycle } from "./scenes/ReviveCycle";
import { SortFlow } from "./scenes/SortFlow";
import { StageFlow } from "./scenes/StageFlow";

/**
 * The twelve illustrations, configured.
 *
 * The archetypes in ./scenes hold the composition; everything specific to
 * Genesis lives here as data, so a change of story is a change of icons rather
 * than a change of geometry.
 */

/* ── the three FIG figures ─────────────────────────────────────────────── */

/** 0.1 — one core platform carrying every surface the operation touches. */
export function FigureCore({ className = "" }: { className?: string }) {
  return (
    <RadialHub
      className={className}
      coreIcon={Cube}
      spokes={[
        { icon: EnvelopeSimple, deg: 0 },
        { icon: CalendarBlank, deg: 45 },
        { icon: FileText, deg: 90 },
        { icon: ShieldCheck, deg: 135 },
        { icon: Buildings, deg: 180 },
        { icon: ChartBar, deg: 225 },
        { icon: UsersThree, deg: 270 },
        { icon: PlugsConnected, deg: 315 },
      ]}
    />
  );
}

/** 0.2 — scattered signals gathered into one considered output. */
export function FigureApplied({ className = "" }: { className?: string }) {
  return <ConvergeHub className={className} />;
}

/** 0.3 — the same system, kept running, round and round. */
export function FigureManaged({ className = "" }: { className?: string }) {
  return <CycleHub className={className} />;
}

/* ── the system stack ──────────────────────────────────────────────────── */

export { LayerStack as SystemLayerStack };

/* ── the four agent marks ──────────────────────────────────────────────── */

export const agentScenes = {
  "follow-up": ReviveCycle,
  documents: SortFlow,
  pipeline: StageFlow,
  briefs: BriefFunnel,
} as const;

/* ── the four audience marks, all on the ivory band ────────────────────── */

/** Many producers, one managed environment over all of them. */
function BrokerageScene({ className = "" }: { className?: string }) {
  return (
    <RadialHub
      tone="light"
      className={className}
      coreIcon={Buildings}
      spokes={[
        { icon: House, deg: 0 },
        { icon: MapPin, deg: 45 },
        { icon: Handshake, deg: 90 },
        { icon: Gear, deg: 135 },
        { icon: ChartBar, deg: 180 },
        { icon: Megaphone, deg: 225 },
        { icon: FileText, deg: 270 },
        { icon: UsersThree, deg: 315 },
      ]}
    />
  );
}

/** Documents and information moving through to an approval. */
function LendingScene({ className = "" }: { className?: string }) {
  return <IntakeChain tone="light" className={className} />;
}

/** Opportunities stepping forward toward something built. */
function AcquisitionsScene({ className = "" }: { className?: string }) {
  return (
    <RadialHub
      tone="light"
      className={className}
      coreIcon={Crane}
      spokes={[
        { icon: MagnifyingGlass, deg: 0 },
        { icon: Blueprint, deg: 45 },
        { icon: Crane, deg: 90 },
        { icon: ChartBar, deg: 135 },
        { icon: CheckCircle, deg: 180, lit: true },
        { icon: ClipboardText, deg: 225 },
        { icon: Handshake, deg: 270 },
        { icon: Buildings, deg: 315 },
      ]}
    />
  );
}

/** One operator, and the capacity the system adds around them. */
function SoloScene({ className = "" }: { className?: string }) {
  return (
    <RadialHub
      tone="light"
      className={className}
      coreIcon={UserCircle}
      spokes={[
        { icon: FileText, deg: 0 },
        { icon: CalendarBlank, deg: 45 },
        { icon: EnvelopeSimple, deg: 90 },
        { icon: ArrowsClockwise, deg: 135 },
        { icon: TreeStructure, deg: 180 },
        { icon: ChartBar, deg: 225 },
        { icon: Gear, deg: 270 },
        { icon: ListChecks, deg: 315 },
      ]}
    />
  );
}

export const audienceScenes = [
  BrokerageScene,
  LendingScene,
  AcquisitionsScene,
  SoloScene,
] as const;
