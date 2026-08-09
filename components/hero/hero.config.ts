/**
 * Every number the hero push depends on, derived in one place.
 *
 * Three layers ride inside the camera rig, back to front:
 *
 *   1. the section  — `GenesisSystem`, live DOM, showing through the cut-out
 *   2. the wide plate — the room, with the laptop screen cut to transparency
 *   3. the detail plate — a closer render of the same scene, registered on
 *      top of the wide one, which takes over as resolution once it is large
 *      enough to cover the frame
 *
 * The photograph is the entrance, not the destination. It is a portal onto a
 * real section of the site, and once the push lands the rig stands down and
 * hands that section into normal document flow.
 *
 * Measured off the 1920×1080 masters, the screen occupies:
 *
 *     x 845 → 1076   (231 wide)
 *     y 623 →  762   (139 tall)
 */

const SOURCE = { width: 1920, height: 1080 } as const;
const SCREEN_PX = { left: 845, right: 1076, top: 623, bottom: 762 } as const;

/** Extra pixels painted beyond the live viewport by every camera layer. This
 * protects against transform rounding, blur bounds and mobile browser chrome. */
export const LAYER_OVERSCAN = 16;

const screenWidth = SCREEN_PX.right - SCREEN_PX.left; // 231
const screenHeight = SCREEN_PX.bottom - SCREEN_PX.top; // 139

/** Centre of the screen — the point the camera pushes toward. */
const CENTRE = {
  x: (SCREEN_PX.left + screenWidth / 2) / SOURCE.width, // 0.500260
  y: (SCREEN_PX.top + screenHeight / 2) / SOURCE.height, // 0.641204
} as const;

/**
 * The cut-out itself, as fractions of the 16:9 camera box. It is 1.662:1 —
 * foreshortened by the camera angle — which is why the two axes differ.
 *
 * The plates occlude everything outside this hole, so the push has to run far
 * enough that the *hole* clears the viewport, not merely the section.
 */
const HOLE = {
  w: screenWidth / SOURCE.width, // 0.120313
  h: screenHeight / SOURCE.height, // 0.128704
} as const;

/** Reframe needed to bring the screen centre to the middle of the viewport. */
const PAN = { x: 0.5 - CENTRE.x, y: 0.5 - CENTRE.y } as const;

/**
 * Where the detail plate sits inside the wide one. It spans 43.83% of the
 * frame, so it covers the viewport from k ≈ 2.28 onward — the earliest it can
 * be faded up without showing its own edges. The placement is nudged from a
 * pure scene registration so the two cut-outs are concentric; see
 * docs/hero-transition.md.
 */
const DETAIL = {
  left: 0.290595,
  top: 0.39894,
  width: 0.438273,
  height: 0.438273,
} as const;

/**
 * Geometry for each art-directed plate pair. Mobile uses its own portrait
 * camera box and measured display opening; it is not a crop of desktop.
 */
export const DESKTOP_GEOMETRY = {
  aspect: SOURCE.width / SOURCE.height,
  centre: CENTRE,
  hole: HOLE,
  pan: PAN,
  detail: DETAIL,
} as const;

export const MOBILE_GEOMETRY = {
  aspect: 1440 / 2560,
  centre: { x: 0.5003472222, y: 0.58515625 },
  hole: { w: 0.2145833333, h: 0.08359375 },
  pan: { x: -0.0003472222, y: -0.08515625 },
  detail: {
    left: 0.2266207793,
    top: 0.3125218115,
    width: 0.5459363958,
    height: 0.5431472081,
  },
} as const;

/**
 * How far past bare coverage the push runs.
 *
 * The target is the laptop's **inner display**, and bare coverage is not
 * enough. Runtime geometry first adds 24px of required coverage beyond every
 * viewport edge, then this factor provides a further 8% safety margin for
 * browser zoom and fractional-device-pixel rounding.
 *
 * The screen remains the measured physical display rectangle. The HTML canvas
 * inside it is independently centered at viewport size for the final handoff,
 * so overscan pushes the photograph out without enlarging the real section.
 */
export const OVERSCAN = 1.08;

/**
 * How much of the hero's scroll the push consumes.
 *
 * The push completes when the hero has fully left the viewport. At that exact
 * scroll position the real Genesis System section is aligned underneath, so
 * the transition layer can be hidden and removed without moving the document.
 */
export const ZOOM_END = 1;

/**
 * Timing, as [start, end] windows.
 *
 * Windows keyed to `t` run on eased zoom progress, so they stay in step with
 * the camera. `copyOut` uses raw scroll `p`, because the headline should clear
 * on its own schedule rather than the lens's.
 *
 * `detailIn` cannot begin before t ≈ 0.40 — that is the moment the detail
 * plate finally covers the viewport, and until then its edges would show.
 *
 * The site header is not on this list. It stays visible and clickable for the
 * whole push: the navigation belongs to the site, not to the photograph.
 */
export const TIMING = {
  detailIn: [0.42, 0.56], // detail plate takes over as resolution   (t)
  wideOut: [0.6, 0.76], // wide plate retires behind it            (t)
  canvasAlign: [0.12, 0.94], // miniature resolves to viewport geometry (t)
  defocus: [0.05, 0.55], // wide plate pulls out of focus           (t)
  atmosphereOut: [0.5, 0.88], // grain and vignette clear completely     (t)
  copyOut: [0.0, 0.28], // headline clears the frame               (p)
} as const;

/** Peak defocus on the wide plate, in its own unscaled pixels. */
export const MAX_BLUR = 1.4;
