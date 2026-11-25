"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { useAssessingChurch } from "@/components/hooks/useAssessingChurch";
import { ministryEdition } from "@/lib/editions";
import { FUNDING_LINE } from "@/lib/legal";
import { isMinistryTopic } from "@/lib/ministryPage";
import { genesisPositioning } from "@/lib/offers";

/*
 * The footer's words that change for a church. Business pages keep the
 * funding line and the business tagline, as the house rules ask; a church
 * reading /ministry, the church version of /contact or the church assessment
 * gets the Ministry line and a church tagline instead, because a line about
 * lending or growing businesses means nothing to a pastor.
 */
function ForChurch({ children }: { children: (church: boolean) => ReactNode }) {
  const pathname = usePathname();
  const churchHere = useAssessingChurch() && pathname === "/assessment";
  return (
    <Suspense fallback={children(pathname === "/ministry" || churchHere)}>
      <FromUrl pathname={pathname} assessingChurch={churchHere}>
        {children}
      </FromUrl>
    </Suspense>
  );
}

function FromUrl({
  pathname,
  assessingChurch,
  children,
}: {
  pathname: string;
  assessingChurch: boolean;
  children: (church: boolean) => ReactNode;
}) {
  const topic = useSearchParams().get("topic");
  const church = pathname === "/ministry" || (pathname === "/contact" && isMinistryTopic(topic)) || assessingChurch;
  return children(church);
}

/** The footer's one disclaimer. */
export function FooterDisclaimer() {
  return <ForChurch>{(church) => <p>{church ? ministryEdition.disclaimer : FUNDING_LINE}</p>}</ForChurch>;
}

/** Business only: a row that means nothing to a church (the Texas service area pages) is left out there. */
export function ForBusinessOnly({ children }: { children: ReactNode }) {
  return <ForChurch>{(church) => (church ? null : children)}</ForChurch>;
}

/** The line under the footer mark: what Genesis is, for whoever is reading. */
export function FooterTagline() {
  return (
    <ForChurch>
      {(church) => (
        <>
          <p className="mt-6 font-display text-[0.75rem] leading-[1.5] tracking-[0.12em] text-balance text-gold uppercase">
            {church ? "Software for churches" : genesisPositioning.category}
          </p>
          <p className="mt-3 max-w-sm text-[0.95rem] text-ivory/62">
            {church ? ministryEdition.body : genesisPositioning.brandDescription}
          </p>
        </>
      )}
    </ForChurch>
  );
}
