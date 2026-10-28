"use client";

import Link from "next/link";
import { useState } from "react";
import { SubmitButton } from "@/components/ui/Button";
import { feeNote, money } from "@/lib/platform/lending/model";
import { Notice, fieldLabel, textInput } from "../Chrome";
import { DeskDisclaimer, ScreenHead } from "./Shell";
import { useDesk } from "./session";

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-[6px] border border-gold-light bg-gold-light px-4 text-[1rem] font-bold text-ink";
const card = "rounded-[6px] border border-line-light bg-white/70 p-4";

export function LenderList() {
  const { sources, deals } = useDesk();
  const [text, setText] = useState("");
  const rows = sources.filter((source) => source.name.toLowerCase().includes(text.toLowerCase()));
  return (
    <div className="grid gap-6">
      <ScreenHead
        testId="lending-lenders"
        eyebrow="Lending pack"
        title="Your lender list"
        lede="Names you keep. Genesis does not supply, rank, or preload a list."
        actions={<Link className={primary} href="/desk/lenders/new">Add a source</Link>}
      />
      <input className={textInput} value={text} aria-label="Search your list" onChange={(event) => setText(event.target.value)} />
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((source) => (
          <li key={source.id} className={card}>
            <p className="text-[1.35rem]">{source.name}</p>
            <p className="mt-2 text-[1rem] text-ink/70">{source.contact}</p>
            <p className="mt-2 text-[1rem]">
              {deals.filter((deal) => deal.sourceId === source.id).length} sample files
            </p>
            <ul className="mt-3 grid gap-1">
              {source.programs.map((program) => (
                <li key={program.id} className="text-[0.95rem] text-ink/75">
                  {program.name}. {money(program.minLoan)} to {money(program.maxLoan)}.
                </li>
              ))}
            </ul>
            <Link className="mt-4 inline-flex min-h-11 items-center underline" href={`/desk/lenders/${source.id}`}>Profile</Link>
          </li>
        ))}
      </ul>
      <p className="text-[1rem] leading-relaxed text-ink/70">Programs are records you enter. They are not an approval or a promise of terms.</p>
      <DeskDisclaimer />
    </div>
  );
}

export function LenderProfile({ id }: { id: string }) {
  const { sources } = useDesk();
  const source = sources.find((item) => item.id === id);
  if (!source) return <p className="text-[1.125rem]">That source is not on this screen.</p>;
  return (
    <div className="grid gap-6" data-testid="lending-lender">
      <section className="rounded-[6px] bg-ink p-6 text-ivory">
        <p className={fieldLabel}>Your list</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none">{source.name}</h1>
        <p className="mt-3 text-[1.05rem] text-ivory/75">Sample data. Not a partner of Genesis.</p>
      </section>
      <section className={card}>
        <h2 className="text-[1.4rem]">Contact</h2>
        <p className="mt-2 text-[1.125rem]">{source.contact}</p>
      </section>
      <section className={card}>
        <h2 className="text-[1.4rem]">Criteria you saved</h2>
        <ul className="mt-4 grid gap-3">
          {source.programs.map((program) => (
            <li key={program.id} className="border-t border-line-light pt-3">
              <p className="text-[1.125rem]">{program.name}</p>
              <p className="mt-1 text-[1rem] text-ink/75">
                {program.product}. {money(program.minLoan)} to {money(program.maxLoan)}. Maximum leverage {program.maxLtv} percent. Credit minimum {program.minCredit}.
              </p>
              <p className="mt-1 text-[1rem]">{program.notes}</p>
            </li>
          ))}
        </ul>
      </section>
      <DeskDisclaimer />
    </div>
  );
}

export function AddLender() {
  const { addSource, sources } = useDesk();
  const [done, setDone] = useState(false);
  return (
    <form
      className="mx-auto grid w-full max-w-xl gap-4"
      data-testid="lending-lender-new"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") || "Sample source");
        addSource({
          id: `source_${sources.length + 1}`,
          name,
          contact: "Sample contact",
          programs: [
            {
              id: `program_${sources.length + 1}`,
              name: "Sample program",
              product: String(data.get("product") || "Bridge"),
              minLoan: 100000,
              maxLoan: 500000,
              maxLtv: 75,
              minCredit: 680,
              notes: "Sample criteria. Not a promise of terms.",
            },
          ],
        });
        setDone(true);
      }}
    >
      <ScreenHead testId="lending-lender-new-head" eyebrow="Lending pack" title="Add a source" lede="This name stays on your list. Genesis does not store it." />
      <label className="grid gap-2"><span className={fieldLabel}>Name</span><input name="name" className={textInput} /></label>
      <label className="grid gap-2">
        <span className={fieldLabel}>Product</span>
        <select name="product" className={textInput}>
          {["Bridge", "Purchase", "Refinance", "Construction"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <SubmitButton type="submit" className="min-h-14">Save on this screen</SubmitButton>
      {done ? <Notice tone="success" title="Ready">Saved on this screen. Nothing was sent.</Notice> : null}
      <DeskDisclaimer />
    </form>
  );
}

