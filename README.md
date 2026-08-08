# Genesis AI marketing website

A clean-slate, production-oriented rebuild of the Genesis AI website for real-estate operators. The site uses Next.js App Router, TypeScript, Tailwind CSS, and Motion. Content and business data are centralized in typed modules, and the consultation flow is forwarded server-side to the existing integration.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run build
```

## Environment

- `NEXT_PUBLIC_SITE_INDEXABLE`: defaults to `false`. Set to `true` only for the final production-domain cutover.
- `NEXT_PUBLIC_SITE_URL`: the deployed preview or production origin used for metadata and sitemap URLs.
- `GENESIS_CONSULTATION_WEBHOOK_URL`: optional server-only override for the existing consultation webhook.

The preview must remain no-indexed. Do not set `NEXT_PUBLIC_SITE_INDEXABLE=true` on a preview deployment.

## Content and migration notes

- Business content and plan data: `lib/content.ts`
- Migration decisions, preserved legacy references, and missing-proof checklist: `docs/migration-inventory.md`
- Reproducible hero and social-image prompts: `docs/image-generation-prompts.md`

No Mercury or Vanta implementation code is included. Those snapshots were used only as visual and structural references. The original Genesis deployment, repository, domain, and DNS are outside this project and must remain untouched until the replacement passes final QA.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
