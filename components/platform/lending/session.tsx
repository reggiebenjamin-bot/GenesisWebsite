"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  sampleBorrowers,
  sampleDeals,
  type Borrower,
  type Deal,
  type Source,
  type StageId,
} from "@/lib/platform/lending/model";
import { sampleSources } from "@/lib/platform/lending/sources";

type DeskApi = {
  deals: Deal[];
  borrowers: Borrower[];
  sources: Source[];
  notice: string | null;
  clearNotice: () => void;
  setStage: (id: string, stageId: StageId) => void;
  addDeal: (deal: Deal) => void;
  addNote: (id: string, note: string) => void;
  notes: Record<string, string[]>;
  addSource: (source: Source) => void;
  addBorrower: (borrower: Borrower) => void;
  removeDeal: (id: string) => void;
  cloneDeal: (id: string) => string | null;
};

const DeskContext = createContext<DeskApi | null>(null);

export function DeskProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(sampleDeals);
  const [borrowers, setBorrowers] = useState<Borrower[]>(sampleBorrowers);
  const [sources, setSources] = useState<Source[]>(sampleSources);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const api = useMemo<DeskApi>(
    () => ({
      deals,
      borrowers,
      sources,
      notice,
      notes,
      clearNotice: () => setNotice(null),
      setStage: (id, stageId) => {
        setDeals((current) =>
          current.map((deal) =>
            deal.id === id
              ? {
                  ...deal,
                  stageId,
                  outcome: stageId === "funded" ? "funded" : deal.outcome === "funded" ? "active" : deal.outcome,
                }
              : deal,
          ),
        );
        setNotice("Stage updated on this screen. Nothing was sent.");
      },
      addDeal: (deal) => {
        setDeals((current) => [deal, ...current]);
        setNotice("Review draft added on this screen. Nothing was sent.");
      },
      addNote: (id, note) => {
        const text = note.trim();
        if (!text) return;
        setNotes((current) => ({ ...current, [id]: [...(current[id] ?? []), text] }));
        setNotice("Note kept on this screen. Nothing was sent.");
      },
      addSource: (source) => {
        setSources((current) => [...current, source]);
        setNotice("Source kept on this screen. Genesis did not add a list.");
      },
      addBorrower: (borrower) => {
        setBorrowers((current) => [...current, borrower]);
        setNotice("Borrower kept on this screen. Nothing was sent.");
      },
      removeDeal: (id) => {
        setDeals((current) => current.filter((deal) => deal.id !== id));
        setNotice("Deal removed on this screen. Nothing was sent.");
      },
      cloneDeal: (id) => {
        const deal = deals.find((item) => item.id === id);
        if (!deal) return null;
        const copyId = `${id}_copy`;
        setDeals((current) => [
          {
            ...deal,
            id: copyId,
            title: `Copy of ${deal.title}`,
            stageId: "submitted",
            outcome: "active",
            sourceId: null,
            follow: "none",
          },
          ...current,
        ]);
        setNotice("Copy started at Submitted. Nothing was sent.");
        return copyId;
      },
    }),
    [borrowers, deals, notice, notes, sources],
  );

  return <DeskContext.Provider value={api}>{children}</DeskContext.Provider>;
}

export function useDesk(): DeskApi {
  const value = useContext(DeskContext);
  if (!value) throw new Error("Lending desk session is missing");
  return value;
}
