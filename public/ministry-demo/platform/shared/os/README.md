# shared/os: the real Genesis OS stylesheets

Everything in this folder is copied from the Genesis OS repo (the owner's app, `v2/`). It is not a reinterpretation. Do not edit these files by hand: a change here is lost the next time they are refreshed, and it would drift the preview away from the app the owner ships.

Refresh them from the repo with:

```
node tools/sync-os.mjs <path to the Genesis OS repo>
```

The script reads the repo and never writes to it. It copies:

| File here | From the repo | Notes |
|---|---|---|
| `styles.css` | `v2/styles.css` | the base sheet |
| `refine-shell.css` ... `refine-phone.css` | `v2/refine/*.css` | named the way the app serves them (`/v2/assets/refine-shell.css` is `v2/refine/shell.css`) |
| `hawk-review.css` | `v2/hawk-review.css` | |
| `fonts.css` | `v2/fonts.css` | font URLs point at `../fonts/` (the woff2 files are copied to `shared/fonts/`) |
| `genesis-assistant.css` | built from `v2/genesis-assistant.js` | the stylesheet the assistant adopts into its shadow root: the `CSS` constant, `__ns.HAWK_CSS`, and the avatar and dictation blocks, extracted verbatim |
| `hawk-core.js`, `hawk-core-gl.js` | `v2/hawk-core.js`, `v2/hawk-core-gl.js` | the gold particle orb (WebGL, with the 2D fallback). `shared/app.js` loads them and puts the Genesis mark in each orb itself, so the copies keep the repo's absolute mark path unused. |

The only change the script makes is in comments: em dashes become hyphens and private names become "the owner", because these files are hosted with the preview.

`shared/genesis.css` imports the stylesheets in the exact order `v2/index.html` links them (later files win):

styles.css, refine-shell, refine-hawk, refine-today-leads, refine-deals, refine-outreach, refine-acquisitions, refine-content, refine-mydeals, refine-reports, refine-settings, refine-agents, refine-simple, refine-light, refine-system, refine-hawk-core, hawk-review, refine-deals-board, refine-deals-workspace, refine-decisions, refine-reactivation, refine-phone.

Then it adds the Genesis Ministry layer (plan levels, lock badges, Hope drafts, the locked state, charts). See `platform/DESIGN.md`, section "Genesis OS shell".
