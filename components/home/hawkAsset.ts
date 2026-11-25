/**
 * The hawk behind the hero. Photo credit: "A close up of a bird of prey on a
 * black background" by Andy Spark on Unsplash,
 * https://unsplash.com/photos/q90Nm8MAbOY, free to use under the Unsplash
 * License.
 *
 * The files are served from this site (public/images/home), so the hero's
 * largest paint waits on no other host and the effect can read the pixels
 * without a cross origin request. They were saved from Unsplash at
 * photo-1700420626773-e506f3724366, 1200 by 925, cropped around the hawk's eye
 * (fit=crop, crop=focalpoint, fp-x=0.5675, fp-y=0.5), then resized to each
 * width as WebP.
 *
 * Its black background renders as empty space, so only the bird turns into
 * characters. The character grid samples a few hundred columns at most, so
 * 1200px wide is plenty. The effect centres the image it draws, so the eye
 * lands on the centre of the hero at every screen width. The crop drops only
 * the dark edge of the hawk's back.
 */
export const HAWK_IMAGE_WIDTHS = [600, 900, 1200] as const;

/** The same crop at one of the saved widths. */
export function hawkImageUrl(width: (typeof HAWK_IMAGE_WIDTHS)[number]) {
  return `/images/home/hawk-hero-${width}.webp`;
}

export const HAWK_IMAGE_SRC = hawkImageUrl(1200);

/* A phone gets a phone sized hawk: the hero's largest paint is this image, so it should not
   wait on a desktop sized file. The effect then draws from whichever file the browser chose. */
export const HAWK_IMAGE_SRCSET = HAWK_IMAGE_WIDTHS.map((width) => `${hawkImageUrl(width)} ${width}w`).join(", ");
export const HAWK_IMAGE_SIZES = "100vw";
