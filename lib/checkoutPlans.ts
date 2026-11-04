import { aiEmployeePlans } from "./aiEmployees.ts";
import { managedPlans } from "./offers.ts";

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
