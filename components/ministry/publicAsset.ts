import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The public path of a file in public/, or null when the file is not there.
 *
 * Server only. The Ministry page is prerendered, so this runs at build time:
 * a film or poster added to public/ appears on the next build, and until then
 * the page draws a placeholder instead of pointing a player at a missing file.
 */
export function publicAsset(path: string): string | null {
  return existsSync(join(process.cwd(), "public", path)) ? path : null;
}
