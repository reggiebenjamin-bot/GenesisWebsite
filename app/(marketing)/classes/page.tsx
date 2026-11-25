import type { Metadata } from "next";
import { Card, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow, PageIntro } from "@/components/ui/Section";
import { TrackClick } from "@/components/ui/TrackClick";
import { FUNDING_LINE } from "@/lib/legal";

/*
 * Genesis Classes, inside the site's own header and footer. It was a static
 * page in public/classes with its own look; the class detail page
 * (/classes/ai-employees) is still static and is linked with a plain <a>, so
 * next/link never prefetches it as a route. Not indexed: no class is open.
 */
const title = "Genesis Classes";
const description =
  "Live classes and education from Genesis. No class is open for seats right now. Ask to be told when the next one is scheduled.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title: `${title} | Genesis AI`, description, type: "website", siteName: "Genesis AI", locale: "en_US" },
  twitter: { card: "summary", title: `${title} | Genesis AI`, description },
};

const notifyHref = "/contact?topic=classes#consultation-form";

export default function ClassesPage() {
  return (
    <>
      <PageIntro
        compact
        eyebrow="Live classes and education"
        title="Genesis Classes"
        description="No class is open for seats right now. Ask to be told when the next one is scheduled."
      />

      <Sheet surface="paper" aria-labelledby="classes-past-title" className="site-section">
        <h2 id="classes-past-title" className="sr-only">
          Classes
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          <Card as="li" className="flex flex-col">
            <Eyebrow className="text-gold-dark">This class has ended</Eyebrow>
            <h3 className="mt-3 text-[1.7rem] leading-snug font-light tracking-[-0.035em]">
              AI Employees for Real Estate Investors
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">
              A live working session with Reginald Benjamin showing how he runs AI employees for real estate every day:
              Hawk for deal research, Susan for marketing, Darius for prospecting, and Speed to Lead so no call or text
              sits waiting.
            </p>
            <p className="mt-4 text-[0.92rem] font-semibold">
              Ran live online: Thursday, November 12, 2026 at 7:00 PM CT
            </p>
            <div className="mt-auto grid gap-2 pt-6">
              <TrackClick event="classes_notify_requested" from="classes_card">
                <ConsultationButton href={notifyHref} className="w-full">
                  Get Notified About the Next Class
                </ConsultationButton>
              </TrackClick>
              <TrackClick event="secondary_cta_clicked" from="classes_card">
                <a
                  href="/classes/ai-employees"
                  className="inline-flex min-h-11 w-fit items-center font-bold underline decoration-ink/30 underline-offset-4 transition-colors duration-200 hover:text-gold-dark"
                >
                  See What the Class Covered
                </a>
              </TrackClick>
            </div>
          </Card>
        </ul>
        <p className="mt-10 max-w-[70ch] border-t border-line-light pt-6 text-[0.875rem] leading-relaxed text-muted-dark">
          These are live classes and education only. {FUNDING_LINE}
        </p>
      </Sheet>
    </>
  );
}
