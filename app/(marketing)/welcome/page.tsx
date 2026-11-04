import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IntakeForm } from "@/app/(marketing)/ai-employees/welcome/IntakeForm";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { softwareDisclaimer } from "@/lib/aiEmployees";
import { resolvePlan } from "@/lib/checkoutPlans";
import {
  dayOneDeliverablesFor,
  kickoffBookingUrl,
  welcomeEmail,
} from "@/lib/onboardingDelivery";
import { stripeServer } from "@/lib/stripeServer";

export const metadata: Metadata = {
  title: "Welcome to Genesis",
  description: "Complete your onboarding intake so Genesis can begin your setup.",
  robots: { index: false, follow: false },
};

type Confirmed = { planName: string; planId: string; email: string };

/** Confirms the Checkout Session with Stripe. Returns null when it cannot be read. */
async function confirmSession(sessionId: string): Promise<Confirmed | null> {
  if (!sessionId) return null;
  const stripe = stripeServer();
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return null;
    const metadata = (session.metadata ?? {}) as Record<string, unknown>;
    const planId = typeof metadata.plan === "string" ? metadata.plan : "";
    const plan = resolvePlan(planId);
    const email = session.customer_details?.email ?? session.customer_email ?? "";
    return { planName: plan?.name ?? "", planId, email: email ?? "" };
  } catch {
    return null;
  }
}

/* Dark button with a gold outline, matching the brand's secondary action. */
const kickoffButton =
  "inline-flex min-h-[52px] items-center justify-center rounded-[6px] border border-gold bg-ink px-6 text-[0.84rem] leading-[1.1] font-bold tracking-[0.025em] text-ivory transition-colors duration-200 hover:bg-ink-soft";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const confirmed = await confirmSession(sessionId);
  const bookingUrl = kickoffBookingUrl();
  const deliverables = confirmed ? dayOneDeliverablesFor(confirmed.planId) : null;

  return (
    <>
      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+72px)] pb-24 text-center text-ivory md:pb-32">
        <div className="shell max-w-[920px]">
          <Image
            src="/brand/genesis-logo-gradient.svg"
            alt=""
            width={84}
            height={84}
            priority
            className="mx-auto h-[84px] w-[84px]"
          />
          <div className="mx-auto mt-6 h-px w-16 bg-gold" />
          <Eyebrow className="mt-8">Genesis</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[22ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            Thank you. Your Genesis setup is underway.
          </h1>
          {confirmed ? (
            <p className="mx-auto mt-6 max-w-[46ch] text-[1.08rem] leading-relaxed text-ivory/74">
              {confirmed.planName
                ? `You chose the ${confirmed.planName} plan.`
                : "Your plan is confirmed."}
              {confirmed.email ? ` A confirmation is on its way to ${confirmed.email}.` : ""}
            </p>
          ) : (
            <p className="mx-auto mt-6 max-w-[46ch] text-[1.08rem] leading-relaxed text-ivory/74">
              Thank you for your order. If you have a question about it, reach us from the{" "}
              <Link href="/contact" className="border-b border-ivory/40 text-ivory">
                contact page
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <Sheet surface="paper" rise aria-labelledby="next-title" className="site-section">
        <div className="mx-auto mb-[clamp(36px,5vw,56px)] max-w-[44rem] text-center">
          <Eyebrow>Onboarding</Eyebrow>
          <h2
            id="next-title"
            className="mt-4 font-light text-[clamp(2.2rem,4.4vw,3.9rem)] leading-[1.02] tracking-[-0.045em] text-balance"
          >
            What happens next.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[1.02rem] leading-relaxed text-muted-dark">
            {welcomeEmail.intro}
          </p>
        </div>

        <ol className="mx-auto grid max-w-[44rem] gap-4">
          {welcomeEmail.sections.map((section, index) => (
            <li
              key={section.title}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 rounded-[6px] border border-line-light bg-white/70 p-[clamp(18px,2vw,26px)]"
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-gold bg-ink font-display text-[0.95rem] text-gold-light tabular-nums">
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-[0.7rem] tracking-[0.16em] text-gold-dark uppercase">
                  {section.title}
                </h3>
                <p className="mt-2 text-[1.02rem] leading-relaxed">{section.body}</p>

                {section.title === "Day 1 deliverables" && deliverables ? (
                  <ul className="mt-3 grid gap-2">
                    {deliverables.map((item) => (
                      <li
                        key={item}
                        className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2.5 text-[0.95rem] leading-snug"
                      >
                        <span aria-hidden="true" className="text-gold-dark">
                          +
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.title === "Book your kickoff" && bookingUrl ? (
                  <a
                    className={`${kickoffButton} mt-4`}
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book your kickoff
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-8 max-w-[44rem] text-center text-[0.95rem] leading-relaxed text-muted-dark">
          {welcomeEmail.closing}
        </p>

        {sessionId ? (
          <p className="mx-auto mt-4 max-w-[44rem] text-center text-[0.9rem]">
            <Link
              href={`/welcome/status?session_id=${encodeURIComponent(sessionId)}`}
              className="border-b border-ink/30 font-bold text-ink hover:border-gold-dark hover:text-gold-dark"
            >
              Check your onboarding status
            </Link>
          </p>
        ) : null}
      </Sheet>

      <Sheet surface="paper" aria-labelledby="intake-title" className="site-section">
        <div className="mx-auto max-w-[48rem]">
          <div className="mb-[clamp(28px,4vw,44px)] text-center">
            <Eyebrow>Intake</Eyebrow>
            <h2
              id="intake-title"
              className="mt-4 font-light text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.045em] text-balance"
            >
              Tell us about your business.
            </h2>
            <p className="mx-auto mt-5 max-w-[48ch] text-[1.02rem] leading-relaxed text-muted-dark">
              The more you share, the faster Genesis can begin your setup.
            </p>
          </div>
          <IntakeForm sessionId={sessionId} />
          <p className="mx-auto mt-10 max-w-[56ch] text-center text-[0.84rem] text-muted-dark">
            {softwareDisclaimer}
          </p>
        </div>
      </Sheet>
    </>
  );
}
