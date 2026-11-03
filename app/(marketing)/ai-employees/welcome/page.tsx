import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { aiEmployeePlans, softwareDisclaimer } from "@/lib/aiEmployees";
import { stripeServer } from "@/lib/stripeServer";
import { IntakeForm } from "./IntakeForm";

export const metadata: Metadata = {
  title: "Welcome to Genesis AI Employees",
  description: "Complete your onboarding intake so Genesis can provision your AI employees.",
  robots: { index: false, follow: false },
};

const steps = [
  "Complete your intake today",
  "We provision your AI employees within 1 business day",
  "Book your kickoff call",
  "Day 1 deliverables",
  "Seven day check in",
] as const;

type Confirmed = { planName: string; email: string };

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
    const plan = aiEmployeePlans.find((candidate) => candidate.id === planId);
    const email = session.customer_details?.email ?? session.customer_email ?? "";
    return { planName: plan?.name ?? "", email: email ?? "" };
  } catch {
    return null;
  }
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const confirmed = await confirmSession(sessionId);

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
          <Eyebrow className="mt-8">Genesis AI Employees</Eyebrow>
          <h1 className="mx-auto mt-5 max-w-[22ch] font-light text-[clamp(2.8rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance">
            Thank you. Your AI employees are on the way.
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
        </div>
        <ol className="mx-auto grid max-w-[44rem] gap-4">
          {steps.map((step, index) => (
            <li
              key={step}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-[6px] border border-line-light bg-white/70 p-[clamp(18px,2vw,26px)]"
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-gold bg-ink font-display text-[0.95rem] text-gold-light tabular-nums">
                {index + 1}
              </span>
              <span className="text-[1.02rem] leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
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
              The more you share, the faster your AI employees start working your pipeline.
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
