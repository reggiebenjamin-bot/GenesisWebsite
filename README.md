# Genesis AI marketing website

A marketing site for two separate Genesis offers: G-Core Mini standardized
software and Genesis Infrastructure custom systems. Next.js App Router,
TypeScript, Tailwind CSS v4, and native CSS animation.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm test
npm run build
```

## Structure

```
app/
  globals.css              theme tokens, base layer, the hero camera rig
  layout.tsx  page.tsx     root layout and homepage
  mini/ about/ how-it-works/ solutions/ pricing/ results/ contact/
  api/consultation/        forwards the intake form to the CRM webhook
  robots.ts  sitemap.ts
components/
  hero/                    CinematicHero, useHeroScrub, hero.config
  layout/                  Header, Footer, Logo
  sections/                CapabilityStrip, SystemLayers, PricingCards, ConsultationCTA
  ui/                      Button, Section, Reveal
lib/
  content.ts               shared business content
  products.ts              versioned Mini and Infrastructure catalogs
  commerce/                future provider-neutral entitlement contracts
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
- `MINI_CATALOG_REVIEW_MODE` — set to `review` only on an approved preview to
  show provisional Mini prices and engineering-seed limits. Development shows
  them automatically; ordinary production builds hold them back.

## Content

Shared business content remains in `lib/content.ts`. Mini and Infrastructure
use separate typed catalogs in `lib/products.ts`; Mini is explicitly draft and
cannot be treated as a production offer by default. The future auth, billing,
entitlement, and dashboard boundary is documented in
[docs/mini-infrastructure-commercial-boundary.md](docs/mini-infrastructure-commercial-boundary.md).

No Mercury or Vanta implementation code is included; those snapshots were used
only as visual and structural references.
