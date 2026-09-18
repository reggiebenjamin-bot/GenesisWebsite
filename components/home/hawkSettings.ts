import type { CSSProperties } from "react";

/**
 * How the hero hawk is framed and drawn, in one place. HawkHero hands the
 * framing values to its stylesheet as custom properties; HawkAscii passes the
 * drawing values to the Componentry AsciiEffect.
 *
 * Tuned by eye on desktop. A phone keeps its own smaller, still hawk (see
 * HawkAscii and HawkHero.module.css).
 */
export const HAWK = {
  /** Shift left or right, as a percentage of the hero's width. */
  x: 6.5,
  /** Top of the frame, as a percentage of the hero's height. */
  y: -6.5,
  /** Size of the photo relative to filling the frame. */
  scale: 1.01,
  /*
   * Every animated frame redraws every character, so the grid is what the
   * motion costs. These three set it: a touch larger and a touch more open
   * than the look was tuned at (8px, 1, 1.05), which draws about a third
   * fewer characters a frame.
   */
  /** Character size in pixels. */
  fontSize: 9,
  /** Space between characters, as a multiple of a character's width. */
  characterSpacing: 1.04,
  /** Space between rows, as a multiple of the character size. */
  lineHeight: 1.1,
  /** Nudged up with the more open grid, which reads slightly dimmer. */
  brightness: 1.2,
  contrast: 0.8,
  /** Tones darker than this draw nothing. Raised a little from 0.1, which
      drops near-invisible specks and the work of drawing them. */
  threshold: 0.12,
  animate: true,
  flowStrength: 2.5,
  flowSpeed: 0.1,
  mouseStrength: 10,
  mouseRadius: 110,
  /** Darkness of the soft ground under the copy, 0 to 1. */
  scrim: 0.85,
  /** Where the fade-in below the navigation ends, as a percentage of the frame. */
  fadeTop: 12,
  /** Where the fade-out at the bottom begins, as a percentage of the frame. */
  fadeBottom: 64,
} as const;

/** The framing values, as the custom properties HawkHero.module.css reads. */
export const hawkFrameStyle = {
  "--hawk-x": `${HAWK.x}%`,
  "--hawk-y": `${HAWK.y}%`,
  "--hawk-scrim": String(HAWK.scrim),
  "--hawk-fade-top": `${HAWK.fadeTop}%`,
  "--hawk-fade-bottom": `${HAWK.fadeBottom}%`,
} as CSSProperties;
