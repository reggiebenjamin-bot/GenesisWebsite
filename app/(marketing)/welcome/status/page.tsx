import type { Metadata } from "next";
import Link from "next/link";
import { Sheet } from "@/components/ui/Blocks";
import { Eyebrow } from "@/components/ui/Section";
import { resolvePlan } from "@/lib/checkoutPlans";
import { onboardingChecklist } from "@/lib/onboardingDelivery";
import { stripeServer } from "@/lib/stripeServer";

export const metadata: Metadata = {
  title: "Your onboarding status",
  description: "Check the status of your Genesis onboarding.",
  robots: { index: false, follow: false },
};

type Status = {
  planName: string;
  paid: boolean;
  intakeReceived: boolean;
  stage: string;
  /** How many checklist items are complete. */
  complete: number;
};

/**
 * Reads one Checkout Session by its id and reports only that order's status.
 * The session id is an unguessable capability, so a visitor can only see their
 * own order; nothing lists or exposes other customers.
 */
async function readStatus(sessionId: string): Promise<Status | null> {
  if (!sessionId) return null;
  const stripe = stripeServer();
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = (session.metadata ?? {}) as Record<string, unknown>;
    const planId = typeof metadata.plan === "string" ? metadata.plan : "";
    const plan = resolvePlan(planId);
    const paid = session.status === "complete";
    const intakeReceived = metadata.intake_received === "true";
    const stage = !paid
      ? "Payment processing"
      : intakeReceived
        ? "Intake received. Kickoff next."
        : "Awaiting your intake";
    return {
      planName: plan?.name ?? "",
      paid,
      intakeReceived,
      stage,
      complete: intakeReceived ? 1 : 0,
    };
  } catch {
    return null;
  }
}

export default async function WelcomeStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const status = await readStatus(sessionId);

  return (
    <section className="bg-paper pt-[calc(var(--header-height)+56px)] pb-[clamp(64px,8vw,112px)] text-ink">
      <Sheet surface="paper" className="site-section">
        <div className="mx-auto max-w-[44rem]">
          <div className="text-center">
            <Eyebrow>Onboarding status</Eyebrow>
            <h1 className="mt-4 font-light text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.02] tracking-[-0.045em] text-balance">
              Where your setup stands.
            </h1>
          </div>

          {status ? (
            <div className="mt-[clamp(28px,4vw,44px)] grid gap-4">
              <div className="grid gap-4 rounded-[6px] border border-line-light bg-white/70 p-[clamp(18px,2.4vw,28px)] sm:grid-cols-3">
                <Fact label="Plan" value={status.planName || "Your order"} />
                <Fact label="Payment" value={status.paid ? "Complete" : "Processing"} />
                <Fact label="Intake" value={status.intakeReceived ? "Received" : "Not yet received"} />
              </div>

              <div className="rounded-[6px] border border-gold/40 bg-white/70 p-[clamp(18px,2.4vw,28px)]">
                <p className="font-display text-[0.64rem] tracking-[0.16em] text-gold-dark uppercase">
                  Current stage
                </p>
                <p className="mt-2 text-[1.1rem] leading-snug">{status.stage}</p>
              </div>

              <div className="rounded-[6px] border border-line-light bg-white/70 p-[clamp(18px,2.4vw,28px)]">
                <p className="font-display text-[0.64rem] tracking-[0.16em] text-muted-dark uppercase">
                  Checklist
                </p>
                <ul className="mt-4 grid gap-3">
                  {onboardingChecklist.map((item, index) => {
                    const done = index < status.complete;
                    return (
                      <li
                        key={item}
                        className="grid grid-cols-[1.4rem_minmax(0,1fr)] items-baseline gap-2.5 text-[0.98rem] leading-snug"
                      >
                        <span
                          aria-hidden="true"
                          className={done ? "text-gold-dark" : "text-muted-dark/50"}
                        >
                          {done ? "✓" : "○"}
                        </span>
                        <span className={done ? "" : "text-muted-dark"}>{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {status.paid && !status.intakeReceived ? (
                <p className="text-center text-[0.95rem] text-muted-dark">
                  Complete your intake on the{" "}
                  <Link
                    href={`/welcome?session_id=${encodeURIComponent(sessionId)}`}
                    className="border-b border-ink/30 font-bold text-ink hover:border-gold-dark hover:text-gold-dark"
                  >
                    welcome page
                  </Link>
                  .
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mx-auto mt-[clamp(28px,4vw,44px)] max-w-[46ch] text-center text-[1.02rem] leading-relaxed text-muted-dark">
              We could not find an order for that link. If you have a question about your order,
              reach us from the{" "}
              <Link href="/contact" className="border-b border-ink/30 font-bold text-ink">
                contact page
              </Link>
              .
            </p>
          )}
        </div>
      </Sheet>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-[0.6rem] tracking-[0.16em] text-muted-dark uppercase">
        {label}
      </p>
      <p className="mt-2 text-[1.02rem] leading-snug">{value}</p>
    </div>
  );
}
