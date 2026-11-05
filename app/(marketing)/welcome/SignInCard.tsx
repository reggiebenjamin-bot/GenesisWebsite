import { POD_URL, welcomeReadyCopy } from "@/lib/welcomePath";

/**
 * The self serve sign in card. It renders the same markup on the server and
 * inside the client AccountReady, so a visitor sees Forgot password and Sign in
 * to Genesis immediately, with the login link defaulting to the Genesis pod.
 */
export function SignInCard({
  href = POD_URL,
  heading = welcomeReadyCopy.accountReadyHeading,
  note,
}: {
  href?: string;
  heading?: string;
  note?: string;
}) {
  return (
    <div className="mx-auto mt-8 max-w-[46ch] rounded-[8px] border border-gold/60 bg-ink-soft px-6 py-6 text-center">
      <p className="text-[1.3rem] font-light text-ivory">{heading}</p>
      <p className="mt-3 text-[0.98rem] leading-relaxed text-ivory/74">{welcomeReadyCopy.body}</p>
      <a
        href={href}
        className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-[6px] bg-gold px-6 text-[0.84rem] font-bold tracking-[0.025em] text-ink"
      >
        {welcomeReadyCopy.button}
      </a>
      {note ? <p className="mt-4 text-[0.9rem] leading-relaxed text-ivory/60">{note}</p> : null}
    </div>
  );
}
