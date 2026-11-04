import { aiEmployeePlans } from "./aiEmployees.ts";
import { genesisTools, managedPlans } from "./offers.ts";

/**
 * The post checkout welcome page serves every paid plan, so it needs one way
 * to name a plan from the id carried in a Checkout Session's metadata. This
 * resolves across the AI Employees plans and the Genesis Managed AI plans.
 */
export type PlanKind = "ai-employees" | "managed";

export type ResolvedPlan = {
  id: string;
  name: string;
  kind: PlanKind;
};

export function resolvePlan(planId: string): ResolvedPlan | null {
  const employee = aiEmployeePlans.find((plan) => plan.id === planId);
  if (employee) return { id: employee.id, name: employee.name, kind: "ai-employees" };

  const managed = managedPlans.find((plan) => plan.id === planId);
  if (managed) return { id: managed.id, name: managed.name, kind: "managed" };

  return null;
}

/**
 * Human product name for a purchase alert, resolved from the plan id carried in
 * a Checkout Session's metadata. Covers the AI Employees plans, the Genesis
 * Managed AI plans and the one time Genesis Tools, for example "AI Employees
 * Duo", "Genesis Business Recover" or "Deal Architect". Returns an empty string
 * when the id is not recognised so the alert can fall back to a generic title.
 */
export function purchaseProductName(planId: string): string {
  const employee = aiEmployeePlans.find((plan) => plan.id === planId);
  if (employee) return `AI Employees ${employee.name}`;

  const managed = managedPlans.find((plan) => plan.id === planId);
  if (managed) return `Genesis ${managed.name}`;

  const tool = genesisTools.find((entry) => entry.id === planId);
  if (tool) return tool.name;

  return "";
}
