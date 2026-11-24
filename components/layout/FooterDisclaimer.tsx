"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAssessingChurch } from "@/components/hooks/useAssessingChurch";
import { ministryEdition } from "@/lib/editions";
import { FUNDING_LINE } from "@/lib/legal";
import { isMinistryTopic } from "@/lib/ministryPage";

/*
 * The footer's one disclaimer. Business pages keep the funding line, as the
 * house rules ask; a church reading /ministry, the church version of
 * /contact or the church assessment gets the Ministry line instead, because
 * a line about lending means nothing to a pastor.
 */
function Line({ church }: { church: boolean }) {
  return <p>{church ? ministryEdition.disclaimer : FUNDING_LINE}</p>;
}

function FromUrl({ pathname, assessingChurch }: { pathname: string; assessingChurch: boolean }) {
  const topic = useSearchParams().get("topic");
  const church = pathname === "/ministry" || (pathname === "/contact" && isMinistryTopic(topic)) || assessingChurch;
  return <Line church={church} />;
}

export function FooterDisclaimer() {
  const pathname = usePathname();
  const churchHere = useAssessingChurch() && pathname === "/assessment";
  return (
    <Suspense fallback={<Line church={pathname === "/ministry" || churchHere} />}>
      <FromUrl pathname={pathname} assessingChurch={churchHere} />
    </Suspense>
  );
}
