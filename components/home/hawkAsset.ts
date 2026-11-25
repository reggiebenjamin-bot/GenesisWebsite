/**
 * The hawk behind the hero, referenced from Unsplash: "A close up of a bird of
 * prey on a black background" by Andy Spark,
 * https://unsplash.com/photos/q90Nm8MAbOY, free to use under the Unsplash
 * License.
 *
 * Its black background renders as empty space, so only the bird turns into
 * characters. images.unsplash.com answers with Access-Control-Allow-Origin: *,
 * which the effect needs in order to read the pixels. The character grid
 * samples a few hundred columns at most, so 1200px wide is plenty.
 *
 * The photo is cropped around the hawk's eye (fp-x is the eye's position
 * across the photo). The effect centres the image it draws, so the eye lands
 * on the centre of the hero at every screen width. The crop drops only the
 * dark edge of the hawk's back.
 */
export const HAWK_IMAGE_ORIGIN = "https://images.unsplash.com";

/** The same crop at a given width (Unsplash resizes by the w= and h= parameters). */
export function hawkImageUrl(width: number) {
  const height = Math.round((width * 925) / 1200);
  return `${HAWK_IMAGE_ORIGIN}/photo-1700420626773-e506f3724366?w=${width}&h=${height}&fit=crop&crop=focalpoint&fp-x=0.5675&fp-y=0.5&q=70&auto=format`;
}

export const HAWK_IMAGE_SRC = hawkImageUrl(1200);

/* A phone gets a phone sized hawk: the hero's largest paint is this image, so it should not
   wait on a desktop sized file. The effect then draws from whichever file the browser chose. */
export const HAWK_IMAGE_SRCSET = [600, 900, 1200].map((width) => `${hawkImageUrl(width)} ${width}w`).join(", ");
export const HAWK_IMAGE_SIZES = "100vw";
