import type { Deal, Source } from "./model.ts";
import { ltv } from "./model.ts";

/** Fictional names on the client desk only. Never render these on a borrower page. */
export const sampleSources: Source[] = [
  {
    id: "sample_a",
    name: "Sample Lender A",
    contact: "Sample contact",
    programs: [
      {
        id: "program_a",
        name: "Sample bridge program",
        product: "Bridge",
        minLoan: 100000,
        maxLoan: 400000,
        maxLtv: 80,
        minCredit: 680,
        notes: "Sample criteria. Not a promise of terms.",
      },
    ],
  },
  {
    id: "sample_b",
    name: "Sample Lender B",
    contact: "Sample contact",
    programs: [
      {
        id: "program_b",
        name: "Sample purchase program",
        product: "Purchase",
        minLoan: 500000,
        maxLoan: 2000000,
        maxLtv: 70,
        minCredit: 700,
        notes: "Sample criteria. Not a promise of terms.",
      },
    ],
  },
  {
    id: "sample_c",
    name: "Sample Lender C",
    contact: "Sample contact",
    programs: [
      {
        id: "program_c",
        name: "Sample refinance program",
        product: "Refinance",
        minLoan: 50000,
        maxLoan: 250000,
        maxLtv: 75,
        minCredit: 660,
        notes: "Sample criteria. Not a promise of terms.",
      },
    ],
  },
];

export type MatchReason = { ok: boolean; text: string };

export type MatchCard = {
  sourceId: string;
  sourceName: string;
  programName: string;
  points: number;
  group: "strong" | "possible";
  reasons: MatchReason[];
};

/** Compares a deal with the client's saved criteria. Genesis does not rank a recommendation. */
export function matchSources(deal: Deal, sources: readonly Source[]): MatchCard[] {
  const cards: MatchCard[] = [];
  const ratio = ltv(deal);
  for (const source of sources) {
    for (const program of source.programs) {
      const reasons: MatchReason[] = [];
      let points = 0;
      if (program.product === deal.product) {
        points += 40;
        reasons.push({ ok: true, text: "Product is on your list" });
      } else {
        points -= 30;
        reasons.push({ ok: false, text: "Product is not on this program" });
      }
      if (deal.amount >= program.minLoan && deal.amount <= program.maxLoan) {
        points += 30;
        reasons.push({ ok: true, text: "Amount is inside your range" });
      } else {
        points -= 25;
        reasons.push({ ok: false, text: "Amount is outside your range" });
      }
      if (ratio === null) {
        reasons.push({ ok: false, text: "Amount versus price is missing" });
      } else if (ratio <= program.maxLtv) {
        points += 20;
        reasons.push({ ok: true, text: "Leverage is inside your maximum" });
      } else {
        points -= 20;
        reasons.push({ ok: false, text: "Leverage is above your maximum" });
      }
      if (deal.credit >= program.minCredit) {
        points += 15;
        reasons.push({ ok: true, text: "Credit meets your minimum" });
      } else {
        points -= 15;
        reasons.push({ ok: false, text: "Credit is below your minimum" });
      }
      if (points < 20) continue;
      cards.push({
        sourceId: source.id,
        sourceName: source.name,
        programName: program.name,
        points,
        group: points >= 60 ? "strong" : "possible",
        reasons,
      });
    }
  }
  return cards.sort((a, b) => b.points - a.points);
}
