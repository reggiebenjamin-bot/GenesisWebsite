import { Sheet } from "@/components/ui/Blocks";
import { HomeFaq } from "./HomeFaq";
import { ManagedBento } from "./ManagedBento";
import { OperatingThesis } from "./OperatingThesis";
import { PlanCards } from "./PlanCards";

/**
 * The homepage after the story: the thesis, what Managed AI does, the levels,
 * then the questions. How an engagement runs is told once, in chapter five,
 * and the page closes once, with StoryClose.
 */
export function CustomInfrastructureSections() {
  return (
    <>
      <OperatingThesis current="custom-infrastructure" />

      <Sheet surface="paper" rise aria-labelledby="managed-title" className="site-section">
        <ManagedBento />
        <div className="mt-[clamp(80px,10vw,128px)]">
          <PlanCards />
        </div>
      </Sheet>

      <HomeFaq path="custom-infrastructure" rise />
    </>
  );
}
