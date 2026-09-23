# Genesis product design system

## Direction

The product layer is a preserve-style expansion of the existing Genesis site. It keeps the brand's ink, navy, ivory, paper, and muted gold palette, plus Satoshi and the restrained monospace label face. The supplied catalog and interface references inform the visual rhythm, while the user's latest direction takes precedence: this is a product catalog, not a dashboard.

## Product architecture

- Deal Architect, Deal Packager, and Capital Advisor are equal standalone choices.
- Their public pages are editorial marketing surfaces. The product catalog at `/workspace` centers three equal choices; every card opens its own isolated product page.
- Catalog and product pages link back to the marketing website; each product page also links back to the catalog. There is no cross-product sidebar or implied sequence.
- Each product opens with a read-only, pauseable animated example: sample fields type themselves, a fake cursor moves, and a sample output shows structure without result data.
- The customer's own brief starts blank below the example. The preview reflects only the project name and a few harmless identifiers the customer entered, never calculated numbers or personalized writing. The one-time purchase placeholder stays at the bottom, disabled until required inputs are complete; it opens an explicit local-only notice rather than charging or submitting.
- Drafts stay in the current browser for 30 days. V2 draft storage leaves prior V1 sample-backed drafts untouched. One "Sign in / up" entry leads to `/workspace/account`, where visitors choose account creation or login. The split-card account page uses a click-triggered, 600 ms panel swap inspired by the supplied references, with a static reduced-motion/mobile variant. Clerk forms and the signed-in avatar/settings menu activate when publishable and secret keys are configured; until then, the account page explains that setup is pending. Signing in does not yet sync briefs. Result generation and checkout are not connected.

## UI rules

- Dark marketing frames transition into a light, open catalog and focused product pages with very little navigation chrome. The account choice keeps a quiet ink-colored visual panel and the standalone G mark paired with a bold wordmark.
- The catalog and homepage share portrait product cards: a near-square, inset real-estate image leads; the product name, one short outcome, one-time result price, and a single ivory Explore action follow. The whole card opens the free product page, never checkout. Cards use generous radii and a restrained shadow without stock, discount, cart, or favorite cues.
- Hairline borders establish hierarchy; shadows are restrained and reserved for paper previews and product-card lift.
- Gold is used for actions, provenance, and focus, never as a large decorative fill.
- Inputs have persistent labels, at least 44px targets, visible keyboard focus, and no placeholder-only meaning.
- Motion is limited to the purposeful, pauseable example walkthrough, the user-triggered account panel swap, and restrained hover feedback. Reduced-motion preferences show a static example and account panel.
- The approved display prices are $49 for one Deal Architect analysis, $99 for one Deal Packager package, and $79 for one Capital Advisor plan. Browsing examples and preparing a brief remain free; checkout and finished-result generation are still placeholders, so no one can be charged yet.
