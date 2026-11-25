/**
 * Black Friday setup waiver for the three Genesis Managed AI levels.
 *
 * The monthly price stays. The one-time setup Price is left off the Checkout
 * Session until this instant, then it comes back on its own. The offset is
 * Central Standard Time, which is America/Chicago on January 1.
 *
 * No path aliases: tests import this file directly under Node.
 */
export const SETUP_WAIVER_ENDS = "2027-01-01T00:00:00-06:00";

export const SETUP_WAIVER_LINE = "Black Friday: setup fee waived through Dec 31";

/** True while the current time is still before the waiver ends. */
export function setupWaiverActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(SETUP_WAIVER_ENDS).getTime();
}