export function BorrowerList() {
  const { borrowers, deals } = useDesk();
  const [text, setText] = useState("");
  const rows = borrowers.filter((borrower) => `${borrower.name} ${borrower.city}`.toLowerCase().includes(text.toLowerCase()));
  const volume = deals.reduce((sum, deal) => sum + deal.amount, 0);
  return (
    <div className="grid gap-6">
      <ScreenHead
        testId="lending-borrowers"
        eyebrow="Lending pack"
        title="Borrowers"
        lede="Sample people only. No live contacts."
        actions={<Link className={primary} href="/desk/borrowers/new">New borrower</Link>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Showing" value={String(rows.length)} />
        <Stat label="Deals" value={String(deals.length)} />
        <Stat label="Volume" value={money(volume)} />
        <Stat label="Verified" value={String(borrowers.filter((item) => item.verified).length)} />
      </div>
      <input className={textInput} value={text} aria-label="Search borrowers" onChange={(event) => setText(event.target.value)} />
      <ul className="grid gap-2">
        {rows.map((borrower) => (
          <li key={borrower.id}>
            <Link href={`/desk/borrowers/${borrower.id}`} className="grid min-h-16 gap-1 rounded-[6px] border border-line-light px-4 py-3 hover:border-gold-dark md:grid-cols-4">
              <span className="text-[1.125rem]">{borrower.name}</span>
              <span>{borrower.kind}</span>
              <span>{borrower.city}</span>
              <span>{borrower.verified ? "Verified sample" : "Not verified"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className={card}>
      <p className={fieldLabel}>{label}</p>
      <p className="mt-2 text-[1.4rem]">{value}</p>
    </article>
  );
}

export function BorrowerProfile({ id }: { id: string }) {
  const { borrowers, deals } = useDesk();
  const borrower = borrowers.find((item) => item.id === id);
  if (!borrower) return <p>That sample borrower is not on this screen.</p>;
  const files = deals.filter((deal) => deal.borrowerId === borrower.id);
  return (
    <div className="grid gap-6" data-testid="lending-borrower">
      <section className="rounded-[6px] bg-ink p-6 text-ivory">
        <p className={fieldLabel}>Borrower</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none">{borrower.entity}</h1>
        <p className="mt-3 text-ivory/80">{borrower.name}. {borrower.city}. Sample data.</p>
      </section>
      <section className={card}>
        <h2 className="text-[1.4rem]">Contact</h2>
        <p className="mt-2 text-[1.125rem]">{borrower.email}</p>
        <p className="text-[1.125rem]">{borrower.phone}</p>
        <p className="mt-2 text-[1rem] text-ink/70">Verification is a sample flag. It is not a background check.</p>
      </section>
      <section className={card}>
        <h2 className="text-[1.4rem]">Deals</h2>
        <ul className="mt-3 grid gap-2">
          {files.map((deal) => (
            <li key={deal.id}>
              <Link className="text-[1.05rem] underline" href={`/desk/deals/${deal.id}`}>{deal.title}</Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-[1rem] text-ink/70">Term sheets stay on your list. This profile does not place a file.</p>
      <DeskDisclaimer />
    </div>
  );
}

export function NewBorrower() {
  const { addBorrower, borrowers } = useDesk();
  const [done, setDone] = useState(false);
  return (
    <form
      className="mx-auto grid max-w-xl gap-4"
      data-testid="lending-borrower-new"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        addBorrower({
          id: `borrower_${borrowers.length + 1}`,
          name: String(data.get("name") || "Sample Borrower"),
          entity: String(data.get("entity") || "Sample Holdings"),
          email: String(data.get("email") || "borrower@example.com"),
          phone: "555 0102",
          city: String(data.get("city") || "Sample City"),
          state: "TX",
          kind: "Entity",
          verified: false,
        });
        setDone(true);
      }}
    >
      <ScreenHead testId="lending-borrower-new-head" eyebrow="Lending pack" title="New borrower" lede="Kept on this screen only." />
      {["Name", "Entity", "Email", "City"].map((field) => (
        <label key={field} className="grid gap-2">
          <span className={fieldLabel}>{field}</span>
          <input name={field.toLowerCase()} className={textInput} />
        </label>
      ))}
      <SubmitButton type="submit" className="min-h-14">Save on this screen</SubmitButton>
      {done ? <Notice tone="success" title="Ready">Noted on this screen. Nothing was sent.</Notice> : null}
    </form>
  );
}

export function Learning() {
  const [done, setDone] = useState(false);
  return (
    <form
      className="mx-auto grid max-w-xl gap-4"
      data-testid="lending-learning"
      onSubmit={(event) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <ScreenHead
        testId="lending-learning-head"
        eyebrow="Lending pack"
        title="What did this file teach us?"
        lede="A note for your desk. It does not change a stage or contact anyone."
      />
      <label className="grid gap-2"><span className={fieldLabel}>What happened</span><textarea required name="what" className={`${textInput} min-h-28 py-3`} /></label>
      <label className="grid gap-2"><span className={fieldLabel}>Evidence on this screen</span><input required name="evidence" className={textInput} /></label>
      <label className="flex min-h-14 items-start gap-3 rounded-[6px] border border-line-light p-4">
        <input type="checkbox" required className="mt-1 size-5" />
        <span>This note is a sample lesson, not a result.</span>
      </label>
      <SubmitButton type="submit" className="min-h-14">Keep the note here</SubmitButton>
      {done ? <Notice tone="success" title="Ready">Kept on this screen. Nothing was stored.</Notice> : null}
      <p className="text-[1rem] text-ink/70">{feeNote}</p>
    </form>
  );
}
