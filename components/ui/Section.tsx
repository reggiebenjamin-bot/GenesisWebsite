import type { ReactNode } from "react";

/** The JetBrains Mono kicker that opens most blocks. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`eyebrow font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] uppercase ${className}`}
    >
      {children}
    </p>
  );
}

type Tone = "ivory" | "dark" | "navy";

const tones: Record<Tone, string> = {
  ivory: "bg-ivory text-ink",
  dark: "bg-ink text-ivory",
  navy: "bg-navy text-ivory",
};

/** A full-width band with the site's standard vertical rhythm. */
export function Section({
  tone = "ivory",
  className = "",
  children,
  ...props
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
} & React.ComponentProps<"section">) {
  return (
    <section
      className={`site-section relative py-[clamp(88px,11vw,168px)] ${tones[tone]} ${className}`}
      {...props}
    >
      <div className="shell">{children}</div>
    </section>
  );
}

/**
 * The dark masthead every page except the homepage opens with. The
 * description may run to more than one paragraph, and the page may add its
 * first action under it.
 */
export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string | readonly string[];
  actions?: ReactNode;
}) {
  const paragraphs = typeof description === "string" ? [description] : description;

  return (
    <section className="flex min-h-[620px] items-end border-b border-line-dark bg-ink pt-[calc(var(--header-height)+110px)] pb-[110px] text-ivory md:min-h-[720px]">
      <div className="shell max-w-[980px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 text-[clamp(2.8rem,6vw,5.5rem)] text-balance">{title}</h1>
        <div className="mt-7 grid max-w-2xl gap-4 text-[1.08rem] text-ivory/72">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {actions ? <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">{actions}</div> : null}
      </div>
    </section>
  );
}
