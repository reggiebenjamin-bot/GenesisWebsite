import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { MinistryLevels } from "@/components/offers/MinistryLevels";
import { Card, ClosingBand, Points, SectionIntro, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { FaqList } from "@/components/ui/FaqList";
import { Reveal } from "@/components/ui/Reveal";
import { TrackClick } from "@/components/ui/TrackClick";
import { Eyebrow } from "@/components/ui/Section";
import {
  ministryAssessment,
  ministryClose,
  ministryDemo,
  ministryDemoAction,
  ministryFaq,
  ministryHero,
  ministryLevels,
  ministryLooks,
  ministryMedia,
  ministryPackage,
  ministryPlansCue,
  ministryPlatform,
  ministryProcess,
  ministryProtection,
  ministryWebsiteCheck,
  type MinistryLink,
} from "@/lib/ministryPage";
import { cn } from "@/lib/utils";
import { BackOfficePoster, DemoPoster, FrontOfficePoster, MemberAppPoster } from "./MinistryPosters";
import { MinistryVideo } from "./MinistryVideo";
import { publicAsset } from "./publicAsset";

/*
 * The sections of the Genesis Ministry page, in page order. Copy comes from
 * lib/ministryPage.ts; layout comes from the shared blocks, so the page reads
 * as part of the site while the ivory surfaces, photographs of church sites
 * and plain language make it unmistakably the church edition.
 */

/*
 * The demo previews are static files in public/ministry-demo/, copied in by
 * scripts/sync-ministry-demo.mjs. The page is prerendered, so each check runs
 * at build time: a preview is linked only once its file is there, and until
 * then the demo buttons ask for a walkthrough and the look cards are not
 * links. Nothing on the page points at a missing file.
 */
const hasFile = (path: string) => publicAsset(path) !== null;

/** The guided demo when it is published, or a walkthrough request until then. */
const demoAction = () => ministryDemoAction(hasFile);

const demoActionDark =
  "secondary-action inline-flex min-h-[52px] items-center justify-center gap-3 px-6";

/* The same action on a light surface: the site's outline button. */
const demoActionLight =
  "inline-flex min-h-[52px] items-center justify-center gap-3 rounded-[6px] border border-ink/30 px-6 text-[0.94rem] leading-[1.15] font-bold tracking-[0.01em] text-ink transition-colors duration-200 hover:bg-ink hover:text-ivory";

/**
 * The guided demo button. The demo is a static page, not an app route, so it
 * gets a plain anchor and the router never tries to prefetch it; the
 * walkthrough request is an app route and gets a Link.
 */
function DemoLink({ action, light = false }: { action: MinistryLink & { isDemo: boolean }; light?: boolean }) {
  const className = light ? demoActionLight : demoActionDark;
  const content = (
    <>
      <span>{action.label}</span>
      {light ? <span aria-hidden="true">&#8599;</span> : null}
    </>
  );
  return action.isDemo ? (
    <a href={action.href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  );
}

/** The demo as a text link, for a caption under a section. */
function DemoTextLink({ action }: { action: MinistryLink & { isDemo: boolean } }) {
  const className =
    "inline-flex min-h-11 items-center font-bold text-ink underline decoration-gold/70 underline-offset-4 transition-colors duration-200 hover:text-gold-dark";
  return action.isDemo ? (
    <a href={action.href} className={className}>
      {action.label}
    </a>
  ) : (
    <Link href={action.href} className={className}>
      {action.label}
    </Link>
  );
}

/** The quiet way into the church assessment, for a church not ready for a call. */
function AssessmentCue({ light = false, from }: { light?: boolean; from: string }) {
  return (
    <TrackClick event="assessment_link_clicked" from={from}>
      <p className={cn("text-[0.95rem] leading-snug", light ? "text-muted-dark" : "text-ivory/72")}>
        {ministryAssessment.lead}{" "}
        <Link
          href={ministryAssessment.href}
          className={cn(
            "inline-flex min-h-11 items-center font-bold underline underline-offset-4 transition-colors duration-200",
            light ? "text-ink decoration-ink/30 hover:text-gold-dark" : "text-ivory decoration-ivory/40 hover:text-gold-light",
          )}
        >
          {ministryAssessment.label}
        </Link>
      </p>
    </TrackClick>
  );
}

/** The gold arrow link that closes a block on ink. */
function InkTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center gap-2.5 border-b border-ivory/35 font-bold text-ivory transition-colors duration-200 hover:border-gold-light hover:text-gold-light"
    >
      {children}
      <span aria-hidden="true">&#8599;</span>
    </a>
  );
}

function Headline({ text, accent }: { text: string; accent: string }) {
  const at = text.lastIndexOf(accent);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-gold-light">{text.slice(at)}</span>
    </>
  );
}

