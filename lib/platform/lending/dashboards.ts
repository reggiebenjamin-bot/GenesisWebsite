/** Fictional sample book for the Lending pack dashboards. Not a live book of record. */

export const sampleBook = {
  year: 2026,
  annualTarget: 2400000,
  stretch: 4000000,
  fundedVolume: 860000,
  fundedCount: 4,
  undatedFunded: 1,
  amountReview: 1,
  months: [
    { label: "Jan", amount: 40000, count: 1, future: false },
    { label: "Feb", amount: 90000, count: 1, future: false },
    { label: "Mar", amount: 70000, count: 0, future: false },
    { label: "Apr", amount: 80000, count: 1, future: false },
    { label: "May", amount: 60000, count: 0, future: false },
    { label: "Jun", amount: 110000, count: 1, future: false },
    { label: "Jul", amount: 50000, count: 0, future: false },
    { label: "Aug", amount: 120000, count: 0, future: false },
    { label: "Sep", amount: 100000, count: 0, future: false },
    { label: "Oct", amount: 140000, count: 0, future: false },
    { label: "Nov", amount: 0, count: 0, future: true },
    { label: "Dec", amount: 0, count: 0, future: true },
  ],
} as const;

export const sampleBalances = [
  { label: "Active pipeline", value: 1370000, detail: "5 sample files" },
  { label: "Submitted", value: 240000, detail: "On your desk" },
  { label: "Terms ready", value: 150000, detail: "Terms still open" },
  { label: "Closing", value: 300000, detail: "Not yet funded" },
] as const;

export const sampleMix = [
  { name: "Sample Lender A", amount: 400000, count: 2, share: 46.5 },
  { name: "Sample Lender B", amount: 260000, count: 1, share: 30.2 },
  { name: "Unassigned", amount: 200000, count: 1, share: 23.3 },
] as const;

export const sampleOutcomes = {
  funded: 4,
  qualifiedLost: 3,
  unreviewed: 1,
  excluded: 2,
  active: 5,
};

export function compactMoney(value: number): string {
  if (value >= 1000000) {
    const millions = value / 1000000;
    const text = millions >= 10 ? millions.toFixed(1) : millions.toFixed(2);
    return `$${text}M`;
  }
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString("en-US")}`;
}

export function adjustedCloseRate(input: typeof sampleOutcomes): number {
  const denominator = input.funded + input.qualifiedLost + input.unreviewed;
  if (!denominator) return 0;
  return Math.round((input.funded / denominator) * 1000) / 10;
}

export function rawCloseRate(input: typeof sampleOutcomes): number {
  const dead = input.qualifiedLost + input.unreviewed + input.excluded;
  const denominator = input.funded + dead;
  if (!denominator) return 0;
  return Math.round((input.funded / denominator) * 1000) / 10;
}
