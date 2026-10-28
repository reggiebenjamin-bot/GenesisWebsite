import { general } from "./general.ts";
import { lending } from "./lending.ts";
import { realEstate } from "./real_estate.ts";
import { isVerticalId, type Pack, type VerticalId } from "./types.ts";

/** Register a pack here. Pages read this list. They do not branch on a new route. */
export const packs: readonly Pack[] = [general, realEstate, lending];

export function getPack(id: string | null | undefined): Pack | null {
  if (!id || !isVerticalId(id)) return null;
  return packs.find((pack) => pack.id === id) ?? null;
}

export function requirePack(id: VerticalId): Pack {
  const pack = getPack(id);
  if (!pack) throw new Error(`Missing pack ${id}`);
  return pack;
}

export { general, realEstate, lending };
export type { Pack, VerticalId } from "./types.ts";
export { isVerticalId, verticalIds } from "./types.ts";
