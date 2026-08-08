# Image generation handoff

These prompts document the original assets generated for the clean Genesis AI rebuild. They are suitable starting points for higher-fidelity replacement renders, provided the geometry and screen placement remain consistent with the implemented transition.

## Asset A — architectural world

Output: `public/images/hero/genesis-hero-world.png` and responsive WebP derivatives.

Prompt:

> Create a 16:9, photorealistic editorial architectural photograph designed specifically for a cinematic website zoom. Camera inside a refined contemporary home's living space at restrained golden/blue hour, looking through fully open glass walls toward a landscaped terrace and distant understated neighborhood horizon. A long dark architectural stone kitchen island or staging console sits in the exact central visual corridor. On it is one premium open laptop, nearly perpendicular to camera, perfectly centered and slightly below frame center, occupying only about 10% of image width. Its screen is dark ink-black with a very subtle warm gold edge glow and no words, logos, UI, or symbols. Add only understated property keys and one thin closed folder. Use ceiling lines, the island edge, and terrace lines as leading lines toward the laptop. The room feels high-value, believable, quiet, controlled, spacious, and operational—not a mansion advertisement. Warm ivory highlights, restrained heritage-gold practical lights, ink-black shadows, realistic stone, wood, glass, and linen. Full-frame 35mm lens language, deep enough focus that the laptop is tack sharp and survives a 4× crop; mild atmospheric depth around it. Keep all essential detail away from the outside edges. No people, robots, circuitry, holograms, fake dashboards, neon, text, logos, glowing orbs, or generic AI imagery.

## Asset B — matched laptop approach

Output: `public/images/hero/genesis-hero-approach.png` and responsive WebP derivatives.

Edit prompt (using Asset A as the visual reference):

> Produce a physically consistent closer camera position in the exact same room, time of day, lighting, materials, color grade, and lens family. The camera has moved straight forward along the original central axis toward the same laptop—do not redesign or relocate anything. The laptop remains perfectly centered, its screen rectangle nearly front-on, now occupying roughly 58–65% of frame width and about 45–55% of frame height. The dark screen must remain completely blank ink-black with only a subtle warm-gold edge reflection so HTML can crossfade over it. The dark stone island spans the lower frame, while recognizable architecture, open glass walls, terrace, and horizon remain around the edges with mild natural depth blur. Preserve identical laptop shape, island material, property keys, thin folder, warm practical lights, heritage-gold and ink-black grade. This is the middle frame of one continuous dolly-in, not a separate photograph. No text, logos, interface, symbols, people, floating graphics, holograms, neon, robots, or new objects.

## Social sharing image

Output: `public/og.png` (1200 × 630).

Prompt:

> Create a premium 1.91:1 editorial brand image for Genesis AI. Use an architectural abstract composition inspired by refined real-estate materials: ink-black and midnight-navy planes, warm-ivory stone, thin heritage-gold structural lines, and one subtle status-green detail. Suggest a quietly connected managed operating system through precise nested planes and restrained connections, without resembling a dashboard. Leave clean negative space for metadata overlays, but bake in no text. Calm, credible, established, minimal, realistic materials, no logos, no robots, no circuitry, no neon sci-fi effects, no blurred orbs, and no fake interface.

## Replacement constraints

- Preserve the laptop's centered screen geometry in both hero frames.
- Keep the laptop screen dark, blank, and nearly perpendicular to camera.
- Match lighting, focal language, set dressing, and color grade exactly between frames.
- Do not bake Genesis interface text into either photograph; the destination is live HTML.
- Regenerate and compare desktop and mobile crops before replacing the optimized files.
