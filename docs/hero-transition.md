# The hero transition

A scroll-scrubbed push into the laptop on the island. The camera travels until
what is on that laptop's screen fills the viewport.

**The screen is a hole, not a picture.** It is cut to real transparency in both
photographic plates, and `SystemConsole` — live DOM — sits behind them showing
through it. So the frame you land on is rendered at full size rather than an
image resampled past its resolution. It stays sharp at any zoom, on any display,
and its content is editable markup rather than a re-export.

## The three layers

Back to front, all inside the camera rig:

| Layer | File | Role |
|---|---|---|
| Section | `components/hero/GenesisSystem.tsx` | Live DOM at real viewport dimensions. What you fly into, and what the page becomes. |
| Wide plate | `public/images/hero/hero-plate-room.webp` | The room. Screen cut to transparency. |
| Detail plate | `public/images/hero/hero-plate-detail.webp` | A closer render of the same scene, registered over the wide one. Pure resolution. |
| Mobile wide plate | `public/images/hero/hero-mobile-room.webp` | Portrait room composition used below 768px. Screen cut to transparency. |
| Mobile detail plate | `public/images/hero/hero-mobile-detail.webp` | Portrait close plate registered to the mobile wide screen. |

Masters live in `assets/hero-source/` and are **not** served.

## Why the detail plate fades in late

It spans 43.83% of the frame, so it only covers the viewport once **k ≈ 2.28**.
Before that its own edges would be visible — and because the two renders differ
in exposure, that edge shows. `TIMING.detailIn` starts at `t = 0.42`, safely
past the crossover. The plate is also colour-matched to the wide one (gain
≈0.92, offset ≈+6 per channel) so the crossfade produces no brightness step.

## The measurements

Everything derives from where the screen sits in the wide plate, measured off
the 1920×1080 master:

```
x 845 → 1076   (231 wide)
y 623 →  762   (139 tall)
```

`components/hero/hero.config.ts` turns those into camera-box fractions:

```
centre    50.0260% , 64.1204%     the point the camera pushes toward
glass     12.0313% × 12.8704%     the physical inner display
pan       −0.0260% , −14.1204%    50% minus the centre
zoom max   measured at runtime    from the rendered inner display
```

The screen is **1.662:1, not 16:9** because the camera sees it at an angle. The
screen mask keeps that physical aspect for the entire move. The HTML canvas
inside it starts cover-fitted, then independently scales and centers to real
viewport geometry for the handoff. The display itself is never stretched into
a viewport-shaped target.

The detail plate's placement started from registering the two renders against
each other, masking out both screens (they are featureless) and the detail
plate's hazy border. That left its own cut-out about 21px right of the wide
plate's at full zoom — a sliver of photograph down the left of the final frame.
The two cut-outs are the same physical screen, so they are what has to agree;
the placement is nudged until the holes are concentric, at a cost of ~3px of
scene registration that is only ever on screen mid-crossfade:

```
left 29.0595%   top 39.8940%   size 43.8273%
```

### Mobile art direction

Mobile uses a separate 1440×2560 plate pair rather than cropping the desktop
scene. The connected near-white screen regions were measured and keyed to
transparency at these source bounds:

```
wide     x 566 → 875    y 1391 → 1605    (309 × 214)
detail   x 439 → 1005   y 1088 → 1482    (566 × 394)
```

The detail plate is registered to the wide plate at `left 22.6621%`,
`top 31.2522%`, `width 54.5936%`, and `height 54.3147%`. The tiny width/height
difference corrects the source renders' sub-one-percent perspective mismatch
so both transparent openings agree during the crossfade. Runtime geometry
selects this portrait configuration below 768px and retains the desktop
configuration everywhere else.

## Why the console looks rendered rather than scaled

Two things have to be true, and the second one is easy to lose.

**It is laid out at full size.** `useHeroScrub` gives the miniature the real
layout viewport width and height. At rest it scales down to cover the laptop
display. At the endpoint it uses `1 / zoomMax` and a centered offset, so the
outer camera transform brings it back to exactly 1:1 with the real section.

**It must not be composited.** This is the trap. `will-change: transform`
tells Chrome to rasterise a layer once and reuse the texture. Put the console
inside a layer with that hint and it gets rasterised at k=1 — about 170px
across — and then magnified eight times. You end up flying into a blurry
image, which is the exact thing cutting the screen out was meant to avoid.

So the console rides **its own copy of the rig**, marked `.hero-rig-live`,
which clears `will-change` on the transforming elements. Chrome then
re-rasterises as the scale changes and the type stays type.

The plates keep their promotion, and should: they are images, the texture
stretch is cheap, and a photograph going soft as you push into it is the focus
pull we want anyway.

If the payoff frame ever looks soft again, check this first. Force
`will-change: transform` onto `.hero-rig-live .hero-zoom` in devtools, scroll
the hero from the top, and the blur reappears — that is the whole mechanism in
one toggle.

## The white edge, and why it was there

