import { Reveal } from "@/components/ui/Reveal";
import { SectionIntro, Sheet } from "@/components/ui/Blocks";
import { HawkInActionPlayer } from "@/components/home/HawkInActionPlayer";
import { FUNDING_LINE } from "@/lib/legal";

const beats = [
  { label: "Ask", body: "Hawk reads your book and tells you who to call first." },
  { label: "Act", body: "One tap to call, or open the lead." },
  { label: "Approve", body: "Hawk drafts it, then waits. Nothing goes out without your approval." },
];

/**
 * "See Hawk in action": a muted, looping product film and a click to play
 * full spot with sound. It sits directly under the Hawk hero, which is left
 * exactly as it is. The film is real footage of the Genesis workspace with
 * sample data, with its captions burned in, so it needs no sound to follow.
 */
export function HawkInAction() {
  return (
    <Sheet surface="ink" aria-labelledby="hawk-in-action-title" className={[
        "site-section pt-[clamp(40px,5vw,72px)]!",
        /* Phones only: the hero keeps a tall empty margin below its buttons, so pull this section up
           into it by about half the screen height, and let its top 72px fade in from transparent so
           no edge shows. Wider screens are not affected. */
        "max-sm:-mt-[calc(50svh-200px)]!",
        "max-sm:bg-transparent! max-sm:bg-[linear-gradient(to_bottom,transparent,var(--color-ink)_72px)]!",
      ].join(" ")}>
      <SectionIntro
        layout="center"
        eyebrow="See Hawk in action"
        title="Ask. Act. Stay in control."
        titleId="hawk-in-action-title"
      />

      <Reveal>
        <HawkInActionPlayer />
      </Reveal>

      <ol className="mx-auto mt-10 grid max-w-[64rem] gap-4 md:grid-cols-3">
        {beats.map((b, i) => (
          <li key={b.label} className="rounded-[6px] border border-line-dark bg-ink-soft p-5">
            <p className="font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold uppercase">
              {String(i + 1).padStart(2, "0")} {b.label}
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-light">{b.body}</p>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-8 max-w-[56ch] text-center text-[0.78rem] leading-relaxed text-muted-light/80">
        <p>Sample data shown.</p>
        <p className="mt-1">{FUNDING_LINE}</p>
      </div>
    </Sheet>
  );
}
