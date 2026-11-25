/**
 * The one price lockup on every pricing card (the homepage Levels, /pricing,
 * each edition's Levels and the Ministry plans): the amount with "a month"
 * beside it on one line, then the setup line, when there is one, below.
 */
export function PriceTag({
  amount,
  setup,
  className,
}: {
  amount: string;
  setup?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[clamp(2.1rem,3vw,2.7rem)] leading-none tracking-[-0.05em] tabular-nums">{amount}</span>
        <span className="text-[0.9rem] whitespace-nowrap text-muted-dark">a month</span>
      </p>
      {setup ? <p className="mt-2 text-[0.85rem] text-muted-dark">{setup}</p> : null}
    </div>
  );
}
