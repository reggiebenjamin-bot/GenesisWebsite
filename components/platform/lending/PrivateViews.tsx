"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import {
  docPhases,
  feeNote,
  fundingDisclaimer,
  ltv,
  matchNote,
  money,
  stageLabel,
  visibleDeals,
  type Deal,
  type Outcome,
  type StageId,
  lendingStages,
} from "@/lib/platform/lending/model";
import { matchSources } from "@/lib/platform/lending/sources";
import { cn } from "@/lib/utils";
import { Notice, fieldLabel, textInput } from "../Chrome";
import { DeskDisclaimer, ScreenHead } from "./Shell";
import { useDesk } from "./session";

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-[6px] border border-gold-light bg-gold-light px-4 text-center text-[1rem] font-bold text-ink";
const quiet =
  "inline-flex min-h-12 items-center justify-center rounded-[6px] border border-line-light bg-white px-4 text-center text-[1rem]";
const card = "rounded-[6px] border border-line-light bg-white/70 p-4";

export function SubmissionDesk() {
  const { deals } = useDesk();
  const active = deals.filter((deal) => deal.outcome === "active");
  const tiles = [
    ["Active", active.length, "/desk/pipeline"],
    ["In review", active.filter((deal) => deal.stageId === "in_review").length, "/desk/pipeline"],
    ["Terms ready", active.filter((deal) => deal.stageId === "terms_ready").length, "/desk/pipeline"],
    ["Funded", deals.filter((deal) => deal.outcome === "funded").length, "/desk/pipeline/board"],
  ] as const;
  const due = deals.filter((deal) => deal.follow === "due" && deal.outcome === "active").length;
  const none = deals.filter((deal) => deal.follow === "none" && deal.outcome === "active").length;
  return (
    <div className="grid gap-8">
      <ScreenHead
        testId="lending-submission"
        eyebrow="Lending pack"
        title="Submission desk"
        lede="Your next files, in a dry run. Counts are sample data, not a forecast."
        actions={
          <>
            <Link className={primary} href="/desk/drop">Drop a deal</Link>
            <Link className={quiet} href="/desk/pipeline">Open pipeline</Link>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map(([label, count, href]) => (
          <Link key={label} href={href} className={cn(card, "min-h-24 hover:border-gold-dark")}>
            <p className={fieldLabel}>{label}</p>
            <p className="mt-3 text-[2rem] leading-none tracking-[-0.04em] tabular-nums">{count}</p>
            <p className="mt-2 text-[0.95rem] text-ink/60">Sample count.</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        <section className={card}>
          <h2 className="text-[1.5rem] leading-none tracking-[-0.04em]">Your next moves</h2>
          <ul className="mt-4 grid gap-2">
            {active.slice(0, 4).map((deal) => (
              <li key={deal.id}>
                <Link href={`/desk/deals/${deal.id}`} className="grid min-h-14 gap-1 rounded-[6px] border border-line-light px-4 py-3 hover:border-gold-dark">
                  <span className="text-[1.125rem]">{deal.title}</span>
                  <span className="text-[1rem] text-ink/70">
                    {deal.borrowerName}. {money(deal.amount)}. {stageLabel(deal.stageId)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <aside className="grid gap-4">
          <section className={card}>
            <h2 className="text-[1.35rem] leading-none">Keep it moving</h2>
            <dl className="mt-4 grid gap-3 text-[1.05rem]">
              <div className="flex justify-between gap-4 border-t border-line-light pt-3"><dt>Follow ups due</dt><dd>{due}</dd></div>
              <div className="flex justify-between gap-4 border-t border-line-light pt-3"><dt>No reminder</dt><dd>{none}</dd></div>
              <div className="flex justify-between gap-4 border-t border-line-light pt-3"><dt>Waiting on you</dt><dd>{active.length}</dd></div>
            </dl>
          </section>
          <Link href="/desk/drop" className={cn(card, "block hover:border-gold-dark")}>
            <p className={fieldLabel}>Capture</p>
            <p className="mt-2 text-[1.25rem]">Got a deal in a message?</p>
            <p className="mt-2 text-[1rem] text-ink/70">Start a review draft. Nothing is submitted.</p>
          </Link>
        </aside>
      </div>
      <p className="text-[1rem] text-ink/70">Feeds are not connected. [CONFIRM]</p>
      <DeskDisclaimer />
    </div>
  );
}

export function DropDeal() {
  const { deals, sources, addDeal } = useDesk();
  const [note, setNote] = useState("");
  const [source, setSource] = useState("Email");
  const [draft, setDraft] = useState<{ address: string; amount: number; duplicate: boolean } | null>(null);
  const preview = deals[0] ? matchSources(deals[0], sources).slice(0, 2) : [];
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid gap-6">
        <ScreenHead
          testId="lending-drop"
          eyebrow="Lending pack"
          title="Drop a deal"
          lede="Paste what you have. Review the facts. This creates a draft, not a submission."
          actions={<Link className={quiet} href="/desk/pipeline">Open pipeline</Link>}
        />
        <label className="grid gap-2">
          <span className={fieldLabel}>The message or the numbers</span>
          <textarea className={`${textInput} min-h-36 py-3`} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className={fieldLabel}>Where did this come from?</span>
          <select className={textInput} value={source} onChange={(event) => setSource(event.target.value)}>
            {["Email", "Text", "Website", "Referral", "Other"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <p className="text-[1rem] text-ink/70">Voice is not in this preview. A mailbox is not connected. Paste the message instead.</p>
        <button
          type="button"
          className={primary}
          onClick={() => {
            const duplicate = deals.some((deal) => note.includes(deal.address));
            setDraft({
              address: duplicate ? "100 Sample Street" : "210 Sample Street",
              amount: 180000,
              duplicate,
            });
          }}
        >
          Create review draft
        </button>
        {draft ? (
          <section className={card}>
            <h2 className="text-[1.5rem]">Review the facts</h2>
            <p className="mt-2 text-[1rem] text-ink/70">Source: {source}. Sample extraction. Not a live read.</p>
            <dl className="mt-4 grid gap-3 text-[1.05rem]">
              <div><dt className={fieldLabel}>Address</dt><dd>{draft.address}</dd></div>
              <div><dt className={fieldLabel}>Amount</dt><dd>{money(draft.amount)}</dd></div>
              <div><dt className={fieldLabel}>Borrower</dt><dd>Sample Borrower</dd></div>
            </dl>
            {draft.duplicate ? (
              <p className="mt-4 text-[1.05rem]">An active sample file already uses this address. You can still keep a separate draft.</p>
            ) : null}
            <button
              type="button"
              className={cn(primary, "mt-4")}
              onClick={() => {
                addDeal({
                  ...deals[0],
                  id: `draft_${deals.length + 1}`,
                  title: "Sample draft",
                  address: draft.address,
                  amount: draft.amount,
                  stageId: "submitted",
                  outcome: "active",
                  sourceId: null,
                  follow: "none",
                  receivedDocs: 0,
                  flag: null,
                  next: "Ready for initial review.",
                });
                setDraft(null);
                setNote("");
              }}
            >
              Import into pipeline
            </button>
          </section>
        ) : null}
        <p className="text-[1.05rem]">{fundingDisclaimer}</p>
      </div>
      <aside className="grid content-start gap-4">
        <section className="rounded-[6px] bg-ink p-4 text-ivory">
          <p className="text-[1.2rem]">Every deal gets a next step.</p>
          <p className="mt-2 text-[1rem] text-ivory/75">The draft stays on this screen until you refresh.</p>
        </section>
        <section className={card} data-testid="lender-match">
          <p className={fieldLabel}>Your list, preliminary</p>
          <ul className="mt-3 grid gap-2">
            {preview.map((item) => (
              <li key={item.programName} className="text-[1rem]">{item.sourceName}. {item.programName}</li>
            ))}
          </ul>
          <p className="mt-3 text-[0.95rem] text-ink/70">{matchNote}</p>
        </section>
      </aside>
    </div>
  );
}

export function Pipeline({ view }: { view: "list" | "board" }) {
  const { deals } = useDesk();
  const [outcome, setOutcome] = useState<Outcome>("active");
  const [text, setText] = useState("");
  const [stage, setStage] = useState<StageId | "all">("all");
  const rows = useMemo(() => {
    return visibleDeals(deals, outcome).filter((deal) => {
      const hay = `${deal.title} ${deal.borrowerName} ${deal.address}`.toLowerCase();
      if (text && !hay.includes(text.toLowerCase())) return false;
      if (stage !== "all" && deal.stageId !== stage) return false;
      return true;
    });
  }, [deals, outcome, stage, text]);
  const activeVolume = deals.filter((deal) => deal.outcome === "active").reduce((sum, deal) => sum + deal.amount, 0);
  return (
    <div className="grid gap-8">
      <ScreenHead
        testId="lending-pipeline"
        eyebrow="Lending pack"
        title="Pipeline"
        lede="Track each sample file from intake to a funded outcome. Nothing here is a forecast."
        actions={
          <>
            <Link className={primary} href="/desk/drop">Drop a deal</Link>
            <Link className={quiet} href="/desk/entry">Manual entry</Link>
            <Link className={quiet} href="/desk/lead">Other lead</Link>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Active volume" value={money(activeVolume)} note="Sample total. Not a forecast." />
        <Metric label="In review" value={String(deals.filter((deal) => deal.stageId === "in_review").length)} note="Sample count." />
        <Metric label="Funded volume" value={money(deals.filter((deal) => deal.outcome === "funded").reduce((sum, deal) => sum + deal.amount, 0))} note="Sample total. Not a result." />
        <Metric label="Your fee record" value="Not configured" note={feeNote} />
      </div>
      <div className="flex flex-wrap gap-2">
        {(["active", "funded", "closed"] as const).map((item) => (
          <button key={item} type="button" className={outcome === item ? primary : quiet} onClick={() => setOutcome(item)}>
            {item === "active" ? "Active" : item === "funded" ? "Funded" : "Closed"} ({visibleDeals(deals, item).length})
          </button>
        ))}
        <Link className={view === "list" ? primary : quiet} href="/desk/pipeline">List</Link>
        <Link className={view === "board" ? primary : quiet} href="/desk/pipeline/board">Board</Link>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className={textInput} value={text} onChange={(event) => setText(event.target.value)} aria-label="Search files" />
        <select className={textInput} value={stage} aria-label="Stage" onChange={(event) => setStage(event.target.value as StageId | "all")}>
          <option value="all">All stages</option>
          {lendingStages.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>
      <p className="text-[1rem] text-ink/70">Showing {rows.length} of {visibleDeals(deals, outcome).length}. Sample data.</p>
      {view === "list" ? <DealList rows={rows} /> : <DealBoard rows={outcome === "active" ? rows : rows} />}
      <DeskDisclaimer />
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className={card}>
      <p className={fieldLabel}>{label}</p>
      <p className="mt-3 text-[1.6rem] leading-none tracking-[-0.04em]">{value}</p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/65">{note}</p>
    </article>
  );
}

function DealList({ rows }: { rows: Deal[] }) {
  if (!rows.length) return <p className="text-[1.125rem]">No sample files in this view.</p>;
  return (
    <ul className="grid gap-2">
      {rows.map((deal) => (
        <li key={deal.id}>
          <Link href={`/desk/deals/${deal.id}`} className="grid min-h-16 gap-1 rounded-[6px] border border-line-light bg-white px-4 py-3 hover:border-gold-dark md:grid-cols-[1.4fr_0.6fr_0.6fr]">
            <span>
              <span className="block text-[1.125rem]">{deal.title}</span>
              <span className="text-[1rem] text-ink/70">{deal.borrowerName}. {deal.address}</span>
            </span>
            <span className="text-[1.05rem]">{money(deal.amount)}</span>
            <span className="text-[1.05rem]">{stageLabel(deal.stageId)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DealBoard({ rows }: { rows: Deal[] }) {
  const { setStage } = useDesk();
  const [pending, setPending] = useState<{ id: string; stageId: StageId } | null>(null);
  return (
    <div className="grid gap-4">
      {pending ? (
        <div className={card} role="dialog" aria-label="Confirm stage">
          <p className="text-[1.125rem]">Move this file to {stageLabel(pending.stageId)}? This stays on this screen. Nothing is sent.</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className={primary} onClick={() => { setStage(pending.id, pending.stageId); setPending(null); }}>Confirm</button>
            <button type="button" className={quiet} onClick={() => setPending(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {lendingStages.map((stage) => (
          <section key={stage.id} className="min-w-[240px] flex-1 rounded-[6px] border border-line-light bg-ivory/60 p-3">
            <p className={fieldLabel}>{stage.label} ({rows.filter((deal) => deal.stageId === stage.id).length})</p>
            <ul className="mt-3 grid gap-2">
              {rows.filter((deal) => deal.stageId === stage.id).map((deal) => (
                <li key={deal.id} className="rounded-[6px] border border-line-light bg-paper p-3">
                  <p className="text-[1.05rem]">{deal.borrowerName}</p>
                  <p className="text-[0.95rem] text-ink/70">{deal.address}</p>
                  <p className="mt-1 text-[1rem]">{money(deal.amount)}</p>
                  <Link className="mt-2 inline-flex min-h-11 items-center text-[1rem] font-medium underline" href={`/desk/deals/${deal.id}`}>Open deal</Link>
                  <label className="mt-2 grid gap-1">
                    <span className="sr-only">Move {deal.title}</span>
                    <select
                      className="min-h-12 rounded-[6px] border border-line-light bg-white px-2 text-[1rem]"
                      value={deal.stageId}
                      onChange={(event) => setPending({ id: deal.id, stageId: event.target.value as StageId })}
                    >
                      {lendingStages.map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ManualEntry() {
  return (
    <EntryForm
      testId="lending-entry"
      title="Manual entry"
      lede="A plain form for a file you already know. Nothing is sent."
      fields={["Borrower", "Amount", "Purchase price", "Product", "Notes"]}
    />
  );
}

export function LeadEntry() {
  return (
    <EntryForm
      testId="lending-lead"
      title="Other lead"
      lede="A short lead you have not matched to a file. Nothing is sent."
      fields={["Name", "Email", "Phone", "City", "Project", "Address", "Notes"]}
    />
  );
}

function EntryForm({ testId, title, lede, fields }: { testId: string; title: string; lede: string; fields: string[] }) {
  const { addDeal, deals } = useDesk();
  const [done, setDone] = useState(false);
  return (
    <form
      className="mx-auto grid w-full max-w-xl gap-4"
      data-testid={testId}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        addDeal({
          ...deals[0],
          id: `entry_${deals.length + 1}`,
          title: String(data.get(fields[0]) || "Sample entry"),
          borrowerName: String(data.get(fields[0]) || "Sample Borrower"),
          stageId: "submitted",
          outcome: "active",
          sourceId: null,
          follow: "none",
          receivedDocs: 0,
        });
        setDone(true);
      }}
    >
      <ScreenHead testId={`${testId}-head`} eyebrow="Lending pack" title={title} lede={lede} />
      {fields.map((field) => (
        <label key={field} className="grid gap-2">
          <span className={fieldLabel}>{field}</span>
          {field === "Notes" ? (
            <textarea name={field} className={`${textInput} min-h-28 py-3`} />
          ) : (
            <input name={field} className={textInput} />
          )}
        </label>
      ))}
      <SubmitButton type="submit" className="min-h-14 text-[1rem]">Save on this screen</SubmitButton>
      {done ? <Notice tone="success" title="Ready">Noted on this screen. Nothing was sent.</Notice> : null}
      <p className="text-[1rem] text-ink/70">{feeNote}</p>
    </form>
  );
}

export function DealDetail({ id }: { id: string }) {
  const desk = useDesk();
  const deal = desk.deals.find((item) => item.id === id);
  const [pending, setPending] = useState<StageId | null>(null);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  if (!deal) return <p className="text-[1.125rem]">That sample file is not on this screen.</p>;
  const ratio = ltv(deal);
  const source = desk.sources.find((item) => item.id === deal.sourceId);
  return (
    <div className="grid gap-6" data-testid="lending-deal">
      <Link href="/desk/pipeline" className="min-h-11 text-[1rem] font-medium">Back to pipeline</Link>
      <section className="rounded-[6px] bg-ink p-6 text-ivory">
        <p className={fieldLabel}>Deal</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">{deal.borrowerName}</h1>
        <p className="mt-3 text-[1.125rem] text-ivory/80">{deal.address}, {deal.city}</p>
        <p className="mt-4 text-[1.05rem]">{stageLabel(deal.stageId)}. {deal.product}. {money(deal.amount)}</p>
      </section>
      <div className="flex flex-wrap gap-2">
        <Link className={quiet} href={`/desk/files/${deal.id}`}>Review file</Link>
        <Link className={quiet} href="/desk/request">Request documents</Link>
        <Link className={primary} href={`/desk/deals/${deal.id}/match`}>Compare your list</Link>
        <button type="button" className={quiet} onClick={() => desk.cloneDeal(deal.id)}>Clone</button>
        <button type="button" className={quiet} onClick={() => desk.removeDeal(deal.id)}>Remove</button>
      </div>
      <section className={card}>
        <h2 className="text-[1.4rem]">Readiness</h2>
        <p className="mt-2 text-[1.125rem]">{deal.receivedDocs} of {deal.totalDocs} sample document types noted.</p>
        <p className="mt-2 text-[1rem] text-ink/70">{deal.next} Nothing is submitted from this panel.</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
        <section className={card}>
          <h2 className="text-[1.4rem]">Facts</h2>
          <label className="mt-4 grid gap-2">
            <span className={fieldLabel}>Stage</span>
            <select className={textInput} value={pending ?? deal.stageId} onChange={(event) => setPending(event.target.value as StageId)}>
              {lendingStages.map((stage) => (
                <option key={stage.id} value={stage.id}>{stage.label}</option>
              ))}
            </select>
          </label>
          {pending && pending !== deal.stageId ? (
            <div className="mt-3 flex gap-2">
              <button type="button" className={primary} onClick={() => { desk.setStage(deal.id, pending); setPending(null); }}>Confirm stage</button>
              <button type="button" className={quiet} onClick={() => setPending(null)}>Cancel</button>
            </div>
          ) : null}
          <dl className="mt-4 grid gap-3 text-[1.05rem]">
            <div className="border-t border-line-light pt-3"><dt className={fieldLabel}>Loan amount</dt><dd>{money(deal.amount)}</dd></div>
            <div className="border-t border-line-light pt-3"><dt className={fieldLabel}>Purchase</dt><dd>{money(deal.purchase)}</dd></div>
            <div className="border-t border-line-light pt-3"><dt className={fieldLabel}>Leverage</dt><dd>{ratio === null ? "Not enough to compute" : `${ratio} percent. Sample only.`}</dd></div>
            <div className="border-t border-line-light pt-3"><dt className={fieldLabel}>Your fee record</dt><dd>{deal.feePercent} percent. {feeNote}</dd></div>
          </dl>
          <label className="mt-4 grid gap-2">
            <span className={fieldLabel}>Note</span>
            <textarea className={`${textInput} min-h-24 py-3`} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button type="button" className={cn(primary, "mt-3")} onClick={() => { desk.addNote(deal.id, note); setNote(""); }}>Save note</button>
          <ul className="mt-4 grid gap-2">
            {(desk.notes[deal.id] ?? []).map((item) => (
              <li key={item} className="text-[1rem]">{item}</li>
            ))}
          </ul>
        </section>
        <div className="grid content-start gap-4">
          <section className={card}>
            <h2 className="text-[1.3rem]">Follow up</h2>
            <p className="mt-2 text-[1.05rem]">{deal.follow === "due" ? "Due on this sample." : deal.follow === "scheduled" ? "Scheduled on this sample." : "No reminder."}</p>
            <Link className="mt-3 inline-flex min-h-11 items-center underline" href="/desk/follow">Open follow up</Link>
          </section>
          <section className={card} data-testid="lender-match">
            <h2 className="text-[1.3rem]">Working source</h2>
            <p className="mt-2 text-[1.05rem]">{source ? source.name : "None chosen"}</p>
            <p className="mt-2 text-[0.95rem] text-ink/70">Choosing a name does not contact anyone.</p>
            <Link className="mt-3 inline-flex min-h-11 items-center underline" href={`/desk/deals/${deal.id}/match`}>Compare your list</Link>
          </section>
          <section className={card}>
            <h2 className="text-[1.3rem]">Contact</h2>
            <p className="mt-2 text-[1rem] text-ink/70">A preview only. Nothing sends.</p>
            <button type="button" className={cn(quiet, "mt-3 w-full")} onClick={() => setPreview("Sample message. Nothing was sent.")}>Preview a note</button>
            {preview ? <p className="mt-3 text-[1rem]">{preview}</p> : null}
          </section>
        </div>
      </div>
      <section className={card}>
        <h2 className="text-[1.4rem]">Documents</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {docPhases.map((phase) => (
            <li key={phase.id}>
              <p className={fieldLabel}>{phase.label}</p>
              <p className="mt-1 text-[0.95rem] text-ink/65">{phase.help}</p>
              <ul className="mt-2 grid gap-1">
                {phase.items.map((item) => (
                  <li key={item} className="text-[1rem]">{item}. Waiting.</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[1rem] text-ink/70">New uploads remain labeled In review. Receipt is not approval.</p>
      </section>
      <section className={card}>
        <h2 className="text-[1.4rem]">Activity</h2>
        <ul className="mt-3 grid gap-2 text-[1.05rem]">
          <li>Sample file opened. Sample data.</li>
          <li>{deal.flag ?? "No new concerns on this sample."}</li>
          {(desk.notes[deal.id] ?? []).map((item) => (
            <li key={item}>Note. {item}</li>
          ))}
        </ul>
      </section>
      <p className="text-[1rem] text-ink/70">Property lookup is not connected. Signing is not in this preview.</p>
      <Link className="min-h-11 text-[1.05rem] underline" href="/desk/learning">What did this file teach us?</Link>
      <DeskDisclaimer />
    </div>
  );
}

export function MatchPage({ id }: { id: string }) {
  const { deals, sources } = useDesk();
  const deal = deals.find((item) => item.id === id) ?? deals[0];
  if (!deal) return null;
  const cards = matchSources(deal, sources);
  const strong = cards.filter((card) => card.group === "strong");
  const possible = cards.filter((card) => card.group === "possible");
  return (
    <div className="grid gap-6" data-testid="lending-match">
      <ScreenHead
        testId="lending-match-head"
        eyebrow="Lending pack"
        title="Your list match"
        lede={matchNote}
        actions={<Link className={quiet} href={`/desk/deals/${deal.id}`}>Back to deal</Link>}
      />
      <MatchGroup title="Strong on your criteria" cards={strong} />
      <MatchGroup title="Possible on your criteria" cards={possible} />
      <p data-testid="lender-match" className="sr-only">Your lender list</p>
      <DeskDisclaimer />
    </div>
  );
}

function MatchGroup({ title, cards }: { title: string; cards: ReturnType<typeof matchSources> }) {
  if (!cards.length) return <p className="text-[1.05rem]">{title}. None on this sample.</p>;
  return (
    <section className="grid gap-3">
      <h2 className="text-[1.5rem]">{title} ({cards.length})</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {cards.map((item) => (
          <li key={`${item.sourceId}-${item.programName}`} className={card}>
            <p className="text-[1.25rem]">{item.sourceName}</p>
            <p className="mt-1 text-[1rem] text-ink/70">{item.programName}</p>
            <ul className="mt-3 grid gap-1">
              {item.reasons.map((reason) => (
                <li key={reason.text} className="text-[1rem]">{reason.ok ? "Pass" : "Fail"}. {reason.text}</li>
              ))}
            </ul>
            <Link className="mt-3 inline-flex min-h-11 items-center underline" href={`/desk/lenders/${item.sourceId}`}>Open source</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FollowInbox() {
  const { deals } = useDesk();
  const [bucket, setBucket] = useState<"due" | "scheduled" | "none" | "all">("due");
  const rows = deals.filter((deal) => deal.outcome === "active" && (bucket === "all" || deal.follow === bucket));
  return (
    <div className="grid gap-6">
      <ScreenHead testId="lending-follow" eyebrow="Lending pack" title="Follow up" lede="Reminders stay on this screen. Nothing is sent." />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {(["due", "scheduled", "none", "all"] as const).map((item) => (
          <button key={item} type="button" className={bucket === item ? primary : quiet} onClick={() => setBucket(item)}>
            {item === "due" ? "Due now" : item === "scheduled" ? "Scheduled" : item === "none" ? "No reminder" : "All active"}
          </button>
        ))}
      </div>
      <ul className="grid gap-2">
        {rows.map((deal) => (
          <li key={deal.id} className={cn(card, "grid gap-2 md:grid-cols-[1fr_auto]")}>
            <div>
              <p className="text-[1.125rem]">{deal.title}</p>
              <p className="text-[1rem] text-ink/70">{deal.borrowerName}. {money(deal.amount)}. {stageLabel(deal.stageId)}</p>
            </div>
            <Link className={quiet} href={`/desk/deals/${deal.id}`}>{deal.follow === "none" ? "Set reminder" : "Open follow up"}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FileRoom() {
  const { deals } = useDesk();
  const [tab, setTab] = useState("Active");
  const tabs = ["Active", "Awaiting", "Partly received", "Review needed", "All"];
  const rows = deals.filter((deal) => {
    if (tab === "All" || tab === "Active") return deal.outcome !== "closed";
    if (tab === "Awaiting") return deal.receivedDocs === 0;
    if (tab === "Partly received") return deal.receivedDocs > 0 && deal.receivedDocs < deal.totalDocs;
    return deal.receivedDocs === deal.totalDocs;
  });
  return (
    <div className="grid gap-6">
      <ScreenHead testId="lending-files" eyebrow="Lending pack" title="Files" lede="Every sample document in its place. Received does not mean approved." />
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} type="button" className={tab === item ? primary : quiet} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      <ul className="grid gap-2">
        {rows.map((deal) => (
          <li key={deal.id} className={cn(card, "grid gap-2 md:grid-cols-[1fr_auto] md:items-center")}>
            <div>
              <p className="text-[1.125rem]">{deal.title}</p>
              <p className="text-[1rem] text-ink/70">{deal.borrowerName}. {deal.receivedDocs} of {deal.totalDocs} noted.</p>
            </div>
            <Link className={quiet} href={`/desk/files/${deal.id}`}>Open file</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FileDetail({ id }: { id: string }) {
  const { deals } = useDesk();
  const deal = deals.find((item) => item.id === id);
  const [receipt, setReceipt] = useState<string | null>(null);
  if (!deal) return <p>That sample file is not on this screen.</p>;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]" data-testid="lending-file">
      <div className="grid gap-4">
        <ScreenHead testId="lending-file-head" eyebrow="Lending pack" title={deal.title} lede="Checklist and sample uploads. Nothing is stored." />
        {docPhases.map((phase) => (
          <section key={phase.id} className={card}>
            <h2 className="text-[1.3rem]">{phase.label}</h2>
            <p className="mt-1 text-[1rem] text-ink/70">{phase.help}</p>
            <ul className="mt-3 grid gap-2">
              {phase.items.map((item, index) => (
                <li key={item} className="flex min-h-12 items-center justify-between gap-3 border-t border-line-light pt-2">
                  <span>{item}</span>
                  <span className={fieldLabel}>{index < deal.receivedDocs ? "Noted" : "Waiting"}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <aside className="grid content-start gap-4">
        <section className={card}>
          <h2 className="text-[1.3rem]">Add a file name</h2>
          <input
            type="file"
            className="mt-3 block min-h-12 w-full text-[1rem]"
            onChange={(event) => {
              const name = event.target.files?.[0]?.name;
              setReceipt(name ? `${name} noted on this screen. Nothing was uploaded.` : null);
            }}
          />
          {receipt ? <p className="mt-3 text-[1rem]">{receipt}</p> : null}
        </section>
        <Link className={primary} href="/desk/request">Request documents</Link>
        <p className="text-[1rem] text-ink/70">A request preview does not send.</p>
      </aside>
    </div>
  );
}

export function RequestDocs() {
  const { deals } = useDesk();
  const [ready, setReady] = useState(false);
  return (
    <form
      className="mx-auto grid w-full max-w-xl gap-4"
      data-testid="lending-request"
      onSubmit={(event) => {
        event.preventDefault();
        setReady(true);
      }}
    >
      <ScreenHead testId="lending-request-head" eyebrow="Lending pack" title="Document request" lede="Build a preview. Nothing sends until a later release, and not from this button." />
      <label className="grid gap-2">
        <span className={fieldLabel}>Deal</span>
        <select name="deal" className={textInput}>
          {deals.map((deal) => (
            <option key={deal.id}>{deal.title}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2"><span className={fieldLabel}>Request name</span><input name="name" className={textInput} defaultValue="Sample document request" /></label>
      <label className="grid gap-2"><span className={fieldLabel}>Note</span><textarea name="note" className={`${textInput} min-h-24 py-3`} defaultValue="Please add the sample records." /></label>
      <label className="flex min-h-14 items-start gap-3 rounded-[6px] border border-line-light p-4">
        <input type="checkbox" required className="mt-1 size-5" />
        <span>This preview was reviewed. It will not be sent.</span>
      </label>
      <SubmitButton type="submit" className="min-h-14">Record the preview</SubmitButton>
      {ready ? <Notice tone="success" title="Ready">Preview recorded on this screen. Nothing was sent.</Notice> : null}
      <DeskDisclaimer />
    </form>
  );
}
