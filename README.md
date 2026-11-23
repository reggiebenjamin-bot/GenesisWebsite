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
four website looks, the three plans, the questions and the church version of
the contact page live in `lib/ministryPage.ts`, and
`tests/ministry-edition.test.ts` checks them (no dashes, no emojis, and no
price outside the plan prices). The plans are Care at $149 a month, Shepherd
at $299 and Plus at $499, as cards, with Enterprise (more than one campus) as
the line under them, scoped on a call. They replace the draft levels Welcome,
Connect and Shepherd, and keep what those levels included, in order, until
the owner lists each plan's contents. No setup fee is named. The section
keeps its `#levels` anchor, and `ministryServiceSchema` in `lib/schema.ts`
carries the three prices as structured data.

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
`lib/ministryPage.ts`, so update that text whenever a poster changes. While the
hero has neither a film nor a poster, its frame is hidden on phones, where the
drawn placeholder is too small to read.

The four posters are in place now: 1920 by 1080 stills from the public demo,
with Lampstand Church, a made up sample church. `demo-landscape.jpg` is Today
on Plus in the light theme with the Hope dock closed; `loop-front-office.jpg`
is the Guests view; `loop-back-office.jpg` is the care inbox, with prayer shown
only as locked topics; `loop-member-app.jpg` is the member app home screen in a
phone on a calm ivory background. Each still keeps the demo's "Design preview.
Sample data shown." line. `tests/ministry-edition.test.ts` checks that each
poster is there at 1920 by 1080.

Each poster also has a phone still, `<name>-phone.jpg` (1170 by 1560, the
same screen at 390 by 520 on a phone at three times the pixels, scrolled to
the part its alt text names). While a frame has no film, phones get that still
in a 3:4 frame through a `<picture>` built with `getImageProps`, because the
16:9 still shrunk to a phone's width is too small to read. Each `stillAlt`
describes what both stills show. Until the hero film exists, its Take the
Guided Demo button sits under the frame, never on the still, and the "Sample
church and sample people shown." note shows under any poster or film.

**Demo previews.** The four looks, the gallery and the clickable platform are
static pages served from `public/ministry-demo/`. Copy them in from the
Genesis Ministry working folder with:

```bash
node scripts/sync-ministry-demo.mjs "C:/path/to/genesis-ministry"
```

The source is that argument or `MINISTRY_DEMO_SOURCE`; there is no default.
The source belongs to another team and is only read. The script:

- writes the four look card screenshots, `public/images/ministry/look-<slug>.jpg`,
  as the first 1440 by 900 of each look's `shots/desktop/home-01.jpg`, so the
  cards always match the previews they open. `--looks-only` does just this.
- copies what the source's `platform/DESIGN.md` (section 12, "Uploading the
  preview") lists: the gallery `index.html`, `shared/crisis-words.js` and
  `shared/hope-demo.js`, `platform/` without `DESIGN.md`, and each
  `templates/<slug>/` without its `shots/` (except the
  `shots/desktop/home-01.jpg` and `shots/mobile/home-01.jpg` the gallery
  shows) and without the `*.mjs` build tools. The gallery's three loose
  pictures (`early-look.jpg`, `four-looks.jpg`, `geai-ministry-page.jpg`) stay
  out: nothing links to them, and one is a screenshot of an old `/ministry`.
  So do the working files (`tools/`, `brand/`, `LAUNCH.md`, `README.md`,
  `shared/test.html`, `shared/hope-check.html`).
