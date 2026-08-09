import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";

/** The closing block shared by every page. */
export function ConsultationCTA() {
  return (
    <section className="border-t border-line-dark bg-ink py-[clamp(90px,10vw,150px)] text-ivory">
      <div className="shell grid items-end gap-[clamp(60px,10vw,150px)] lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Eyebrow>Build the operating advantage</Eyebrow>
          <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">
            Make the system behind the work as strong as the work itself.
          </h2>
        </div>

        <div className="pb-4.5">
          <p className="text-muted-light">
            Start with a focused consultation about your operation, priorities,
            and existing tools.
          </p>
          <Button href="/contact" className="mt-8">
            Book a Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
