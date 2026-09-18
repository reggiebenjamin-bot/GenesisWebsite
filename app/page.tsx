import { HawkHero } from "@/components/home/HawkHero";
import { AgentSections, CustomInfrastructureSections } from "@/components/home/PathSections";

/**
 * A homepage for each way to use Genesis. The hero is shared: the hawk stays
 * and only the title changes. Everything after it is the chosen path's own
 * layout.
 *
 * Both are server-rendered, and the toggle chooses which one shows, in place,
 * through the attribute on <html>, so neither flashes before the other.
 */
export default function Home() {
  return (
    <>
      <HawkHero />

      <div data-offer-panel="agent">
        <AgentSections />
      </div>

      <div data-offer-panel="custom-infrastructure">
        <CustomInfrastructureSections />
      </div>
    </>
  );
}
