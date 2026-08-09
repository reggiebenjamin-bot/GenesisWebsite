import type { ReactNode } from "react";

/** The Orbitron kicker that opens most blocks. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-display text-[0.69rem] leading-[1.4] font-semibold tracking-[0.18em] text-gold uppercase ${className}`}
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
      className={`relative py-[clamp(88px,11vw,168px)] ${tones[tone]} ${className}`}
      {...props}
    >
      <div className="shell">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-[clamp(52px,7vw,84px)] max-w-[900px]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-[clamp(2.4rem,5vw,5rem)]">{title}</h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-[1.05rem] opacity-72">{description}</p>
      ) : null}
    </div>
  );
}

/** The dark masthead every page except the homepage opens with. */
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="flex min-h-[620px] items-end border-b border-line-dark bg-ink pt-[calc(var(--header-height)+110px)] pb-[110px] text-ivory md:min-h-[720px]">
      <div className="shell max-w-[980px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 text-[clamp(2.8rem,6vw,5.5rem)]">{title}</h1>
        <p className="mt-7 max-w-2xl text-[1.08rem] text-ivory/72">
          {description}
        </p>
      </div>
    </section>
  );
}
