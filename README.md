# Genesis AI marketing website

A managed-systems marketing site for real-estate operators. Next.js App Router,
TypeScript, Tailwind CSS v4, and Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Structure

```
app/
  globals.css              theme tokens, base layer, the hero camera rig
  layout.tsx  page.tsx     root layout and homepage
  about/ how-it-works/ solutions/ pricing/ results/ contact/
  api/consultation/        forwards the intake form to the CRM webhook
  robots.ts  sitemap.ts
components/
  hero/                    CinematicHero, useHeroScrub, hero.config
  layout/                  Header, Footer, Logo
  sections/                CapabilityStrip, SystemLayers, PricingCards, ConsultationCTA
  ui/                      Button, Section, Reveal
lib/
  content.ts               all business content and plan data, typed
  metadata.ts              per-page metadata helper
assets/hero-source/        photographic masters — not served
docs/                      hero transition, migration inventory
```

## Styling

Tailwind v4, configured entirely in `app/globals.css`. Design tokens are
declared in `@theme`, so they compile into real utilities — `bg-ink`,
`text-gold-light`, `font-display`, `ease-editorial` — rather than living in a
parallel `:root` block. There is no `tailwind.config`.

Only three things are hand-written CSS, because utilities are the wrong tool
for them: the tokens themselves, the base element layer, and the hero camera
rig, which is nested transforms driven by custom properties that JavaScript
rewrites every frame.

## The hero

The homepage opens on a scroll-scrubbed match cut into the laptop on the desk.
It is measured, not eyeballed — see [docs/hero-transition.md](docs/hero-transition.md)
before touching the plates or the geometry.

## Environment

- `NEXT_PUBLIC_SITE_INDEXABLE` — defaults to `false`. Set to `true` only for the
  production-domain cutover. **The preview must remain no-indexed.**
- `NEXT_PUBLIC_SITE_URL` — origin used for metadata and sitemap URLs.
- `GENESIS_CONSULTATION_WEBHOOK_URL` — server-only override for the consultation
  webhook.

## Content

Business content and plan data are centralised in `lib/content.ts`. Migration
decisions and the missing-proof checklist are in
[docs/migration-inventory.md](docs/migration-inventory.md).

No Mercury or Vanta implementation code is included; those snapshots were used
only as visual and structural references.