The supplied renders had **no alpha channel** — their screens were solid white
— so the cut-out was keyed here. Straight (non-premultiplied) alpha keeps the
RGB underneath, which meant the anti-aliased boundary was a ring of ~50%-opaque
*white*. Composited over the dark UI that is a halo, and the push magnifies a
1px ring into an 8px one. It looked like clipping; it was colour.

The fix is to matte the colour, never the alpha: flood the surrounding bezel
inward under everything that is not fully opaque. Shape, size, alignment and
proportions of the cut-out are therefore untouched.

One subtlety cost a pass. Seeding the flood from *every* opaque pixel
propagated white, because keying at a fixed threshold leaves the pale end of
the source's white→bezel gradient opaque. The seed has to exclude anything
near the hole that is too bright to be bezel.

Measured as composited luminance over the console's own background:

```
                 before        after
wide plate    154 (mean)      9.7 (mean), max 58, 0 pixels above 60
detail plate  213 (mean)     10.1 (mean), max 16, 0 pixels above 60
```

Getting the detail plate there took one more idea. Its screen is bordered by a
bright specular highlight on the bezel — real content at rest, but magnified
eight times it reads as exactly the white edge the matte was meant to remove.
So the flood is seeded from bezel that is **both** a few pixels out from the
hole **and** in the darker end of the local distribution, which steps over the
highlight instead of inheriting it. What is lost is a one-pixel glint that is
invisible in the wide shot; what is gained is a clean edge at full zoom.

### The other two sources of white

* **The page background.** `body` is now ink, not ivory. Every section paints
  its own background, so body is only ever seen through a fractional-pixel
  seam — and a light one there is a white hairline between two dark sections
  at 125% or 150% zoom.
* **The viewport edge.** `.hero-entrance` is inset by `calc(var(--hero-bleed) * -1)`.
  Symmetric, so the rig stays centred and none of its geometry moves; it simply
  guarantees fractional scaling cannot expose an edge. `--hero-bleed` is 24px —
  deliberately generous, since it costs nothing and it is the margin that
  browser zoom, fractional device pixels and high-DPI rounding all eat into.

`.hero-screen` also carries a `box-shadow` of solid ink. A box-shadow is
painted outside the border box and is *not* clipped by the element's own
`overflow`, so it beds the screen out under the bezel without enlarging the
mask — the preview stays clipped to the inner display area exactly, and the bed
scales with the rig so it stays tucked under at every step. At 72px it reaches
roughly 450–590px past the screen box by the end of the push, which is half a
screen of solid ink behind everything at the closest zoom.

## The zoom target is the inner display, and it must overfill

The push aims at the laptop's **inner display** — the keyed cut-out — and it is
not enough to stop when that rectangle reaches the viewport edges. Stopping
there leaves the bezel, the notch and the room in frame, because the anti-
aliased boundary, fractional device pixels and browser zoom all eat into a bare
fit.

```
finalScale = max(
  (viewportW + 48) / innerScreenW,
  (viewportH + 48) / innerScreenH
) * 1.08
```

The 48px term guarantees at least 24px beyond each edge before the 8% safety
factor is applied. Raising the camera scale does **not** oversize the UI: the
child canvas scales and centers independently while the physical display and
photograph continue outward.

`ZOOM_END` is 1. At that scroll position the hero is fully above the viewport
and the real Genesis System section is aligned at `(0, 0)`. The transition
layer records the rendered display bounds, hides its photos, sets itself to
`opacity: 0`, `visibility: hidden`, and `pointer-events: none`, then React
removes it from the DOM.

### The acceptance test, run from rendered geometry

Immediately before handoff, `land()` reads the transformed `.hero-screen`
rectangle and requires `left/top <= -24` and `right/bottom >= viewport + 24`.
The result and bounds are retained on the document root for browser QA.

Measured at 1417×829 during the implementation pass:

| viewport | final inner-screen bounds L/T/R/B | margins L/T/R/B | result |
|---|---|---|---|
| 1417×829 | −82.60 / −61.60 / 1499.59 / 890.40 | 82.60 / 61.60 / 82.59 / 61.40 | pass |

After handoff the transition node is absent, visible photographic layers are
zero, and the real section measures exactly `0 / 0 / 1417 / 829`.

## Two sections and a temporary layer

The page is two ordinary stacked sections with a disposable layer between them:

1. **the hero** — a normal `100svh` opening section, permanently in the page;
2. **the Genesis System** — a normal section, permanently below it;
3. **the entrance** — a `position: fixed` overlay that plays the push once and
   is then removed from the DOM.

The overlay is the only thing that ever moves. Neither section is pinned,
collapsed, repositioned or transformed, the document is never locked, and no
scroll is moved on the visitor's behalf. Scrolling is ordinary from the first
frame to the last.

**Progress is just how far the hero has been scrolled out of view.** At `p = 1`
the hero is exactly gone and the Genesis System is exactly at the top of the
viewport — which is precisely the frame the overlay has zoomed to, because
`measure()` aligns the preview canvas to real viewport dimensions while the
physical inner display overfills all four edges. The transition is then hidden
and removed, leaving the already-aligned real section. No scroll repositioning
is required.

