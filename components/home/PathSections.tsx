import { Sheet } from "@/components/ui/Blocks";
import { HomeFaq } from "./HomeFaq";
import { ManagedBento } from "./ManagedBento";
import { OperatingThesis } from "./OperatingThesis";
import { PlanCards } from "./PlanCards";

/**
 * The homepage after the story: the thesis, what Managed AI does, the levels
 * with checkout, then the questions. How an engagement runs and the closing
 * consultation already appear in the story (StoryHowItWorks, StoryClose), so
 * they are not repeated here.
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
