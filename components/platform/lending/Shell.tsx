"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { fundingDisclaimer } from "@/lib/platform/copy";
import { cn } from "@/lib/utils";
import { FundingDisclaimer, SampleMark, fieldLabel } from "../Chrome";
import { useDesk } from "./session";

const links = [
  { href: "/desk", label: "Submission desk", group: "Desk" },
  { href: "/desk/drop", label: "Drop a deal", group: "Desk" },
  { href: "/desk/pipeline", label: "Pipeline", group: "Desk" },
  { href: "/desk/follow", label: "Follow up", group: "Desk" },
  { href: "/desk/files", label: "Files", group: "Desk" },
  { href: "/desk/lenders", label: "Your lender list", group: "People" },
  { href: "/desk/borrowers", label: "Borrowers", group: "People" },
  { href: "/desk/learning", label: "Learning", group: "People" },
  { href: "/desk/portal", label: "Borrower view", group: "People" },
] as const;

export function LendingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { deals, borrowers, sources, notice, clearNotice } = useDesk();
  const found = query.trim().length >= 2 ? searchHits(query, deals, borrowers, sources) : [];

  return (
    <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line-dark bg-ink text-ivory md:flex md:min-h-dvh md:flex-col md:gap-6 md:p-6">
        <Logo light />
        <Nav pathname={pathname} />
        <p className="mt-auto text-[0.95rem] leading-relaxed text-ivory/65">Lending pack. Dry run.</p>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line-dark bg-ink px-4 py-3 text-ivory md:border-line-light md:bg-paper md:px-8 md:text-ink">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-[6px] border border-ivory/30 text-ivory"
              aria-expanded={open}
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
            <Logo light />
          </div>
          <button
            type="button"
            className="ml-auto min-h-12 rounded-[6px] border border-ivory/30 px-4 text-[1rem] text-ivory md:border-line-light md:text-ink"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </button>
        </header>
        {notice ? (
          <div className="border-b border-gold-dark/30 bg-ivory px-4 py-3 md:px-8" role="status">
            <p className="text-[1.05rem]">{notice}</p>
            <button type="button" className="mt-2 min-h-11 text-[1rem] font-medium underline" onClick={clearNotice}>
              Dismiss
            </button>
          </div>
        ) : null}
        <main id="main-content" className="px-4 py-8 pb-28 md:px-8 md:pb-16">
          {children}
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line-dark bg-ink text-ivory md:hidden">
        {[
          ["/desk", "Desk"],
          ["/desk/pipeline", "Pipeline"],
          ["/desk/follow", "Follow up"],
          ["/desk/files", "Files"],
        ].map(([href, label]) => {
          const active = href === "/desk" ? pathname === "/desk" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center justify-center border-t-2 px-1 text-center text-[0.75rem]",
                active ? "border-gold-light text-gold-light" : "border-transparent text-ivory/75",
              )}
            >
              {label}
            </Link>
          );
        })}
        <button type="button" className="min-h-14 text-[0.75rem] text-ivory/75" onClick={() => setOpen(true)}>
          More
        </button>
      </nav>
      {open ? (
        <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="flex h-full w-[min(100%,320px)] flex-col gap-6 overflow-y-auto bg-ink p-6 text-ivory"
            role="dialog"
            aria-label="Menu"
            onClick={(event) => event.stopPropagation()}
          >
            <Logo light />
            <button type="button" className="min-h-12 self-start text-[1rem] font-medium text-ivory" onClick={() => setOpen(false)}>
              Close
            </button>
            <div onClick={() => setOpen(false)}>
              <Nav pathname={pathname} />
            </div>
          </div>
        </div>
      ) : null}
      {searchOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-start bg-ink/40 px-4 pt-16" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-xl rounded-[6px] border border-line-light bg-paper p-4"
            role="dialog"
            aria-label="Search"
            onClick={(event) => event.stopPropagation()}
          >
            <label className="grid gap-2">
              <span className={fieldLabel}>Search deals, borrowers, sources</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-14 w-full rounded-[6px] border border-line-light px-4 text-[1.125rem]"
              />
            </label>
            <ul className="mt-4 grid gap-2">
              {query.trim().length < 2 ? (
                <li className="text-[1rem] text-ink/70">Type at least 2 characters. Sample data.</li>
              ) : found.length === 0 ? (
                <li className="text-[1rem] text-ink/70">No sample matches.</li>
              ) : (
                found.map((hit) => (
                  <li key={hit.href}>
                    <Link href={hit.href} className="block min-h-12 rounded-[6px] border border-line-light px-4 py-3" onClick={() => setSearchOpen(false)}>
                      <span className={fieldLabel}>{hit.kind}</span>
                      <span className="mt-1 block text-[1.05rem]">{hit.label}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/70">{fundingDisclaimer}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Nav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Lending pack" className="grid gap-1">
      {links.map((link, index) => {
        const showGroup = index === 0 || links[index - 1]?.group !== link.group;
        const active = link.href === "/desk"
          ? pathname === "/desk"
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <div key={link.href}>
            {showGroup ? <p className="px-4 pt-4 pb-2 font-display text-[0.69rem] tracking-[0.18em] text-ivory/50 uppercase">{link.group}</p> : null}
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center border-l-2 px-4 text-[1.05rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light",
                active ? "border-gold-light font-medium text-gold-light" : "border-transparent text-ivory/75 hover:text-ivory",
              )}
            >
              {link.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

function searchHits(
  query: string,
  deals: { id: string; title: string; borrowerName: string; address: string }[],
  borrowers: { id: string; name: string }[],
  sources: { id: string; name: string }[],
) {
  const needle = query.trim().toLowerCase();
  const hits: { href: string; kind: string; label: string }[] = [];
  for (const deal of deals) {
    if (`${deal.title} ${deal.borrowerName} ${deal.address}`.toLowerCase().includes(needle)) {
      hits.push({ href: `/desk/deals/${deal.id}`, kind: "Deal", label: deal.title });
    }
  }
  for (const borrower of borrowers) {
    if (borrower.name.toLowerCase().includes(needle)) {
      hits.push({ href: `/desk/borrowers/${borrower.id}`, kind: "Borrower", label: borrower.name });
    }
  }
  for (const source of sources) {
    if (source.name.toLowerCase().includes(needle)) {
      hits.push({ href: `/desk/lenders/${source.id}`, kind: "Your list", label: source.name });
    }
  }
  return hits.slice(0, 8);
}

export function ScreenHead({
  eyebrow,
  title,
  lede,
  actions,
  testId,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  actions?: React.ReactNode;
  testId: string;
}) {
  return (
    <div data-testid={testId} className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <SampleMark />
          <p className={cn(fieldLabel, "mt-4")}>{eyebrow}</p>
          <h1 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05] tracking-[-0.04em] text-balance">{title}</h1>
          <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">{lede}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function DeskDisclaimer() {
  return <FundingDisclaimer text={fundingDisclaimer} />;
}