- makes the public copy. The Growth Desk (`platform/sales-*`, Genesis's own
  tool for finding and selling to churches, and the two hub pictures of it)
  stays out, by the owner's decision. The source keeps it behind a presenter
  mode (`?present=1`): the story pages mark its parts `data-present-only`, and
  the shell and the guided demo read `GM.presenting`. The public copy has no
  presenter mode. `scripts/ministry-demo-public.mjs` drops every
  `data-present-only` element (the hub's Growth Desk doors and links, the
  journey's Finding to Launch chapter), keeps every `data-public-only` one
  (the journey's Getting Started chapter, so the journey has five chapters),
  removes the presenter switch from each story page's head, and turns
  presenter mode off in `platform/shared/app.js`, `platform/story/story.js` and
  `platform/shared/demo.js`. It then cuts what is left of the Growth Desk: the
  Growth Desk entries in the account menu and Jump To, the tours and demo path
  stops on its screens (the guided demo starts at Today), Hope's "How Does
  Genesis Find Churches?" answer, the hub's rule on how Genesis writes to
  churches it has found, and the Growth Desk's own sample data in
  `platform/shared/data.js` (prospects, outreach, the suppression list, the
  pipeline). Talk With Genesis, the source's way back to Genesis, opens the
  church consultation on this site by its path,
  `/contact?topic=ministry-demo`, in a new tab; the public copy adds it to the
  hub, journey and gallery headers, menus and footers and to the church
  workspace's account menu. Each card of the guided demo also says which
  screen of how many it is. Each edit must find its text exactly (a drop, its
  number of elements), so a change in the source stops the sync with the
  edit's name instead of leaving a link behind. The script prints every file
  left out and every edit made.
- checks the plans. The source names the three plans and their prices itself:
  Care at $149 a month, Shepherd at $299 and Plus at $499, with Enterprise
  scoped on a call, and `D.pricingLine` in `platform/shared/data.js` is the
  same sentence as the price answer on `/ministry`. The sync stops when they
  differ from `MINISTRY_PLANS` (`planProblems`), or when the source still has
  the draft levels.
- adds `<meta name="robots" content="noindex">` to any page without it.
- builds the copy in a temporary folder and replaces `public/ministry-demo/`
  only when it passes its checks: no file names a `sales-*` page or the words
  "Growth Desk", and none outside the copied Genesis OS design system
  (`platform/shared/os/`) says "acquisition", "sales desk", "suppression" or
  "prospect"; the only link to the rest of geai.us is
  `/contact?topic=ministry-demo`, and never by its full address; every local
  link in a page, stylesheet or platform script resolves to a copied file,
  every script compiles, and no page or script keeps a Level 01 to 03 label,
  an old level name, a draft level note, the word "level" where a reader sees
  it, or "pricing set with Genesis". Otherwise it stops and leaves the old copy
  as it was.

**The committed copy.** `public/ministry-demo/` is synced from genesis-ministry
commit `a954071` (its `main` on November 22, 2026), exported with
`git archive` as described below. It shows the three plans and their prices
and the gold Genesis G. The eight posters in `public/video/ministry/` (four
1920 by 1080 stills and four 1170 by 1560 phone stills) were retaken from the
copy synced from `1beb6da`, so they show the gold G and the plan switcher reads
Care, Shepherd and Plus. Since then the selected plan is marked like the current
nav row instead of a gold fill; retake the posters to match it exactly.

`--with-growth-desk --out <folder>` makes a private copy with the Growth Desk,
unedited, for looking at only. The folder must be outside `public/`.

The source folder is a git repository another team keeps editing. Publish a
reviewed commit, not work in progress: export it into an empty folder and sync
from there. The committed copy was made from the source's commit `a954071`:

```bash
mkdir /tmp/gm-a954071
git -C "C:/path/to/genesis-ministry" archive a954071 | tar -x -C /tmp/gm-a954071
node scripts/sync-ministry-demo.mjs /tmp/gm-a954071
```

A folder address such as `/ministry-demo/` or `/ministry-demo/platform/`
redirects (307) to its `index.html` (`next.config.ts`), because the demo's
links are relative and would break if the folder were served in place.

`tests/ministry-demo-public.test.ts` tests the edits and checks the committed
copy the same way: no Growth Desk, no presenter parts, no dead local link,
every page noindex, the plans and prices as `/ministry` shows them, and a
guided demo path that starts at Today.

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

The demo needs inline scripts, its own fonts and images, and Google Fonts
(fonts.googleapis.com and fonts.gstatic.com) for the member screens and the
four sites. The site sends no Content-Security-Policy today (`next.config.ts`
and `proxy.ts` set none), so nothing blocks them. If one is added, give
`/ministry-demo/:path*` its own policy that allows those.

**Contact.** The "Book a Consultation", "Request a Walkthrough" and "Request a
Website Check" links carry a `?topic=` the contact page recognizes. A known
Ministry topic opens the church version of `/contact`: a starting note in the
notes field, church labels and roles (`Senior pastor`, `Church staff`,
`Volunteer`), the operation type sent as `Church`, and no plan select, since
the business plans carry prices. `app/api/consultation/route.ts` accepts those
values, and the church staff sizes (`1 or 2` to `16 or more`). Only the
topics listed in `lib/ministryPage.ts` are recognized. `church-website-check`
opens the free Church Website Check version: its own title and words, the
church's website asked for first (sent as `church_website` and at the top of
the notes), the form before the explanation on phones, and a "Request My
Website Check" button. On `/ministry` the header button books the church
consultation; on the church version of `/contact` it reads "See Genesis
Ministry". On both, the header's Pricing (the business plans, with prices)
becomes Plans, `/ministry#levels`, and `/pricing` points churches to the
Ministry plans, from $149 a month. A plan's button opens `/contact` with the
plan and its price in the starting note. The sections above `#levels` on
`/ministry` skip the site's `content-visibility` shortcut so that link lands
on the plans.

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
