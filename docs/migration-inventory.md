# Genesis AI migration inventory

Source audited: `www.geai.us.zip` supplied August 8, 2026. Mercury, Vanta, and Genflow snapshots are reference-only and contribute no copied code, assets, claims, or business data.

## Verified business content retained

- Core offer: done-for-you, fully managed infrastructure for real-estate professionals.
- System layers: Microsoft 365 foundation; AI workflows and automation; optional Genesis CRM; integrations; ongoing management.
- Audiences: solo agents, teams and team leads, brokers and brokerages, investors and operators.
- Operating approach: consultation, provisioning, integration/automation, and ongoing management.
- Brand philosophy: “Become trusted before needed.”
- Founder name found in the supplied JSON-LD: Reginald Benjamin.

## Pricing retained

| Plan | Published price | Verified supplied details |
| --- | --- | --- |
| Foundation | Starting at $750/month | Up to 3 users; Microsoft 365 provisioning; business email, identity, and documents; core AI infrastructure; ongoing management and support |
| Professional | Starting at $1,750/month | Up to 8 users; Foundation features; Genesis CRM and marketing automation; team AI workflows; deeper integrations |
| Enterprise | Starting at $4,500/month | Up to 15 users, then $200/additional user/month; multi-user full stack; custom AI agents and integrations; Professional features at brokerage scale; priority support |

Legacy Square links retained here for migration reference only and intentionally excluded from the public UI:

- Foundation: `https://square.link/u/07XBBTtx`
- Professional: `https://square.link/u/qfLzuuJw`
- Enterprise: `https://square.link/u/uKwaBj3d`

## Contact and integrations retained

- Email: `info@geai.us`
- Phone: `+1-682-647-5934`
- LinkedIn: `https://www.linkedin.com/company/genesis-ai-studio`
- Facebook: `https://www.facebook.com/profile.php?id=61586903450734`
- Consultation webhook: `https://services.leadconnectorhq.com/hooks/xFA4eosJIjIpJqvXZJtS/webhook-trigger/018af955-79ee-4cd6-b2c1-2c43c2025716`
- Mailto fallback is preserved.
- The public form does not disclose the webhook URL.

## Consultation form inventory

The original submission keys and options are preserved for compatibility:

- `name` — Full Name — required
- `email` — Work Email — required
- `phone` — Phone — required
- `company` — Company / Brokerage — optional
- `vertical` — Your Role — required; Solo Agent, Team Lead, Broker / Brokerage, Investor / Operator, Other
- `monthly_leads` — Team Size — optional; Just me, 2–5, 6–20, 20+
- `notes` — What does your current setup look like? — optional
- `source` — `Website Contact Intake`
- `page` — submitting page URL

The replacement adds an optional `plan` value for pricing-page preselection plus referring-page and campaign parameters. The server forwards the webhook payload as form data to retain the former field-mapping behavior. No fake production submission is made during QA.

## SEO facts retained

- Previous title: `AI Infrastructure for Real Estate Professionals | Genesis AI`
- Previous description: `Genesis AI provisions and manages your complete AI infrastructure — Microsoft 365 foundation, AI workflows and automation, and an optional Genesis CRM layer — built for agents, brokers, teams, investors, and brokerages.`
- Previous organization data identifies Genesis AI, its contact details, Reginald Benjamin as founder, United States service area, and the real-estate professional audience.
- Previous FAQ content is retained in centralized typed data.
- Preview output defaults to `noindex, nofollow`; canonical metadata is emitted only when the production indexability flag is explicitly enabled.

## Legacy routes and migration decision

The previous single-page anchors `#stack`, `#solutions`, `#pricing`, `#how`, and `#contact-intake` are reorganized into the seven requested routes.

Legacy topic pages referenced by the snapshot are consolidated rather than recreated as thin pages:

- `microsoft-365-for-real-estate.html` → `/solutions`
- `ai-tools-for-real-estate-agents.html` → `/solutions`
- `real-estate-team-technology.html` → `/solutions`
- `real-estate-brokerage-technology.html` → `/solutions`
- `real-estate-investor-operations.html` → `/solutions`
- `genesis-crm.html` → `/solutions`
- `real-estate-email-deliverability.html` and `real-estate-texting-compliance.html` → not republished at launch; source material was not present in the supplied ZIP
- `blog/index.html` → not recreated; no verified article corpus was supplied

## Intentionally omitted

- Legacy layout, CSS, JavaScript, neural canvas, blurred orbs, ticker, card tilt, custom cursor, glowing panel treatment, and direct-purchase buttons.
- Mercury compiled Next.js code and images.
- Vanta Webflow code and assets.
- Genflow code and assets.
- The referenced `ms-partner-badge.png`; its existence is not adequate evidence of Microsoft partnership or certification.
- Unsupported testimonials, client logos, numerical results, certifications, or partnership claims.

## Supplied approved assets

- `GenesisLogo.svg` — preserved unredrawn as `/public/brand/genesis-logo.svg`.
- `GenesisLogo_Gradient.svg` — preserved unredrawn as `/public/brand/genesis-logo-gradient.svg`.

## Missing content required for future publication

- Approved, attributable testimonials or client statements.
- Case studies with starting condition, implementation scope, supported outcome, and permission to publish.
- Verified performance data and source methodology.
- Client or partner-logo permissions.
- Evidence for any Microsoft partnership, certification, or badge claim.
- Source-backed details of Reginald Benjamin’s relevant experience, credentials, and biography.
- A verified business mailing address if LocalBusiness-style structured data or an address is desired.
- Final production hostname and approved final Open Graph copy for domain cutover.
