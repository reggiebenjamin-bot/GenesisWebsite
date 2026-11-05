"use client";

import Link from "next/link";
import { useState } from "react";
import {
  adjustedCloseRate,
  compactMoney,
  rawCloseRate,
  sampleBalances,
  sampleBook,
  sampleMix,
  sampleOutcomes,
} from "@/lib/platform/lending/dashboards";
import { fundingDisclaimer } from "@/lib/platform/copy";
import { money, stageLabel } from "@/lib/platform/lending/model";
import { cn } from "@/lib/utils";
import { fieldLabel } from "../Chrome";
import { Donut, HorizontalBars, ProgressRing, Sparkline, VerticalBars } from "./charts";
import { DeskDisclaimer } from "./Shell";
import { useDesk } from "./session";

const card = "rounded-[6px] border border-line-light bg-white/80 p-4 sm:p-6";
const primary =
  "inline-flex min-h-12 items-center justify-center rounded-[6px] border border-gold-light bg-gold-light px-4 text-[1rem] font-bold text-ink";
const quiet =
  "inline-flex min-h-12 items-center justify-center rounded-[6px] border border-line-light bg-white px-4 text-[1rem]";

export function HomeDash() {
  const { deals } = useDesk();
  const active = deals.filter((deal) => deal.outcome === "active");
  const pct = Math.min(100, Math.round((sampleBook.fundedVolume / sampleBook.annualTarget) * 100));
  const monthMax = Math.max(...sampleBook.months.map((month) => month.amount), 1);
  const ceiling = monthMax * 1.2;
  const rate = adjustedCloseRate(sampleOutcomes);
  const raw = rawCloseRate(sampleOutcomes);
  const [lossOpen, setLossOpen] = useState(false);
  const [mix, setMix] = useState<"funded" | "active">("funded");

  return (
    <div className="grid gap-6" data-testid="lending-submission">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className={fieldLabel}>Lending pack</p>
          <h1 className="mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-none tracking-[-0.04em]">Submission desk</h1>
          <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">
            {active.length} sample files on the desk. Production figures below are a sample book, not a forecast.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={quiet} href="/desk/intake">Borrower intake</Link>
          <Link className={quiet} href="/desk/learning">Source results</Link>
          <Link className={primary} href="/desk/drop">Drop a deal</Link>
        </div>
      </header>

      <section className="grid gap-6 rounded-[6px] border border-line-dark bg-ink p-6 text-ivory lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
        <div>
          <p className="text-[0.95rem] text-gold-light">{sampleBook.year} recorded production. Sample data.</p>
          <p className="mt-3 text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-normal tracking-[-0.04em] tabular-nums">
            {compactMoney(sampleBook.fundedVolume)}
          </p>
          <p className="mt-3 text-[1.05rem] text-ivory/75">Funded this year. {sampleBook.fundedCount} sample loans.</p>
          <div className="mt-6 flex items-center justify-between gap-3 text-[0.95rem]">
            <span>{compactMoney(sampleBook.annualTarget)} sample target</span>
            <span className="text-gold-light tabular-nums">{pct}%</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-1 rounded-full bg-gold-light" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-[0.95rem] text-ivory/70">
            {compactMoney(sampleBook.annualTarget - sampleBook.fundedVolume)} to the sample target. {compactMoney(sampleBook.stretch)} stretch.
          </p>
          <Link className="mt-4 inline-flex min-h-11 items-center text-gold-light underline" href="/desk/pipeline">Review funded files</Link>
        </div>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-[1.35rem]">Monthly funded volume</h2>
            <p className="text-[0.95rem] text-ivory/70">{compactMoney(Math.round(sampleBook.annualTarget / 12))} sample pace</p>
          </div>
          <div className="mt-4">
            <VerticalBars
              tone="ivory"
              height={152}
              max={ceiling}
              items={sampleBook.months.map((month) => ({
                label: month.label,
                value: month.amount,
                future: month.future,
                title: month.future ? "Future month" : `${month.label}: ${compactMoney(month.amount)} sample`,
              }))}
            />
          </div>
          <p className="mt-3 text-[0.9rem] text-ivory/60">Gold bars are recorded sample funding. Empty months are ahead of this preview. Not a forecast.</p>
        </div>
      </section>

      <section className="grid grid-cols-2 border-b border-line-light xl:grid-cols-4">
        {sampleBalances.map((tile) => (
          <Link key={tile.label} href="/desk/pipeline" className="min-h-24 border-t border-line-light px-4 py-4 hover:bg-ivory">
            <p className={fieldLabel}>{tile.label}</p>
            <p className="mt-2 text-[1.6rem] leading-none tabular-nums">{compactMoney(tile.value)}</p>
            <p className="mt-2 text-[0.95rem] text-ink/65">{tile.detail}. Sample data.</p>
          </Link>
        ))}
      </section>

      <section className={card}>
        <p className={fieldLabel}>Production intelligence</p>
        <h2 className="mt-2 text-[1.7rem] leading-none">Funding velocity and a sample range</h2>
        <p className="mt-3 max-w-3xl text-[1.05rem] leading-relaxed text-ink/75">
          Observed sample production and a weighted sketch of open files. Never a commitment. [CONFIRM: counsel]
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label="Recorded year to date" value={compactMoney(sampleBook.fundedVolume)} detail="Sample funded events" />
          <Tile label="90 day velocity" value={compactMoney(120000)} detail="Aug, Sep, Oct sample average" />
          <Tile label="Active pipeline" value={compactMoney(1370000)} detail="About 6 times one sample month" />
          <Tile label="Needed for the sample target" value={compactMoney(770000)} detail="A sketch for the rest of the year" warn />
        </div>
        <div className="mt-4 rounded-[6px] bg-ink p-4 text-ivory">
          <p className="text-[0.95rem] text-gold-light">Model signal. Not a commitment. [CONFIRM: counsel]</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Scenario label="Weighted floor" value={compactMoney(1100000)} />
            <Scenario label="Recent pace" value={compactMoney(1100000)} featured />
            <Scenario label="Upside sketch" value={compactMoney(2470000)} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div>
            <h3 className="text-[1.15rem]">Sample pace by month</h3>
            <div className="mt-3">
              <VerticalBars
                height={180}
                max={ceiling}
                items={sampleBook.months.map((month) => ({
                  label: month.label,
                  value: month.future ? 120000 : month.amount,
                  title: month.future ? "Modeled pace" : "Sample funded",
                }))}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[6px] border border-line-light p-4">
              <h3 className="text-[1.1rem]">Sample signals</h3>
              <ul className="mt-3 grid gap-2 text-[1rem]">
                <li>October momentum. Sample only.</li>
                <li>Current month funded. {compactMoney(140000)}.</li>
                <li>Files past intake. Sample share.</li>
                <li>Goal gap. {compactMoney(sampleBook.annualTarget - sampleBook.fundedVolume)}.</li>
              </ul>
            </div>
            <div className="rounded-[6px] border border-line-light p-4">
              <h3 className="text-[1.1rem]">Volume by stage</h3>
              <div className="mt-3">
                <HorizontalBars
                  items={[
                    { label: "Submitted", value: 240000, note: compactMoney(240000) },
                    { label: "In review", value: 180000, note: compactMoney(180000) },
                    { label: "Matched", value: 500000, note: compactMoney(500000) },
                    { label: "Terms ready", value: 150000, note: compactMoney(150000) },
                    { label: "Closing", value: 300000, note: compactMoney(300000) },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[6px] border border-gold-dark/40 bg-ivory px-4 py-4 text-[1.05rem] text-ink">
        {sampleBook.undatedFunded} funded sample record needs a date. {sampleBook.amountReview} needs an amount review. Undated records stay out of the year total.
        <Link className="ml-3 underline" href="/desk/pipeline">Review records</Link>
      </section>

      <section className={card}>
        <p className={fieldLabel}>Sample signals</p>
        <h2 className="mt-2 text-[1.7rem] leading-none">Email opportunity radar</h2>
        <p className="mt-3 text-[1.05rem] text-ink/75">Waiting for a verified mailbox scan. The bars are sample data, not a live inbox. [CONFIRM: counsel]</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label="Needs review" value="7" detail="Sample tasks" />
          <Tile label="Notes evaluated" value="41" detail="Sample run" />
          <Tile label="Meetings" value="3" detail="Sample, 30 days" />
          <Tile label="Mailbox coverage" value="0 of 0" detail="Not connected" />
        </div>
        <div className="mt-4">
          <VerticalBars
            height={96}
            max={4}
            items={["15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"].map((day, index) => ({
              label: index % 2 === 0 ? day : "",
              value: index % 3,
              title: `Oct ${day}. Sample count.`,
            }))}
          />
        </div>
        <p className="mt-2 text-[0.95rem] text-ink/60">Review candidates, not qualified volume. Nothing sends.</p>
      </section>

      <section className={card}>
        <p className={fieldLabel}>Assistant growth ledger</p>
        <h2 className="mt-2 text-[1.7rem] leading-none">What is moving on this screen</h2>
        <p className="mt-3 text-[1.05rem] text-ink/75">Sample counts for the last day. A note here is not a send. [CONFIRM: counsel]</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Tile label="Sourced" value="9" detail="Sample" />
          <Tile label="Actions noted" value="4" detail="Sample" />
          <Tile label="Replies" value="2" detail="Sample" />
          <Tile label="Intakes started" value="1" detail="Sample" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h3 className="text-[1.15rem]">Source coverage</h3>
            <ul className="mt-3 grid gap-2 text-[1rem]">
              <li>Sample feed. Not connected.</li>
              <li>Email radar. Mailbox scan is not connected.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[1.15rem]">Next moves</h3>
            <ul className="mt-3 grid gap-2">
              {active.slice(0, 3).map((deal) => (
                <li key={deal.id}>
                  <Link href={`/desk/deals/${deal.id}`} className="block min-h-12 rounded-[6px] border border-line-light px-3 py-3 hover:border-gold-dark">
                    <span className="text-[1.05rem]">{deal.title}</span>
                    <span className="mt-1 block text-[0.95rem] text-ink/70">{deal.next}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={card}>
        <p className={fieldLabel}>Demand sketch. 30 days.</p>
        <h2 className="mt-2 text-[1.7rem] leading-none">From signal to a sample file</h2>
        <p className="mt-3 text-[1.05rem] text-ink/75">Text stays off. Sequences are not connected. [CONFIRM: counsel]</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Tile label="Discovered" value="18" detail="12 could be contacted" />
          <Tile label="Hot signals" value="3" detail="Sample scores" />
          <Tile label="Replies to work" value="2" detail="Sample" />
          <Tile label="Enrichment" value="Off" detail="Manual only" />
          <Tile label="Reply rate" value="5%" detail="Sample arithmetic" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-[1.15rem]">Sample cohort</h3>
            <HorizontalBars
              items={[
                { label: "Captured", value: 8, note: "8" },
                { label: "In motion", value: 4, note: "4" },
                { label: "Funded", value: 1, note: "1" },
              ]}
            />
          </div>
          <div>
            <h3 className="text-[1.15rem]">Top sample sources</h3>
            <HorizontalBars
              items={[
                { label: "Website", value: 5, note: "5 captured" },
                { label: "Referral", value: 3, note: "3 captured" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={card}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[1.5rem] leading-none">Funding partner mix</h2>
            <p className={fieldLabel}>Sample data</p>
          </div>
          <div className="mt-3 flex gap-2">
            {(["funded", "active"] as const).map((item) => (
              <button key={item} type="button" className={mix === item ? primary : quiet} onClick={() => setMix(item)}>
                {item === "funded" ? "Funded sample" : "Active sample"}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Donut parts={sampleMix.map((row) => ({ share: row.share }))} center={`${sampleMix[0]?.share ?? 0}%`} />
            <div>
              <p className="text-[1.6rem] tabular-nums">{compactMoney(sampleMix.reduce((sum, row) => sum + row.amount, 0))}</p>
              <p className="mt-1 text-[1rem] text-ink/70">Sample names on your list. Genesis does not choose them. [CONFIRM: counsel]</p>
            </div>
          </div>
          <table className="mt-4 w-full text-left text-[1rem]">
            <thead>
              <tr className="text-ink/60">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Files</th>
                <th className="py-2 font-medium">Volume</th>
                <th className="py-2 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {sampleMix.map((row) => (
                <tr key={row.name} className="border-t border-line-light">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2 tabular-nums">{row.count}</td>
                  <td className="py-2 tabular-nums">{compactMoney(row.amount)}</td>
                  <td className="py-2 tabular-nums">{row.share}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[0.95rem] text-ink/70">One sample name is above 40 percent of this book. Unassigned stays visible. {fundingDisclaimer}</p>
        </article>

        <article className={card}>
          <p className={fieldLabel}>From open file to funded</p>
          <h2 className="mt-2 text-[1.5rem] leading-none">Conversion quality</h2>
          <p className="mt-2 text-[1rem] text-ink/70">Sample closed outcomes by count. [CONFIRM: counsel]</p>
          <p className="mt-4 text-[3rem] leading-none tabular-nums text-ink">{rate}%</p>
          <p className="text-[0.95rem] text-gold-dark">Provisional. {sampleOutcomes.unreviewed} loss still needs a note.</p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-ivory-deep">
            <div className="bg-ink" style={{ width: "40%" }} />
            <div className="bg-gold-dark" style={{ width: "30%" }} />
            <div className="bg-gold" style={{ width: "10%" }} />
            <div className="bg-ivory" style={{ width: "20%" }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[1rem]">
            <p>Funded. {sampleOutcomes.funded}</p>
            <p>Qualified losses. {sampleOutcomes.qualifiedLost}</p>
            <p>Need review. {sampleOutcomes.unreviewed}</p>
            <p>Set aside. {sampleOutcomes.excluded}</p>
          </div>
          <p className="mt-3 text-[0.95rem] text-ink/70">
            Adjusted {rate}% . Raw {raw}% . {sampleOutcomes.active} sample files are still open.
          </p>
          <button type="button" className={cn(quiet, "mt-4")} onClick={() => setLossOpen((open) => !open)}>
            {lossOpen ? "Hide loss notes" : "Review closed samples"}
          </button>
          {lossOpen ? (
            <p className="mt-3 text-[1rem]">Sample closed file. Reason stays on this screen. Nothing is stored.</p>
          ) : null}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className={card}>
          <h2 className="text-[1.5rem]">Your next moves</h2>
          <ul className="mt-4 grid gap-2">
            {active.map((deal) => (
              <li key={deal.id}>
                <Link href={`/desk/deals/${deal.id}`} className="grid min-h-14 gap-1 rounded-[6px] border border-line-light px-4 py-3 hover:border-gold-dark">
                  <span className="text-[1.05rem]">{deal.title}</span>
                  <span className="text-[0.95rem] text-ink/70">{deal.borrowerName}. {money(deal.amount)}. {stageLabel(deal.stageId)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <aside className="rounded-[6px] border border-line-light bg-ivory p-4">
          <h2 className="text-[1.7rem] leading-none font-normal tracking-[-0.03em]">No loose ends.</h2>
          <dl className="mt-4 grid gap-3 text-[1.05rem]">
            <div className="flex justify-between gap-3"><dt>Follow ups due</dt><dd className="tabular-nums">{active.filter((deal) => deal.follow === "due").length}</dd></div>
            <div className="flex justify-between gap-3"><dt>No reminder</dt><dd className="tabular-nums">{active.filter((deal) => deal.follow === "none").length}</dd></div>
            <div className="flex justify-between gap-3"><dt>Waiting on you</dt><dd className="tabular-nums">{active.length}</dd></div>
          </dl>
          <Link href="/desk/drop" className="mt-4 block text-[1.05rem] underline">Got a deal in a message?</Link>
        </aside>
      </section>

      <LegacyCards />
      <p className="text-[1rem] text-ink/70">Feeds are not connected. Jobs are not running. Sample data only.</p>
      <DeskDisclaimer />
    </div>
  );
}

function Tile({ label, value, detail, warn = false }: { label: string; value: string; detail: string; warn?: boolean }) {
  return (
    <article className={cn("rounded-[6px] border px-4 py-3", warn ? "border-gold-dark bg-ivory" : "border-line-light bg-white")}>
      <p className={fieldLabel}>{label}</p>
      <p className="mt-2 text-[1.45rem] leading-none tabular-nums">{value}</p>
      <p className="mt-2 text-[0.95rem] text-ink/65">{detail}</p>
    </article>
  );
}

function Scenario({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  return (
    <article className={cn("rounded-[6px] border px-4 py-3", featured ? "border-gold-light" : "border-white/15")}>
      <p className="text-[0.95rem] text-ivory/70">{label}</p>
      <p className="mt-2 text-[1.4rem] tabular-nums">{value}</p>
    </article>
  );
}

function LegacyCards() {
  return (
    <section className="grid gap-4">
      <h2 className="text-[1.5rem]">More sample views</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h3 className="text-[1.25rem]">Sample goals</h3>
          <div className="mt-4 flex flex-wrap gap-6">
            <ProgressRing value={36} label="Sample volume pace" />
            <ProgressRing value={40} label="Sample file pace" />
          </div>
          <p className="mt-2 text-[0.95rem] text-ink/65">Sample targets on this screen. Genesis takes no fee. [CONFIRM: counsel]</p>
        </article>
        <article className={card}>
          <h3 className="text-[1.25rem]">Sample activity</h3>
          <VerticalBars
            height={140}
            max={4}
            items={["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, index) => ({ label, value: index + 1 }))}
          />
          <p className="mt-2 text-[0.95rem] text-ink/65">Sample counts. Not a forecast.</p>
        </article>
        <article className={card}>
          <h3 className="text-[1.25rem]">Sample record</h3>
          <p className="mt-2 text-[2rem] tabular-nums">4 and 6</p>
          <p className="text-[1rem] text-ink/70">Funded samples and closed samples. [CONFIRM: counsel]</p>
        </article>
        <article className={card}>
          <h3 className="text-[1.25rem]">Sample geography</h3>
          <HorizontalBars items={[{ label: "Texas", value: 6, note: "6 files" }, { label: "Sample City", value: 6, note: "Same sample" }]} />
        </article>
        <article className={card}>
          <h3 className="text-[1.25rem]">Email pulse</h3>
          <p className="mt-2 text-[1rem] text-ink/75">Open, reply, and bounce rates are not measured. Nothing has been sent. [CONFIRM: counsel]</p>
          <Sparkline points={[1, 2, 1, 3, 2, 4, 1]} />
        </article>
        <article className={card}>
          <h3 className="text-[1.25rem]">Intake link</h3>
          <p className="mt-2 text-[1rem]">New this week: 1 sample. The public intake stays on this preview.</p>
          <Link className="mt-3 inline-flex min-h-11 items-center underline" href="/desk/intake">Open intake</Link>
        </article>
      </div>
    </section>
  );
}
