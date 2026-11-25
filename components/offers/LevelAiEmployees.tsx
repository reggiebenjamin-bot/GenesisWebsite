import { LEVEL_AI_EMPLOYEES_LABEL, levelAiEmployeesLine, type ManagedPlan } from "@/lib/offers";

/**
 * The AI employees a Level includes, the same small block wherever the Levels
 * are listed (the homepage, /pricing and each edition page): the label, then
 * the names with their roles on one line, as "Ava (front desk) and Darius (sales)".
 */
export function LevelAiEmployees({
  plan,
  className = "",
}: {
  plan: Pick<ManagedPlan, "includedAiAgents">;
  className?: string;
}) {
  return (
    <div className={`border-t border-line-light pt-4 ${className}`}>
      <p className="font-display text-[0.75rem] tracking-[0.12em] text-muted-dark uppercase">{LEVEL_AI_EMPLOYEES_LABEL}</p>
      <p className="mt-2 text-[0.92rem] leading-snug">{levelAiEmployeesLine(plan)}</p>
    </div>
  );
}
