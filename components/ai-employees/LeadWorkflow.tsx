"use client";

import WorkflowBlueprint from "@/components/ui/interactive-workflow-blueprint";
import {
  leadWorkflowAgent,
  leadWorkflowApps,
  leadWorkflowColors,
  leadWorkflowGraph,
  leadWorkflowIntro,
} from "@/lib/leadWorkflow";

/** The ivory and gold canvas for one illustrated lead. */
export function LeadWorkflow() {
  return (
    <WorkflowBlueprint
      title={leadWorkflowIntro.canvasTitle}
      initialGraph={leadWorkflowGraph}
      apps={leadWorkflowApps}
      agentTemplate={leadWorkflowAgent}
      style={leadWorkflowColors}
      readOnly
    />
  );
}