/* ── 1. hero ─────────────────────────────────────────────────────────── */

export function MinistryHero() {
  const media = ministryMedia.demo;
  const film = publicAsset(media.video);
  const poster = publicAsset(media.poster);
  const posterPhone = publicAsset(media.posterPhone);
  const secondary = demoAction();
  return (
    <section
      aria-labelledby="ministry-title"
      className="hero-top relative overflow-hidden border-b border-line-dark bg-ink pb-[clamp(72px,9vw,128px)] text-ivory"
    >
      {/* A warm light over the top of the page: the church edition's one flourish. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[780px] bg-[radial-gradient(ellipse_62%_58%_at_50%_0%,rgb(201_165_94/0.17),transparent_72%)]"
      />
      <div className="shell relative">
        <div className="mx-auto max-w-[920px] text-center">
          <Image
            src="/brand/genesis-logo-gradient.svg"
            alt=""
            width={84}
            height={84}
            preload
            className="hero-mark mx-auto h-[84px] w-[84px]"
          />
          <div className="hero-rule mx-auto mt-6 h-px w-16 bg-gold" />
          <Eyebrow className="hero-eyebrow mt-8">
            {ministryHero.eyebrow}
            <span aria-hidden="true" className="px-3 text-ivory/30">
              /
            </span>
            {ministryHero.audience}
          </Eyebrow>
          <h1
            id="ministry-title"
            className="hero-title mx-auto mt-5 max-w-[16ch] font-light text-[clamp(2.6rem,6vw,5.4rem)] leading-[1.02] tracking-[-0.045em] text-balance"
          >
            <Headline text={ministryHero.headline} accent={ministryHero.accent} />
          </h1>
          <p className="hero-lede mx-auto mt-6 max-w-[52ch] text-[1.08rem] leading-relaxed text-ivory/74">
            {ministryHero.lede}
          </p>
          <div className="hero-actions mx-auto mt-9 grid max-w-[36rem] gap-3 sm:grid-cols-2">
            <TrackClick event="ministry_call_cta_clicked" from="ministry_hero">
              <ConsultationButton href={ministryHero.primary.href} className="w-full">
                {ministryHero.primary.label}
              </ConsultationButton>
            </TrackClick>
            <TrackClick event="ministry_demo_opened" from="ministry_hero">
              <DemoLink action={secondary} />
            </TrackClick>
          </div>
          {/* The first price on a phone, and the way down to the plans. */}
          <p className="mt-5 text-[0.95rem] text-ivory/72">
            {ministryPlansCue.line}{" "}
            <TrackClick event="edition_pricing_viewed" from="ministry_hero">
              <a
                href={ministryPlansCue.link.href}
                className="inline-flex min-h-11 items-center font-bold text-gold-light underline decoration-gold-light/40 underline-offset-4 hover:decoration-gold-light"
              >
                {ministryPlansCue.link.label}
              </a>
            </TrackClick>
          </p>
        </div>

        {/* No scroll reveal here: the frame is part of the first screen. On a
            phone, a drawn placeholder is too small to read, so the frame waits
            there for a real poster or film. */}
        <div className={cn("mx-auto mt-[clamp(48px,6vw,80px)] max-w-[68rem]", !film && !poster && "max-sm:hidden")}>
          <div className="rounded-[10px] border border-line-dark bg-ink-soft/60 p-1.5 shadow-[0_40px_100px_rgb(0_0_0/0.5)] sm:p-2">
            <MinistryVideo
              mode="feature"
              src={film}
              poster={poster}
              posterPhone={posterPhone}
              captions={publicAsset(media.captions)}
              label={ministryHero.filmLabel}
              stillAlt={ministryHero.stillAlt}
              playLabel={ministryHero.filmPlay}
              placeholder={<DemoPoster />}
              sizes="(min-width: 1120px) 1088px, 100vw"
              eager
            />
          </div>
          {/* Until the film exists, the frame's action sits under it rather than on the still.
              Phones have the same action right above the frame. */}
          {film ? null : (
            <div className="mt-6 flex justify-center max-sm:hidden">
              <TrackClick event="ministry_demo_opened" from="ministry_hero_frame">
                <DemoLink action={secondary} />
              </TrackClick>
            </div>
          )}
          {/* Said under the frame too, because on a phone the still's own sample strip is too small to read. */}
          {film || poster ? (
            <p className="mt-4 text-center text-[0.875rem] text-muted-light/80">{ministryHero.filmNote}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ── 2. what a church gets ───────────────────────────────────────────── */

/* The Warm Community look's own palette, from its brand board: the same
   sample church as the website shown beside it. */
const SAMPLE_PALETTE = [
  { name: "Sunflower", hex: "#FFC83A" },
  { name: "Cocoa Ink", hex: "#3A2618" },
  { name: "Leaf", hex: "#3B7A37" },
  { name: "Sky", hex: "#CFE7F8" },
  { name: "Dusk", hex: "#1F2D4D" },
] as const;

/** A corner of a brand board: a type sample and the palette swatches. */
function BrandSample() {
  return (
    <div aria-hidden="true" className="mt-6 flex items-center gap-5 rounded-[6px] border border-line-light bg-paper px-5 py-4">
      <span className="text-[2.4rem] leading-none font-light tracking-[-0.04em] text-[#3A2618]">Aa</span>
      <span className="h-8 w-px bg-line-light" />
      <span className="flex">
        {SAMPLE_PALETTE.map((swatch, index) => (
          <span
            key={swatch.hex}
            title={swatch.name}
            className={cn("size-8 rounded-full ring-2 ring-paper", index > 0 && "-ml-2")}
            style={{ background: swatch.hex }}
          />
        ))}
      </span>
    </div>
  );
}

export function MinistryPackage() {
  const [website, ...rest] = ministryPackage.items;
  const platform = rest.at(-1)!;
  const middle = rest.slice(0, -1);

  return (
    /* No site-section here or in the next three sections: content-visibility would size them by
       estimate until they near the screen, and a link to /ministry#levels, below them, would land
       short. */
    <Sheet surface="paper" rise aria-labelledby="ministry-package-title">
      <SectionIntro
        eyebrow={ministryPackage.eyebrow}
        title={ministryPackage.title}
        titleId="ministry-package-title"
        aside={<p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">{ministryPackage.aside}</p>}
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card as="li" className="grid gap-8 md:col-span-2 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="font-display text-[0.75rem] tracking-[0.12em] text-gold-dark">{website.no}</p>
            <h3 className="mt-3 text-[clamp(1.6rem,2.4vw,2.1rem)] font-light leading-[1.08] tracking-[-0.035em] text-balance">
              {website.title}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-dark">{website.body}</p>
            <Points items={website.points} className="mt-5" />
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[6px] border border-line-light bg-white shadow-[0_24px_60px_rgb(8_9_14/0.14)]">
              <div aria-hidden="true" className="flex h-6 items-center gap-1.5 border-b border-line-light bg-paper px-3">
                <span className="size-1.5 rounded-full bg-ink/20" />
                <span className="size-1.5 rounded-full bg-ink/20" />
                <span className="size-1.5 rounded-full bg-gold" />
              </div>
              {/* Bright and Modern here, so no look appears twice on the page (Warm Community is Look 04). */}
              <Image
                src={ministryLooks.items[0].image}
                alt={ministryLooks.items[0].alt}
                width={1440}
                height={900}
                sizes="(min-width: 1024px) 460px, (min-width: 768px) 80vw, 92vw"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </Card>
        {[...middle, platform].map((item) => {
          const lead = item === platform;
          return (
            <Card as="li" key={item.no} tone={lead ? "inverse" : "light"} className={cn("flex flex-col", lead && "md:col-span-2 lg:col-span-3")}>
              <p className={cn("font-display text-[0.75rem] tracking-[0.12em]", lead ? "text-gold" : "text-gold-dark")}>
                {item.no}
              </p>
              {"plan" in item && item.plan ? (
                <p className="mt-3 w-fit rounded-full border border-gold-dark/40 px-2.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-[0.12em] text-gold-dark uppercase">
                  {item.plan}
                </p>
              ) : null}
              <h3 className="mt-3 text-[1.45rem] font-light leading-[1.1] tracking-[-0.03em]">{item.title}</h3>
              <p className={cn("mt-3 text-[0.95rem] leading-relaxed", lead ? "text-ivory/72" : "text-muted-dark")}>
                {item.body}
              </p>
              {item.no === "02" ? <BrandSample /> : null}
              <Points items={item.points} className="mt-auto pt-6" />
              {"links" in item && item.links ? (
                <TrackClick event="ministry_demo_opened" from="ministry_package_notes">
                  <p className="mt-4 flex flex-wrap gap-x-5">
                    {item.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="inline-flex min-h-11 items-center font-bold underline decoration-ink/30 underline-offset-4 transition-colors duration-200 hover:text-gold-dark"
                      >
                        {link.label}
                      </a>
                    ))}
                  </p>
                </TrackClick>
              ) : null}
            </Card>
          );
        })}
      </ul>
    </Sheet>
  );
}

/* ── 3. the four looks ───────────────────────────────────────────────── */

/** One look: its first screen, its name and who it suits. */
function LookCardBody({ look, index, linked }: { look: (typeof ministryLooks.items)[number]; index: number; linked: boolean }) {
  return (
    <>
      <div className="overflow-hidden rounded-[4px] border border-line-dark">
        <Image
          src={look.image}
          /* Inside a link, the link's own name says what it opens. */
          alt={linked ? "" : look.alt}
          width={1440}
          height={900}
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 46vw, 92vw"
          className="block h-auto w-full transition-transform duration-700 ease-editorial group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-wrap items-end justify-between gap-x-6 gap-y-3 px-2 pt-5 pb-2">
        <div>
          <p className="font-display text-[0.75rem] tracking-[0.12em] text-gold uppercase">
            Look {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-[clamp(1.5rem,2.2vw,1.9rem)] font-light leading-none tracking-[-0.035em] text-ivory">
            {look.name}
          </h3>
          <p className="mt-2 text-[0.92rem] text-muted-light">{look.forChurches}</p>
        </div>
        {linked ? (
          <span className="inline-flex min-h-11 items-center gap-2 text-[0.84rem] font-bold text-ivory transition-colors duration-200 group-hover:text-gold-light">
            Open the preview
            <span aria-hidden="true">&#8599;</span>
          </span>
        ) : null}
      </div>
    </>
  );
}

export function MinistryLooks() {
  const galleryReady = hasFile(ministryLooks.gallery.href);
  const linked = ministryLooks.items.map((look) => hasFile(ministryDemo.template(look.slug)));
  const aside = linked.some(Boolean) ? `${ministryLooks.aside} ${ministryLooks.asideOpen}` : ministryLooks.aside;
  return (
    <Sheet surface="ink" rise aria-labelledby="ministry-looks-title">
      <SectionIntro
        eyebrow={ministryLooks.eyebrow}
        title={ministryLooks.title}
        titleId="ministry-looks-title"
        aside={<p className="max-w-[52ch] text-[0.95rem] leading-relaxed text-muted-light">{aside}</p>}
      />
      <TrackClick event="ministry_demo_opened" from="ministry_looks" selector="a[data-track-look]">
      <ul className="grid gap-4 md:grid-cols-2">
        {ministryLooks.items.map((look, index) => (
          <li key={look.slug}>
            <Reveal delay={(index % 2) * 0.08} className="h-full">
              {linked[index] ? (
                <a
                  href={ministryDemo.template(look.slug)}
                  data-track-look={look.slug}
                  aria-label={`Open the ${look.name} preview, shown as ${look.sampleChurch}, a made up church`}
                  className="group flex h-full flex-col rounded-[6px] border border-line-dark bg-ink-soft p-3 transition-colors duration-300 hover:border-gold/60 sm:p-4"
                >
                  <LookCardBody look={look} index={index} linked />
                </a>
              ) : (
                <div className="flex h-full flex-col rounded-[6px] border border-line-dark bg-ink-soft p-3 sm:p-4">
                  <LookCardBody look={look} index={index} linked={false} />
                </div>
              )}
            </Reveal>
          </li>
        ))}
      </ul>
      </TrackClick>
      {galleryReady ? (
        <div className="mt-10 flex justify-center">
          <TrackClick event="ministry_demo_opened" from="ministry_looks_gallery">
            <InkTextLink href={ministryLooks.gallery.href}>{ministryLooks.gallery.label}</InkTextLink>
          </TrackClick>
        </div>
      ) : null}
    </Sheet>
  );
}

/* ── 4. front office, back office, member app ────────────────────────── */

const posters = {
  frontOffice: <FrontOfficePoster />,
  backOffice: <BackOfficePoster />,
  memberApp: <MemberAppPoster />,
} as const;

export function MinistryPlatform() {
  const demo = demoAction();
  return (
    <Sheet surface="ivory" rise aria-labelledby="ministry-platform-title">
      <SectionIntro
        layout="center"
        eyebrow={ministryPlatform.eyebrow}
        title={ministryPlatform.title}
        titleId="ministry-platform-title"
        aside={<p className="mx-auto max-w-[44ch] text-[1rem] leading-relaxed text-muted-dark">{ministryPlatform.aside}</p>}
      />
      <div className="grid gap-[clamp(64px,9vw,128px)]">
        {ministryPlatform.rows.map((row, index) => {
          const media = ministryMedia[row.id];
          return (
            <article
              key={row.id}
              aria-labelledby={`ministry-${row.id}-title`}
              className={cn(
                "grid items-center gap-10 lg:gap-[clamp(48px,6vw,96px)]",
                /* The film keeps the wider column on whichever side it sits. */
                index % 2 === 1
                  ? "lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]"
                  : "lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]",
              )}
            >
              <div className={cn(index % 2 === 1 && "lg:order-last")}>
                <p className="font-display text-[0.75rem] leading-[1.4] font-semibold tracking-[0.12em] text-gold-dark uppercase">
                  <span aria-hidden="true" className="text-muted-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mx-3 inline-block h-px w-6 translate-y-[-3px] bg-gold" aria-hidden="true" />
                  {row.eyebrow}
                </p>
                <h3
                  id={`ministry-${row.id}-title`}
                  className="mt-4 max-w-[18ch] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.04] tracking-[-0.04em] text-balance"
                >
                  {row.title}
                </h3>
                <p className="mt-5 max-w-[46ch] text-[1rem] leading-relaxed text-muted-dark">{row.body}</p>
                <Points items={row.points} className="mt-6" />
              </div>
              <Reveal>
                <div className="rounded-[10px] border border-line-light bg-white/60 p-1.5 shadow-[0_30px_70px_rgb(8_9_14/0.16)]">
                  <MinistryVideo
                    mode="loop"
                    src={publicAsset(media.video)}
                    poster={publicAsset(media.poster)}
                    posterPhone={publicAsset(media.posterPhone)}
                    label={row.filmLabel}
                    stillAlt={row.stillAlt}
                    placeholder={posters[row.id]}
                    sizes="(min-width: 1024px) 720px, 92vw"
                  />
                </div>
              </Reveal>
            </article>
          );
        })}
      </div>
      {/* A caption link, not a third demo button: the hero and the close carry the buttons. */}
      <p className="mt-[clamp(48px,6vw,72px)] text-center text-[0.95rem] text-muted-dark">
        See all three working together.{" "}
        <TrackClick event="ministry_demo_opened" from="ministry_platform">
          <DemoTextLink action={demo} />
        </TrackClick>
      </p>
    </Sheet>
  );
}

/* ── 5. protecting people ────────────────────────────────────────────── */

export function MinistryProtection() {
  return (
    <Sheet surface="ink" rise aria-labelledby="ministry-protection-title">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--header-height)+48px)] lg:self-start">
          <SectionIntro
            eyebrow={ministryProtection.eyebrow}
            title={ministryProtection.title}
            titleId="ministry-protection-title"
            className="mb-0"
          />
          <p className="mt-6 max-w-[40ch] text-[0.95rem] leading-relaxed text-muted-light">
            {ministryProtection.footnote}
          </p>
          <div className="mt-10 max-w-[28rem]">
            <p className="font-display text-[0.75rem] tracking-[0.12em] text-gold uppercase">
              {ministryProtection.crisis.label}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {ministryProtection.crisis.lines.map((line) => (
                <li key={line.number} className="rounded-[6px] border border-line-dark bg-ink-soft p-5">
                  <p className="text-[clamp(2.2rem,3.4vw,2.8rem)] leading-none font-light tracking-[-0.04em] text-gold-light tabular-nums">
                    {line.number}
                  </p>
                  <p className="mt-3 text-[0.9rem] leading-snug text-muted-light">{line.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ol className="border-b border-line-dark">
          {ministryProtection.rules.map((rule, index) => (
            <li
              key={rule.title}
              className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 border-t border-line-dark py-7 sm:grid-cols-[4.5rem_minmax(0,1fr)]"
            >
              <span
                aria-hidden="true"
                className="font-display text-[clamp(1.6rem,2.4vw,2.1rem)] leading-none text-gold"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                {/* The plan tag is its own small chip above the heading, never run into the heading text. */}
                {"plan" in rule ? (
                  <p className="mb-2 w-fit rounded-full border border-gold/45 px-2.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-[0.12em] text-gold uppercase">
                    {rule.plan}
                  </p>
                ) : null}
                <h3 className="text-[clamp(1.15rem,1.6vw,1.35rem)] leading-snug font-medium tracking-[-0.015em] text-ivory">
                  {rule.title}
                </h3>
                <p className="mt-2 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted-light">{rule.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Sheet>
  );
}

/* ── 6. choose your plan ─────────────────────────────────────────────── */

export function MinistryLevelsSection() {
  return (
    <Sheet id="levels" surface="paper" rise aria-labelledby="ministry-levels-title" className="site-section">
      <SectionIntro
        layout="split"
        eyebrow={ministryLevels.eyebrow}
        title={ministryLevels.title}
        titleId="ministry-levels-title"
        aside={
          <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-muted-dark">
            {ministryLevels.aside} {ministryLevels.footnote}
          </p>
        }
      />
      <TrackClick event="ministry_call_cta_clicked" from="ministry_plans" selector="a[href^='/contact']">
        <MinistryLevels aside={<AssessmentCue light from="ministry_plans" />} />
      </TrackClick>
    </Sheet>
  );
}

/* ── 7. how it runs ──────────────────────────────────────────────────── */

export function MinistryProcess() {
  return (
    <Sheet surface="ink" rise aria-labelledby="ministry-process-title" className="site-section">
      <ProcessTimeline
        titleId="ministry-process-title"
        eyebrow={ministryProcess.eyebrow}
        title={ministryProcess.title}
        steps={ministryProcess.steps}
      />
    </Sheet>
  );
}

/* ── 8 and 9. the free website check, then the questions ─────────────── */

export function MinistryCheckAndFaq() {
  return (
    <Sheet surface="paper" rise aria-labelledby="ministry-check-title" className="site-section">
      <Card tone="inverse" className="relative overflow-hidden p-[clamp(28px,4.4vw,64px)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(201_165_94/0.18),transparent_68%)]"
        />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div>
            <Eyebrow className="text-gold">{ministryWebsiteCheck.eyebrow}</Eyebrow>
            <h2
              id="ministry-check-title"
              className="mt-4 max-w-[16ch] text-[clamp(2.1rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.045em] text-balance"
            >
              {ministryWebsiteCheck.title}
            </h2>
            <p className="mt-5 max-w-[48ch] text-[1rem] leading-relaxed text-ivory/74">{ministryWebsiteCheck.body}</p>
            <div className="mt-8">
              <TrackClick event="church_website_check_clicked" from="ministry_check">
                <ConsultationButton href={ministryWebsiteCheck.action.href} className="max-sm:w-full">
                  {ministryWebsiteCheck.action.label}
                </ConsultationButton>
              </TrackClick>
            </div>
            <p className="mt-4 max-w-[48ch] text-[0.9rem] text-ivory/60">{ministryWebsiteCheck.note}</p>
          </div>
          <div className="rounded-[6px] border border-line-dark bg-ink-soft p-[clamp(20px,2.4vw,32px)]">
            <p className="font-display text-[0.75rem] tracking-[0.12em] text-gold uppercase">What we look at</p>
            <ol className="mt-4">
              {ministryWebsiteCheck.checks.map((check, index) => (
                <li
                  key={check}
                  className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline border-t border-line-dark py-4 first:border-t-0"
                >
                  <span aria-hidden="true" className="font-display text-[0.8rem] text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.98rem] leading-snug text-ivory">{check}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      <div
        aria-labelledby="ministry-faq-title"
        role="region"
        className="mt-[clamp(88px,10vw,136px)] grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
      >
        <SectionIntro
          eyebrow={ministryFaq.eyebrow}
          title={ministryFaq.title}
          titleId="ministry-faq-title"
          className="mb-0 lg:sticky lg:top-[calc(var(--header-height)+48px)] lg:self-start"
        />
        <FaqList items={ministryFaq.items} />
      </div>
    </Sheet>
  );
}

/* ── 10. the close ───────────────────────────────────────────────────── */

export function MinistryClose() {
  const secondary = demoAction();
  return (
    <ClosingBand
      eyebrow={ministryClose.eyebrow}
      title={ministryClose.title}
      line={ministryClose.line}
      actions={
        /* Stacked to one width on phones, side by side from there up. */
        <div className="grid w-full gap-3">
          <div className="grid w-full gap-3 sm:min-w-[32rem] sm:grid-cols-2">
            <TrackClick event="ministry_call_cta_clicked" from="ministry_close">
              <ConsultationButton href={ministryClose.primary.href} className="w-full">
                {ministryClose.primary.label}
              </ConsultationButton>
            </TrackClick>
            <TrackClick event="ministry_demo_opened" from="ministry_close">
              <DemoLink action={secondary} />
            </TrackClick>
          </div>
          <AssessmentCue from="ministry_close" />
        </div>
      }
    />
  );
}
