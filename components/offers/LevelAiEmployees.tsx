import { LEVEL_AI_EMPLOYEES_LABEL, levelAiEmployeesLine, type ManagedPlan } from "@/lib/offers";

/**
 * The AI employees a Level includes, the same small block wherever the Levels
 * are listed (the homepage, /pricing, /ai-employees and each edition page): the label, then
 * the names with their roles on one line, as "Ava (front desk) and Darius (sales)".
 */
export function LevelAiEmployees({
  plan,
  className = "",
  tone = "light",
}: {
  plan: Pick<ManagedPlan, "includedAiAgents">;
  className?: string;
  /** "dark" for a card on ink, as on /ai-employees. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={`border-t pt-4 ${dark ? "border-ivory/15" : "border-line-light"} ${className}`}>
      <p
        className={`font-display text-[0.75rem] tracking-[0.12em] uppercase ${dark ? "text-ivory/60" : "text-muted-dark"}`}
      >
        {LEVEL_AI_EMPLOYEES_LABEL}
      </p>
      <p className="mt-2 text-[0.92rem] leading-snug">{levelAiEmployeesLine(plan)}</p>
    </div>
  );
}
