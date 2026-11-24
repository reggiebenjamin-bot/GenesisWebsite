/*
 * The assessment's "Which best describes you?" answers, in one place, so the
 * assessment, the edition pricing paths and the persona links all read the
 * same words. The most common buyers come first: service businesses and
 * lenders, then the real estate roles, then churches, then Other.
 *
 * No path aliases and no imports in this file: tests import it directly
 * under Node, and lib/assessment.ts and lib/editionPlans.ts both read it.
 */

export const SERVICE_PERSONA = "Service business or trade (HVAC, plumbing, roofing and more)";
export const LENDER_PERSONA = "Lender or loan officer";
export const REAL_ESTATE_TEAM_PERSONA = "Real estate team";

/** The real estate roles: their edition is Genesis Real Estate Pros. */
export const REAL_ESTATE_PERSONAS = [
  "Real estate agent or solo operator",
  REAL_ESTATE_TEAM_PERSONA,
  "Brokerage",
  "Real estate investor",
  "Real estate developer",
] as const;

/** The persona a church picks. */
export const CHURCH_PERSONA = "Church or ministry";

export const OTHER_PERSONA = "Other";

/** Every persona, in the order the assessment offers them. Other stays last. */
export const personas: readonly string[] = [
  SERVICE_PERSONA,
  LENDER_PERSONA,
  ...REAL_ESTATE_PERSONAS,
  CHURCH_PERSONA,
  OTHER_PERSONA,
];

/** Which business edition a persona belongs to. Churches have none here. */
export type PersonaEdition = "business" | "real_estate" | "lending";

export function personaEdition(persona: string | undefined): PersonaEdition | null {
  if (!persona || persona === CHURCH_PERSONA) return null;
  if (persona === LENDER_PERSONA) return "lending";
  if ((REAL_ESTATE_PERSONAS as readonly string[]).includes(persona)) return "real_estate";
  return "business";
}
