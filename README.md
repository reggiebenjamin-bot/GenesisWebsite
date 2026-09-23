# Genesis AI marketing website

A marketing site for two separate Genesis offers: three independent,
self-service Genesis Tools and consultation-led Genesis Managed AI. Next.js App
Router, TypeScript, Tailwind CSS v4, and native CSS animation.

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
  layout.tsx               root layout
  (marketing)/             homepage, public tool pages, pricing, managed pages
  workspace/               public catalog, briefs, and optional account entry
  api/assessment/          business-assessment intake
  api/consultation/        forwards the consultation form to the CRM webhook
  robots.ts  sitemap.ts
components/
  hero/                    CinematicHero, useHeroScrub, hero.config
  layout/                  Header, Footer, Logo
  sections/                CapabilityStrip, SystemLayers, PricingCards, ConsultationCTA
  ui/                      Button, Section, Reveal
lib/
  offers.ts                public offer copy and approved display prices
  toolWorkspace.ts         catalog details derived from the offer prices
  seo.ts  schema.ts         public page registry and structured data
  content.ts               shared business content
  products.ts              older custom-build implementation catalog
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

- `NEXT_PUBLIC_SITE_INDEXABLE` — indexable by default when `VERCEL_ENV=production`;
  otherwise closed to crawlers. Set `true` for a non-Vercel production host, or
  `false` to deliberately keep a deployment out of search. Previews must stay
  noindexed.
- `NEXT_PUBLIC_SITE_URL` — canonical origin used for metadata and sitemap URLs;
  defaults to `https://www.geai.us`.
- `GENESIS_CONSULTATION_WEBHOOK_URL` — server-only override for the consultation
  webhook.
- `MINI_CATALOG_REVIEW_MODE` — set to `review` only on an approved preview to
  show provisional Mini prices and engineering-seed limits. Development shows
  them automatically; ordinary production builds hold them back.

### Product-catalog accounts

The `/workspace` catalog and its product briefs remain public. One account
button leads to `/workspace/account`, where visitors can choose to create an
account or log in. To activate the Clerk forms and signed-in profile avatar
with account settings, link the intended Clerk application and put its keys in
this repository's ignored `.env.local`, then restart `npm run dev`:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

Without both Clerk keys, the account page shows a setup-pending notice and
drafts remain on the current device for 30 days. With Clerk and Upstash
configured, signed-in drafts save per user and product to Redis for 365 days
after the last edit. An existing device draft is copied to the account on first
sign-in; if both copies differ, the visitor chooses which one to keep. Clearing
a signed-in draft removes the account copy. If the storage service is
unavailable, the interface says so and uses a device-only draft. Do not put
the secret key or Redis token in client code or commit `.env.local`. Configure
the same variables in the deployment environment when account sync is ready
for production. Checkout and paid result generation are not connected yet.

## Content

Public Genesis Tools prices are $49 per Deal Architect analysis, $99 per Deal
Packager package, and $79 per Capital Advisor plan. They are one-time prices
for a finished result, not an entry fee to explore a product. The prototype
does not yet charge or generate paid results.

Shared business content remains in `lib/content.ts`. The older Mini and custom
infrastructure implementation catalogs remain in `lib/products.ts`; they are
not the public Genesis Tools catalog. The future auth, billing, entitlement,
and dashboard boundary is documented in
[docs/mini-infrastructure-commercial-boundary.md](docs/mini-infrastructure-commercial-boundary.md).

## Search launch checklist

`npm run build` also checks rendered public-page titles, descriptions,
canonicals, structured data, internal links, robots.txt, and the sitemap. Run
it for both a normal preview build and an indexable build with
`NEXT_PUBLIC_SITE_INDEXABLE=true` before publishing. The public routes in
`lib/seo.ts` are the single source for the sitemap and canonical URLs;
`/workspace` remains noindexed.

After the production deployment, verify the live `/robots.txt` and
`/sitemap.xml`, confirm that `/tools/deal-packager` and
`/tools/capital-advisor` return 200 with their own canonicals, and submit the
sitemap in Google Search Console and Bing Webmaster Tools. These submissions
require the site's verified owner account. Run `npm run indexnow` only after
the new pages are live; it notifies participating search engines of the URLs
in the registry. Do not run it for local or preview builds.

No Mercury or Vanta implementation code is included; those snapshots were used
only as visual and structural references.
