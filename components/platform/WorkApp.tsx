"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Button, SubmitButton } from "@/components/ui/Button";
import { getPack } from "@/packs";
import { buildClientConfig, validateSignup } from "@/lib/platform/config";
import { platformCopy } from "@/lib/platform/copy";
import { emptyDraft, type Draft } from "@/lib/platform/draft";
import {
  effectiveBrokerMode,
  lenderMatch,
  sectionTitle,
  setupChecklist,
  workSectionIds,
  type WorkSection,
} from "@/lib/platform/desk";
import { onboardingComplete, signupPayload } from "@/lib/platform/flow";
import { usePlatformDraft } from "./usePlatformDraft";
import { cn } from "@/lib/utils";
import { EmptyState, FundingDisclaimer, Notice, SampleMark, fieldLabel } from "./Chrome";

const work = platformCopy.work;

export function WorkApp({ section }: { section: WorkSection }) {
  const { hydrated, draft, save } = usePlatformDraft();
  const [sample, setSample] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-4" aria-busy="true">
        <Notice tone="loading" title={platformCopy.loading}>
          {platformCopy.loading}
        </Notice>
      </div>
    );
  }

  const pack = getPack(draft?.answers.vertical ?? "") ?? getPack(draft?.config?.vertical ?? "") ?? getPack("general");
  if (!pack) return null;
  const brokerMode = effectiveBrokerMode(pack, draft?.brokerModeOverride ?? null);
  const hasSetup = Boolean(draft?.config);

  function toggleBroker() {
    if (!draft || !draft.config || !pack || pack.id !== "lending") return;
    const nextMode = !brokerMode;
    const parsed = validateSignup(signupPayload(draft.answers));
    const config = parsed.ok
      ? buildClientConfig(parsed.value, draft.config.client_id, draft.answers.onboarding, nextMode)
      : { ...draft.config, broker_mode: nextMode };
    save({
      ...draft,
      brokerModeOverride: nextMode,
      config,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="min-h-dvh bg-paper text-ink md:grid md:grid-cols-[240px_minmax(0,1fr)]" data-testid="platform-work">
      <aside className="hidden border-r border-line-light md:flex md:min-h-dvh md:flex-col md:gap-8 md:p-6">
        <Logo />
        <DeskNav section={section} />
        <p className="mt-auto text-[1rem] text-ink/70">{platformCopy.dryRun}</p>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line-light bg-paper/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="min-w-0">
            <p className={fieldLabel}>{pack.label}</p>
            <h1 className="mt-2 truncate text-[1.75rem] leading-none tracking-[-0.04em]">{sectionTitle(section)}</h1>
          </div>
          {hasSetup ? (
            <button
              type="button"
              aria-pressed={sample}
              onClick={() => setSample((value) => !value)}
              className="min-h-12 shrink-0 rounded-[6px] border border-line-light px-4 text-[0.95rem] transition-colors duration-200 ease-editorial hover:border-gold-dark motion-reduce:transition-none"
            >
              {sample ? platformCopy.hideSample : platformCopy.showSample}
            </button>
          ) : null}
        </header>
        <main id="main-content" className="px-4 py-8 pb-28 md:px-8 md:pb-16" data-testid={`work-${section}`}>
          {!hasSetup ? (
            <div className="grid gap-4">
              {cleared ? (
                <Notice tone="success" title={platformCopy.ready}>
                  {platformCopy.cleared}
                </Notice>
              ) : null}
              <EmptyState
                title={work.emptyWorkspaceTitle}
                body={work.emptyWorkspaceBody}
                action={<Button href="/signup">{platformCopy.nav.signup}</Button>}
              />
            </div>
          ) : section === "overview" && draft?.config ? (
            <Overview draft={draft} packId={pack.id} sample={sample} brokerMode={brokerMode} />
          ) : section === "leads" ? (
            <LeadList packId={pack.id} sample={sample} />
          ) : section === "inbox" ? (
            <Inbox packId={pack.id} sample={sample} />
          ) : section === "approvals" ? (
            <Approvals packId={pack.id} sample={sample} />
          ) : (
            <Settings
              draft={draft ?? emptyDraft()}
              brokerMode={brokerMode}
              confirmClear={confirmClear}
              cleared={cleared}
              onToggleBroker={toggleBroker}
              onAskClear={() => setConfirmClear(true)}
              onCancelClear={() => setConfirmClear(false)}
              onClear={() => {
                save(null);
                setConfirmClear(false);
                setCleared(true);
              }}
            />
          )}
        </main>
      </div>
      <nav
        aria-label={platformCopy.nav.workspace}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line-light bg-paper md:hidden"
      >
        {workSectionIds.map((item) => (
          <NavLink key={item} section={item} current={section} compact />
        ))}
      </nav>
    </div>
  );
}

function DeskNav({ section }: { section: WorkSection }) {
  return (
    <nav aria-label={platformCopy.nav.workspace} className="grid gap-1">
      {workSectionIds.map((item) => (
        <NavLink key={item} section={item} current={section} />
      ))}
    </nav>
  );
}

function NavLink({
  section,
  current,
  compact = false,
}: {
  section: WorkSection;
  current: WorkSection;
  compact?: boolean;
}) {
  const active = section === current;
  return (
    <Link
      href={section === "overview" ? "/work" : `/work/${section}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center transition-colors duration-200 ease-editorial motion-reduce:transition-none",
        compact
          ? "min-h-14 justify-center px-1 text-center text-[0.75rem] leading-tight"
          : "min-h-12 border-l-2 px-4 text-[1.05rem]",
        active
          ? "border-gold-dark bg-ivory font-medium text-ink"
          : "border-transparent text-ink/70 hover:bg-ivory hover:text-ink",
        compact && active && "border-t-2 border-l-0",
      )}
    >
      {sectionTitle(section)}
    </Link>
  );
}

function Overview({
  draft,
  packId,
  sample,
  brokerMode,
}: {
  draft: Draft;
  packId: string;
  sample: boolean;
  brokerMode: boolean;
}) {
  const pack = getPack(packId);
  if (!pack || !draft.config) return null;
  const items = setupChecklist(draft, pack, onboardingComplete(draft.answers));
  const match = lenderMatch(pack, brokerMode);
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {brokerMode && pack.clientDesk ? <p className={fieldLabel}>{pack.clientDesk.modeLabel}</p> : <SampleMark />}
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
            {pack.deskTitle ?? sectionTitle("overview")}
          </h2>
          <p className="mt-4 text-[1.125rem] leading-relaxed text-ink/75">
            {brokerMode && pack.clientDesk
              ? pack.clientDesk.modeHelp
              : pack.clientDesk
                ? pack.clientDesk.modeOffHelp
                : pack.promise}
          </p>
        </div>
        {pack.id === "lending" ? (
          <Button href="/desk/status" variant="outline">
            {pack.clientDesk?.customerLink ?? platformCopy.status.back}
          </Button>
        ) : null}
      </div>
      <p className="text-[1.05rem] text-ink/70">{work.lede}</p>

      {sample ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {pack.kpis.map((kpi) => (
            <article key={kpi.id} className="rounded-[6px] border border-line-light bg-white/70 p-4 shadow-[0_18px_44px_rgb(8_9_14/0.06)]">
              <SampleMark />
              <p className="mt-4 text-[1rem] text-ink/70">{kpi.label}</p>
              <p className="mt-2 text-[2rem] leading-none tracking-[-0.04em] tabular-nums">{kpi.value}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/60">{kpi.note}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={work.checklist} body={work.emptyKpis} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[6px] border border-line-light p-6">
          <h2 className="text-[1.5rem] leading-none tracking-[-0.04em]">{work.checklist}</h2>
          <ul className="mt-6 grid gap-4">
            {items.map((item) => (
              <li key={item.id} className="grid gap-1 border-t border-line-light pt-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[1.125rem]">{item.label}</p>
                  <p className={fieldLabel}>{item.state === "Ready" ? platformCopy.ready : item.state === "Next" ? platformCopy.next : platformCopy.waiting}</p>
                </div>
                <p className="text-[1rem] leading-relaxed text-ink/70">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[6px] border border-line-light p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[1.5rem] leading-none tracking-[-0.04em]">{work.activity}</h2>
            {sample ? <SampleMark /> : null}
          </div>
          {sample ? (
            <ul className="mt-6 grid gap-4">
              {pack.activity.map((item) => (
                <li key={item.id} className="border-t border-line-light pt-4">
                  <p className="text-[1.125rem]">{item.title}</p>
                  <p className="mt-1 text-[1rem] text-ink/70">{item.detail}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-[1.125rem] text-ink/70">{work.emptyActivity}</p>
          )}
        </section>
      </div>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[1.5rem] leading-none tracking-[-0.04em]">{work.pipeline}</h2>
          {sample ? <SampleMark /> : null}
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pack.stages.map((stage) => (
            <li key={stage.id} className="rounded-[6px] border border-line-light bg-ivory/60 p-4">
              <p className={fieldLabel}>{stage.label}</p>
              {sample && stage.items.length ? (
                <ul className="mt-4 grid gap-2">
                  {stage.items.map((item) => (
                    <li key={item.id} className="rounded-[6px] border border-line-light bg-paper px-4 py-4">
                      <p className="text-[1.05rem]">{item.title}</p>
                      <p className="mt-1 text-[0.95rem] text-ink/65">{item.meta}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[1rem] text-ink/60">{work.emptyPipeline}</p>
              )}
            </li>
          ))}
        </ol>
        {match && sample ? (
          <aside data-testid="lender-match" className="rounded-[6px] border border-line-light bg-white/70 p-6 shadow-[0_18px_44px_rgb(8_9_14/0.06)]">
            <p className={fieldLabel}>{match.privacy}</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <h2 className="text-[1.5rem] leading-none tracking-[-0.04em]">{match.title}</h2>
              <SampleMark />
            </div>
            <p className="mt-4 max-w-2xl text-[1.125rem] leading-relaxed text-ink/75">{match.help}</p>
            <ul className="mt-6 grid gap-2 md:grid-cols-3">
              {match.lenders.map((lender) => (
                <li key={lender.id} className="rounded-[6px] border border-line-light px-4 py-4">
                  <p className="text-[1.125rem]">{lender.name}</p>
                  <p className="mt-2 text-[1rem] text-ink/70">{lender.note}</p>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        {match && !sample ? <EmptyState title={match.title} body={pack.clientDesk?.panelEmpty ?? work.emptyPipeline} /> : null}
        {!match && pack.clientDesk ? (
          <p className="text-[1.125rem] leading-relaxed text-ink/75">{pack.clientDesk.modeOffHelp}</p>
        ) : null}
        {pack.fundingDisclaimer ? <FundingDisclaimer text={pack.fundingDisclaimer} /> : null}
      </section>
    </div>
  );
}

function LeadList({ packId, sample }: { packId: string; sample: boolean }) {
  const pack = getPack(packId);
  if (!pack) return null;
  if (!sample) return <EmptyState title={sectionTitle("leads")} body={work.emptyLeads} />;
  return (
    <div className="grid gap-4">
      <SampleMark />
      <ul className="grid gap-2">
        {pack.leads.map((lead) => (
          <li key={lead.id} className="rounded-[6px] border border-line-light bg-white/70 px-4 py-4 transition-colors duration-200 hover:border-gold-dark motion-reduce:transition-none">
            <p className="text-[1.25rem] leading-none tracking-[-0.03em]">{lead.title}</p>
            <p className="mt-2 text-[1rem] text-ink/70">
              {lead.source}. {lead.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Inbox({ packId, sample }: { packId: string; sample: boolean }) {
  const pack = getPack(packId);
  const [selected, setSelected] = useState(pack?.inbox[0]?.id ?? "");
  if (!pack) return null;
  if (!sample) return <EmptyState title={sectionTitle("inbox")} body={work.emptyInbox} />;
  const thread = pack.inbox.find((item) => item.id === selected) ?? pack.inbox[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <SampleMark />
        <ul className="mt-4 grid gap-2">
          {pack.inbox.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item.id)}
                className={cn(
                  "min-h-14 w-full rounded-[6px] border px-4 py-4 text-left transition-colors duration-200 ease-editorial motion-reduce:transition-none",
                  item.id === thread?.id ? "border-ink bg-ink text-ivory" : "border-line-light bg-white hover:border-gold-dark",
                )}
              >
                <span className="block text-[1.05rem]">{item.from}</span>
                <span className={cn("mt-1 block text-[0.95rem]", item.id === thread?.id ? "text-ivory/75" : "text-ink/70")}>
                  {item.subject}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {thread ? (
        <article className="rounded-[6px] border border-line-light p-6">
          <SampleMark />
          <h2 className="mt-4 text-[1.75rem] leading-none tracking-[-0.04em]">{thread.subject}</h2>
          <p className="mt-2 text-[1rem] text-ink/60">{thread.from}</p>
          <p className="mt-6 text-[1.125rem] leading-relaxed">{thread.body}</p>
          <label className="mt-8 grid gap-2">
            <span className={fieldLabel}>{platformCopy.reply}</span>
            <textarea
              disabled
              rows={4}
              className="min-h-28 w-full rounded-[6px] border border-line-light bg-ivory/50 px-4 py-3 text-[1.05rem] text-ink/50"
            />
            <span className="text-[1rem] text-ink/70">{platformCopy.replyHelp}</span>
          </label>
        </article>
      ) : null}
    </div>
  );
}

function Approvals({ packId, sample }: { packId: string; sample: boolean }) {
  const pack = getPack(packId);
  if (!pack) return null;
  if (!sample) return <EmptyState title={sectionTitle("approvals")} body={work.emptyApprovals} />;
  return (
    <div className="grid gap-4">
      <SampleMark />
      <p className="max-w-2xl text-[1.125rem] leading-relaxed text-ink/75">{platformCopy.approvalHelp}</p>
      <ul className="grid gap-4">
        {pack.approvals.map((item) => (
          <li key={item.id} className="rounded-[6px] border border-line-light bg-white/70 p-6">
            <h2 className="text-[1.5rem] leading-none tracking-[-0.04em]">{item.title}</h2>
            <p className="mt-3 text-[1.125rem] leading-relaxed text-ink/75">{item.detail}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <SubmitButton type="button" disabled className="min-h-14 flex-1">
                {platformCopy.approve}
              </SubmitButton>
              <SubmitButton type="button" variant="outline" disabled className="min-h-14 flex-1">
                {platformCopy.decline}
              </SubmitButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Settings({
  draft,
  brokerMode,
  confirmClear,
  cleared,
  onToggleBroker,
  onAskClear,
  onCancelClear,
  onClear,
}: {
  draft: Draft;
  brokerMode: boolean;
  confirmClear: boolean;
  cleared: boolean;
  onToggleBroker: () => void;
  onAskClear: () => void;
  onCancelClear: () => void;
  onClear: () => void;
}) {
  const config = draft.config;
  const pack = getPack(config?.vertical ?? "");
  if (!config || !pack) return null;
  return (
    <div className="grid max-w-3xl gap-6">
      <p className="text-[1.125rem] leading-relaxed text-ink/75">{work.settingsHelp}</p>
      {cleared ? (
        <Notice tone="success" title={platformCopy.ready}>
          {platformCopy.cleared}
        </Notice>
      ) : null}
      {pack.clientDesk ? (
        <button
          type="button"
          role="switch"
          aria-checked={brokerMode}
          onClick={onToggleBroker}
          className="flex min-h-14 items-center justify-between gap-4 rounded-[6px] border border-line-light bg-white px-4 py-4 text-left transition-colors duration-200 hover:border-gold-dark motion-reduce:transition-none"
        >
          <span>
            <span className="block text-[1.125rem]">{pack.clientDesk.modeLabel}</span>
            <span className="mt-2 block text-[1rem] leading-relaxed text-ink/70">
              {brokerMode ? pack.clientDesk.modeHelp : pack.clientDesk.modeOffHelp}
            </span>
          </span>
          <span className={cn("relative h-6 w-11 shrink-0 rounded-full", brokerMode ? "bg-gold" : "bg-ink/15")} aria-hidden="true">
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-ivory", brokerMode ? "left-5" : "left-0.5")} />
          </span>
        </button>
      ) : null}
      <dl className="grid gap-4 rounded-[6px] border border-line-light p-6">
        <Setting label={platformCopy.wizard.fields.business} value={config.business_name} />
        <Setting label={platformCopy.wizard.fields.vertical} value={pack.label} />
        <Setting label={platformCopy.wizard.fields.market} value={config.market} />
        <Setting label={work.hoursTitle} value={`${platformCopy.wizard.hoursEmail}. ${platformCopy.wizard.hoursText}`} />
        <Setting label={platformCopy.wizard.fields.texting} value={platformCopy.wizard.textingOff} />
        <Setting label={platformCopy.wizard.fields.caps} value={String(config.caps)} />
        <Setting label={platformCopy.wizard.fields.outbound} value={platformCopy.wizard.outboundDry} />
      </dl>
      {config.notices.map((notice) => (
        <FundingDisclaimer key={notice} text={notice} />
      ))}
      <pre className="overflow-x-auto rounded-[6px] bg-ink p-4 text-[0.85rem] leading-relaxed text-ivory">
        {JSON.stringify(config, null, 2)}
      </pre>
      <p className="text-[1rem] leading-relaxed text-ink/70">{platformCopy.address}</p>
      {confirmClear ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <SubmitButton type="button" className="min-h-14 flex-1" onClick={onClear}>
            {platformCopy.clearConfirm}
          </SubmitButton>
          <SubmitButton type="button" variant="outline" className="min-h-14 flex-1" onClick={onCancelClear}>
            {platformCopy.cancel}
          </SubmitButton>
        </div>
      ) : (
        <SubmitButton type="button" variant="outline" className="min-h-14" onClick={onAskClear}>
          {platformCopy.clear}
        </SubmitButton>
      )}
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-line-light pt-4 first:border-t-0 first:pt-0">
      <dt className={fieldLabel}>{label}</dt>
      <dd className="text-[1.125rem]">{value}</dd>
    </div>
  );
}

