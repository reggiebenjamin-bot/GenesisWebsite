import Link from "next/link";
import { TrackClick } from "@/components/ui/TrackClick";
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
    <p className={`text-[0.875rem] leading-snug ${className}`}>
      {/* A full 44px tap target that keeps the small visual size, counted like the edition links around it. */}
      <TrackClick event="edition_link_clicked" from="levels_enterprise">
        <Link
          href="/enterprise"
          data-track-edition="enterprise"
          className="inline-flex min-h-11 items-center underline decoration-gold/70 underline-offset-4"
        >
          {plan.enterpriseNote}
        </Link>
      </TrackClick>
    </p>
  );
}
