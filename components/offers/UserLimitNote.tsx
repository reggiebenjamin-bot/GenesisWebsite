import Link from "next/link";
import type { ManagedPlan } from "@/lib/offers";

/**
 * The line under a Level's user limit that sends bigger teams to Genesis
 * Enterprise. It renders nothing for a Level without a cap note.
 */
export function UserLimitNote({
  plan,
  className = "",
}: {
  plan: Pick<ManagedPlan, "enterpriseNote">;
  className?: string;
}) {
  if (!plan.enterpriseNote) return null;
  return (
    <p className={`mt-1 text-[0.8rem] leading-snug ${className}`}>
      <Link href="/enterprise" className="underline decoration-gold/70 underline-offset-4">
        {plan.enterpriseNote}
      </Link>
    </p>
  );
}
