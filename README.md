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
- `STRIPE_SECRET_KEY` — restricted Stripe key (`rk_`) for AI Employees checkout.
  A placeholder value leaves checkout closed.
- `STRIPE_WEBHOOK_SECRET` — signing secret for `/api/stripe/webhook`.
- `STRIPE_PRICE_AI_EMPLOYEES_SINGLE`, `STRIPE_PRICE_AI_EMPLOYEES_DUO`,
  `STRIPE_PRICE_AI_EMPLOYEES_FLEET` — Stripe Price IDs for the three monthly
  plans. Placeholder values such as `price_placeholder_single` keep the
  buttons wired without opening a live Checkout Session.
- `GENESIS_AI_EMPLOYEES_INQUIRY_WEBHOOK_URL` — destination for the Done For You
  inquiry. Until it is set, production refuses the form and development accepts
  it only as a preview.
- `MINI_CATALOG_REVIEW_MODE` — set to `review` only on an approved preview to
  show provisional Mini prices and engineering-seed limits. Development shows
  them automatically; ordinary production builds hold them back.

### Product-catalog accounts

The `/workspace` catalog and its product briefs remain public. One account
button leads to `/workspace/account`, where visitors can choose to create an
account or log in. To activate the Clerk forms and signed-in profile avatar
with account settings, create a Clerk application and put these keys in this
repository's ignored
`.env.local`, then restart `npm run dev`:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

Without both keys, the account page shows an honest setup-pending notice. Drafts
remain on the current device for 30 days; account-based draft sync, checkout,
and paid result generation are not connected yet.

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

## Genesis Ministry (Edition 05)

`/ministry` is the church edition: software for churches of about 100 to
1,000 people. Its edition record is `ministryEdition` in `lib/editions.ts`,
exported on its own so the homepage keeps four edition cards; add it to the
`editions` list to give it a homepage card. Every other visitor string, the
four website looks, the draft levels, the questions and the church version of
the contact page live in `lib/ministryPage.ts`, and
`tests/ministry-edition.test.ts` checks them (no dashes, no emojis, no
prices). The levels (Welcome, Connect and Shepherd as cards, Enterprise as the
line under them) are a draft for the owner to confirm, and show "Pricing set
with Genesis" until real prices are approved.

**Films.** The page plays these files from `public/video/ministry/` once they
exist. Until then each frame shows a placeholder drawn from the diagram kit,
never a broken player. The page checks for each file when it is built, so
adding a file and rebuilding is all it takes.

| File | Where it plays |
|---|---|
| `demo-landscape.mp4`, `demo-landscape.jpg` (poster), `demo-landscape.en.vtt` (captions) | The hero. Plays with controls when the reader presses play. |
| `loop-front-office.mp4`, `loop-front-office.jpg` | Front office row. Silent loop. |
| `loop-back-office.mp4`, `loop-back-office.jpg` | Back office row. Silent loop. |
| `loop-member-app.mp4`, `loop-member-app.jpg` | Member app row. Silent loop. |

Use 16:9 landscape files. The loops are muted, play only while on screen,
have a pause button, and are replaced by their poster for readers who prefer
reduced motion. A poster can arrive before its film: it then stands in for the
film and is described by the `stillAlt` text beside it in
`lib/ministryPage.ts` (written for stills of the Today view, the care inbox
and the member app home screen), so update that text if a poster shows
something else. While the hero has neither a film nor a poster, its frame is
hidden on phones, where the drawn placeholder is too small to read.

**Demo previews.** The four looks, the gallery and the clickable platform are
static pages served from `public/ministry-demo/`. Copy them in from the
Genesis Ministry working folder with:

```bash
node scripts/sync-ministry-demo.mjs "C:/path/to/genesis-ministry"
```

The source is that argument or `MINISTRY_DEMO_SOURCE`; there is no default.
The script:

- writes the four look card screenshots, `public/images/ministry/look-<slug>.jpg`,
  as the first 1440 by 900 of each look's `shots/desktop/home-01.jpg`, so the
  cards always match the previews they open. `--looks-only` does just this.
- replaces `public/ministry-demo/` with `index.html`, `shared/`, `platform/` and
  each `templates/<slug>/`, leaving out every Markdown file, the `*.mjs` build
  tools, and every screenshot except the `shots/desktop/home-01.jpg` and
  `shots/mobile/home-01.jpg` the gallery shows.
- leaves out `platform/sales-*`, the Genesis Growth Desk (Genesis's own tool
  for finding and serving churches), unless you pass `--with-growth-desk`. The
  platform hub links to it, so those links are reported as not copied until
  the owner decides whether to publish it.
- adds `<meta name="robots" content="noindex">` to any page without it, and
  lists any local file a page points at that was not copied.

Review `git status` before committing the copy. Until the copy is committed,
`/ministry` links to none of it: each preview is linked only once its file is
in `public/` (checked at build time), the demo buttons read "Request a
Walkthrough" and open the contact form, and the look cards are not links.
`npm run build` (`scripts/check-seo.ts`) fails if a rendered page links into
`/ministry-demo/` at a file that is not there.

The demo copies stay out of search through their own noindex meta and an
`X-Robots-Tag: noindex, nofollow` header (`next.config.ts`). `robots.txt`
deliberately does not block `/ministry-demo/`: a crawler blocked there would
never see the noindex.

**Contact.** The "Book a Consultation", "Request a Walkthrough" and "Request a
Website Check" links carry a `?topic=` the contact page recognizes. A known
Ministry topic opens the church version of `/contact`: a starting note in the
notes field, church labels and roles (`Senior pastor`, `Church staff`,
`Volunteer`), the operation type sent as `Church`, and no plan select, since
the business plans carry prices. `app/api/consultation/route.ts` accepts those
values. Only the topics listed in `lib/ministryPage.ts` are recognized. On
`/ministry` the header button also books the church consultation.

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
