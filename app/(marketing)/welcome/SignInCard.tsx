import { welcomeReadyCopy } from "@/lib/welcomePath";

/**
 * Sign in card. The button renders only when a caller passes a dedicated
 * workspace URL. There is no shared pod fallback.
 */
export function SignInCard({
  href,
  heading = welcomeReadyCopy.signInHeading,
  note,
  body,
}: {
  href?: string;
  heading?: string;
  note?: string;
  body?: string;
}) {
  return (
    <div className="mx-auto mt-8 max-w-[46ch] rounded-[8px] border border-gold/60 bg-ink-soft px-6 py-6 text-center">
      <p className="text-[1.3rem] font-light text-ivory">{heading}</p>
      {body ? <p className="mt-3 text-[0.98rem] leading-relaxed text-ivory/74">{body}</p> : null}
      {href ? (
        <a
          href={href}
          className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-gold px-6 text-[0.84rem] font-bold tracking-[0.025em] text-ink"
        >
          {welcomeReadyCopy.button}
        </a>
      ) : null}
      {note ? <p className="mt-4 text-[0.9rem] leading-relaxed text-ivory/60">{note}</p> : null}
    </div>
  );
}