Afterwards the visitor is in the section with the hero still sitting above
them, and scrolling up simply scrolls up. The entrance never replays because
its markup no longer exists; only a reload puts it back.

### Size from the layout viewport, not the window

`measure()` reads `documentElement.clientWidth/clientHeight`, not
`innerWidth/innerHeight`. The window includes the scrollbar, so sizing from it
laid the miniature out ~15px wider than the real section it hands over to — a
measurable jump at the seam. Measured after the fix: section box 1264.9 against
a 1265 viewport.

### The laptop is never blank

`CinematicFrame` always renders the screen, and the screen always contains a
`GenesisSystem decorative` — on first load, throughout the push, and afterwards
when the visitor scrolls back up to the hero. The same component and the same
data serve both places, so the miniature cannot drift from the real section.

`decorative` swaps the call to action for plain text, and the screen carries
`aria-hidden`, `inert` and `pointer-events: none`. Verified: zero focusable
elements inside it. It is a picture of the section, not a second copy of it,
and it can never be zoomed into again.

### Why the frame is rendered twice

`CinematicFrame` appears in both the hero section (static) and the overlay
(driven). They are identical at rest because the driver scopes its custom
properties **to the overlay element**, so the static copy falls back to the
`:root` defaults, which are the at-rest values. Write them to `document
Element` instead and the hero zooms along with the overlay.

Only the overlay is passed a `preview` — the Genesis System never lives inside
the hero. The overlay copy is `aria-hidden` and `inert`; the real headline and
calls to action are the hero's, and the real article is the section below.

### Never fall back to a nominal hero height, and re-measure until it takes

`measure()` bails if the hero has no height yet, rather than flooring it to 1.
Progress is scroll ÷ hero height, so a 1px hero means the very first scroll
clamps to 1 and retires the entrance instantly — the animation appears to be
skipped. `onScroll` also retries the measurement until one succeeds, because a
first measure that lands before the stylesheet would otherwise leave a stale
height in place for the life of the page.

Reduced motion retires the entrance during setup: no animation, no scroll
moved, just the two sections.

## What must never block the interface

Three things hit-test whether or not you can see them, and all three have bitten
this hero:

| Layer | Rule |
|---|---|
| `.hero-fit` (the whole rig) | `pointer-events: none` — the plates are several times the viewport and would swallow every click |
| `.hero-screen` (the console) | `pointer-events: auto` — the one part of the rig that *is* the interface |
| `.hero-copy` | gets `data-gone` from the driver at full fade; opacity 0 alone still eats clicks |

The site header is deliberately outside all of this. It stays visible and
clickable for the whole push, sits at `z-100` against the hero's `z-10`, and is
never covered because every hero overlay is `pointer-events: none`.

Over the cinematic frame it carries **no background of its own** — a solid bar
cuts the photograph in half. `html[data-hero-stage="cinematic"]` strips the
background and border and lays a short gradient behind the links for contrast;
once landed the stage flips and it takes a restrained translucent background.

The hero copy is anchored to the **top** of a safe area below the navigation
(`items-start`), not centred in a band. Centred content overflows a band it
outgrows, and on short viewports it overflowed upward — putting the eyebrow
behind the navigation. Anchoring makes that structurally impossible.

## Replacing the plates

1. A replacement pair must share an aspect ratio (desktop is 16:9; mobile is
   9:16), and the laptop screen must be **transparent**. If
   an export flattens the alpha to white, key the largest connected near-white
   region back out — that is how the current plates were made.
2. Re-measure the screen rect from the wide plate and update the four pixel
   values in `hero.config.ts`, plus the mirrored defaults in `:root` in
   `app/globals.css`.
3. Re-solve the detail plate's placement so its cut-out is concentric with the
   wide plate's, colour-match it, and check where it starts covering the frame
   — `detailIn` must not begin before that.
4. Verify at full zoom that **both** the console box and the plate's cut-out
   clear the viewport on all four edges. The console covering is not enough;
   the plate occludes everything outside its hole.
5. **Rename the files.** Overwriting a path that has already shipped serves
   stale images from browser and CDN caches.

## Tuning

All timing is in one block in `hero.config.ts`, as `[start, end]` windows.
Windows keyed to `t` run on eased zoom progress; `copyOut` and `headerIn` use
raw scroll `p` so they clear and arrive on their own schedule.

Scale is exponential in `t` (`k = zoomMax ** t`), so the push reads at a
constant rate instead of crawling then lurching. Runway length is the
`h-[320svh]` on the hero section.

## A note on the console's content

It is deliberately an architecture view, not a product dashboard. It states
what the system is made of, using the real `systemLayers` content, with no
invented metrics or outcomes — consistent with the proof standard in
`docs/migration-inventory.md`. If it ever shows figures, they should be real.
