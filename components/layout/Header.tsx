"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Fragment,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { setOfferPath } from "@/components/offers/offerPathState";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { isNavGroup, navigation, type NavGroup, type NavLink } from "@/lib/content";
import { isMinistryTopic, ministryCue, ministryHero } from "@/lib/ministryPage";
import { offerPathByPage, offerPathFromHash } from "@/lib/offers";
import { track } from "@/lib/analytics";
import { useAssessingChurch } from "@/components/hooks/useAssessingChurch";
import { cn } from "@/lib/utils";
import styles from "./Header.module.css";
import { Logo } from "./Logo";

/* Hysteresis: the bar commits to the pill a little past the top and only
   returns once the reader is back at it, so it never flickers on the edge. */
const PILL_AFTER = 32;
const BAR_BEFORE = 8;

function isCurrent(pathname: string, href: string) {
  return href.split("#")[0] === pathname;
}

/**
 * Where a church is reading: the Genesis Ministry page, or the church version
 * of /contact (opened by a Ministry topic link). Null everywhere else.
 */
type ChurchPage = "ministry" | "contact" | null;

function churchPageFor(pathname: string, topic: string | null): ChurchPage {
  if (pathname === "/ministry") return "ministry";
  if (pathname === "/contact" && isMinistryTopic(topic)) return "contact";
  return null;
}

/**
 * Renders its children for the church page being read. The topic comes from
 * the URL, so the part that reads it sits in its own Suspense boundary: a
 * prerendered page ships the fallback, worked out from the path alone, and
 * the church version of /contact, which renders per request, gets it from
 * the server.
 */
function ForChurchPage({ pathname, children }: { pathname: string; children: (church: ChurchPage) => ReactNode }) {
  return (
    <Suspense fallback={children(churchPageFor(pathname, null))}>
      <ChurchPageFromUrl pathname={pathname}>{children}</ChurchPageFromUrl>
    </Suspense>
  );
}

function ChurchPageFromUrl({ pathname, children }: { pathname: string; children: (church: ChurchPage) => ReactNode }) {
  const topic = useSearchParams().get("topic");
  return children(churchPageFor(pathname, topic));
}

/*
 * A church is not assessing a business and has no business plans to price.
 * On the Ministry page the header books the church consultation the page
 * offers; on the church version of /contact it leads back to Genesis
 * Ministry. On both, Pricing (the business plans) becomes Plans: the three
 * Ministry plans and their prices, on /ministry#levels.
 */
/* On an edition page the header opens the assessment already set to that edition, as the hero does. */
const PERSONA_BY_PAGE: Readonly<Record<string, string>> = {
  "/lending": "lending",
  "/real-estate": "real-estate",
  "/business": "business",
  "/enterprise": "business",
};

function primaryFor(church: ChurchPage, assessingChurch = false, pathname = "") {
  if (church === "ministry" || church === "contact" || assessingChurch) return ministryHero.primary;
  const persona = PERSONA_BY_PAGE[pathname];
  return { href: persona ? `/assessment?persona=${persona}` : "/assessment", label: "Assess My Business" };
}

/*
 * The header button never points at the page the visitor is already on: on
 * /contact (the call form) and /assessment (the assessment itself) it steps
 * aside, so the page's own form is the one next step.
 */
function showsPrimary(pathname: string) {
  return pathname !== "/contact" && pathname !== "/assessment";
}

/* On the church version of /contact the reader is in Genesis Ministry, not "Company". */
function currentPathFor(pathname: string, church: ChurchPage) {
  return church === "contact" ? "/ministry" : pathname;
}

const CHURCH_PLANS: NavLink = { label: "Plans", href: "/ministry#levels" };

/* On the church assessment too: a church pricing the business Levels is the wrong page. */
function entryFor(entry: NavLink, church: ChurchPage, assessingChurch = false): NavLink {
  return (church || assessingChurch) && entry.href === "/pricing" ? CHURCH_PLANS : entry;
}

/** Which header button was pressed, for the analytics event it sends. */
function trackPrimary(href: string, from: string) {
  if (href.startsWith("/assessment")) track("assessment_link_clicked", { from, href });
  else if (href.startsWith("/contact?topic=ministry")) track("ministry_call_cta_clicked", { from, href });
}

/**
 * The site navigation.
 *
 * Wide screens: a full-width bar at the top of the page that settles into a
 * compact floating pill once the reader scrolls, and returns at the top. The
 * Genesis mark stands alone on the left; the Agent / Custom Infrastructure
 * toggle leads the links on the right. Entries with several destinations open
 * dropdowns that work by mouse, keyboard and touch.
 *
 * Narrow screens: a plain top bar and a full-screen menu with every
 * destination listed, rather than the desktop pill squeezed into a phone.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  /* On /assessment, once a church picks the church path, the header books a church call. */
  const assessingChurch = useAssessingChurch();
  const nav = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Any navigation closes whatever was open.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpenGroup(null);
    setMenuOpen(false);
  }

  // The homepage opens on a dark hero, so the bar can start transparent there.
  const overDarkHero = pathname === "/";

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled((pill) => (pill ? y > BAR_BEFORE : y > PILL_AFTER));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    frame = window.requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // Keep the chosen path in step with the page and the URL. A path page always
  // selects its own path; #agent and #custom-infrastructure select theirs. It
  // re-runs on every navigation because client-side routing fires no hashchange.
  useEffect(() => {
    const sync = () => {
      const path =
        offerPathByPage[window.location.pathname] ?? offerPathFromHash(window.location.hash);
      if (path) setOfferPath(path);
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  // An open dropdown closes on a press anywhere outside the navigation, and on
  // Escape — returning focus to its trigger when focus was inside it.
  useEffect(() => {
    if (!openGroup) return;

    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const focusWasInside = nav.current?.contains(document.activeElement) ?? false;
      const trigger = nav.current?.querySelector<HTMLButtonElement>(
        `[data-nav-trigger="${openGroup}"]`,
      );
      setOpenGroup(null);
      if (focusWasInside) trigger?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup]);

  // While the mobile menu is open the page behind it does not scroll, and the
  // menu closes itself if the window grows into the desktop layout.
  useEffect(() => {
    if (!menuOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);

    return () => {
      root.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <header
      className={styles.header}
      data-scrolled={scrolled}
      data-over-dark={overDarkHero}
    >
      <div className={styles.bar}>
        <div className={styles.brand}>
          <Logo light wordmark={false} />
        </div>

        <div className={styles.actions}>
          <nav ref={nav} aria-label="Primary navigation" className={styles.nav}>
            <ul className={styles.navList}>
              {navigation.map((entry) => (
                <li key={entry.label}>
                  {isNavGroup(entry) ? (
                    <ForChurchPage pathname={pathname}>
                      {(church) => (
                        <NavDropdown
                          group={entry}
                          pathname={currentPathFor(pathname, church)}
                          open={openGroup === entry.label}
                          onOpenChange={(open) => setOpenGroup(open ? entry.label : null)}
                        />
                      )}
                    </ForChurchPage>
                  ) : (
                    <ForChurchPage pathname={pathname}>
                      {(church) => {
                        const link = entryFor(entry, church, assessingChurch && pathname === "/assessment");
                        return (
                          <Link
                            href={link.href}
                            aria-current={link === entry && isCurrent(pathname, link.href) ? "page" : undefined}
                            className={styles.link}
                          >
                            {link.label}
                          </Link>
                        );
                      }}
                    </ForChurchPage>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {showsPrimary(pathname) ? (
            <ForChurchPage pathname={pathname}>
              {(church) => {
                const primary = primaryFor(church, assessingChurch && pathname === "/assessment", pathname);
                return (
                  <>
                    <ConsultationButton
                      href={primary.href}
                      compact
                      className={styles.cta}
                      onClick={() => trackPrimary(primary.href, "header")}
                    >
                      {primary.label}
                    </ConsultationButton>
                    {/* A phone keeps the main action one tap away on every screen, beside the menu. */}
                    <Link
                      href={primary.href}
                      className={cn("primary-action", styles.phoneCta)}
                      onClick={() => trackPrimary(primary.href, "header_phone")}
                    >
                      {primary.label}
                    </Link>
                  </>
                );
              }}
            </ForChurchPage>
          ) : null}

          <button
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            data-open={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={cn("mobile-menu-toggle grid size-12 place-items-center", styles.menuToggle)}
          >
            <span aria-hidden="true" className="mobile-menu-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <ForChurchPage pathname={pathname}>
          {(church) => (
            <MobileMenu
              pathname={pathname}
              church={church}
              assessingChurch={assessingChurch && pathname === "/assessment"}
              onClose={() => setMenuOpen(false)}
              returnFocus={menuButton}
            />
          )}
        </ForChurchPage>
      ) : null}
    </header>
  );
}

function NavDropdown({
  group,
  pathname,
  open,
  onOpenChange,
}: {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef(0);
  const hoverOpenedAt = useRef(0);
  const focusFirstOnOpen = useRef(false);
  const current = group.items.some((item) => isCurrent(pathname, item.href));

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const links = () =>
    Array.from(panel.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);

  const focusLink = (index: number) => {
    const all = links();
    if (!all.length) return;
    all[(index + all.length) % all.length]?.focus();
  };

  // Opened from the keyboard: move focus in once the panel has rendered.
  useEffect(() => {
    if (!open || !focusFirstOnOpen.current) return;
    focusFirstOnOpen.current = false;
    focusLink(0);
  });

  // Mouse only: hover opens after a short intent delay and closes after a
  // short grace period, so crossing the gap to the panel never drops it.
  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    if (open) return;
    hoverTimer.current = window.setTimeout(() => {
      hoverOpenedAt.current = Date.now();
      onOpenChange(true);
    }, 90);
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => onOpenChange(false), 220);
  };

  const onTriggerClick = () => {
    // A click that lands just after hover opened the panel confirms it,
    // instead of immediately closing what the reader is reaching for.
    if (open && Date.now() - hoverOpenedAt.current < 450) return;
    onOpenChange(!open);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    if (open) {
      focusLink(0);
    } else {
      focusFirstOnOpen.current = true;
      onOpenChange(true);
    }
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const all = links();
    const index = all.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusLink(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index <= 0) trigger.current?.focus();
      else focusLink(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusLink(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusLink(all.length - 1);
    }
  };

  // Tabbing out of the group closes it.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) onOpenChange(false);
  };

  return (
    <div
      className={styles.group}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onBlur={onBlur}
    >
      <button
        ref={trigger}
        type="button"
        data-nav-trigger={group.label}
        aria-expanded={open}
        aria-controls={panelId}
        data-current={current ? "true" : undefined}
        className={styles.trigger}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
      >
        {group.label}
        <svg aria-hidden="true" viewBox="0 0 12 12" className={styles.chevron}>
          <path
            d="M3 4.5 6 7.5 9 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        ref={panel}
        id={panelId}
        hidden={!open}
        className={cn(styles.panel, group.feature ? styles.panelWide : styles.panelNarrow)}
        onKeyDown={onPanelKeyDown}
      >
        <div className={styles.panelGrid}>
          {group.feature ? (
            <Link
              href={group.feature.href}
              className={styles.feature}
              onClick={() => onOpenChange(false)}
            >
              <span className={styles.featureEyebrow}>{group.feature.eyebrow}</span>
              <span className={styles.featureTitle}>{group.feature.title}</span>
              <span className={styles.featureDescription}>{group.feature.description}</span>
              <span className={styles.featureAction}>
                {group.feature.action}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ) : null}

          <ul className={styles.items}>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className={styles.item}
                  onClick={() => {
                    if (item.href === ministryCue.href) track("ministry_cue_clicked", { from: "editions_dropdown" });
                    onOpenChange(false);
                  }}
                >
                  <span className={styles.itemLabel}>{item.label}</span>
                  {item.description ? (
                    <span className={styles.itemDescription}>{item.description}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  pathname,
  church,
  assessingChurch,
  onClose,
  returnFocus,
}: {
  pathname: string;
  church: ChurchPage;
  assessingChurch: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const primary = primaryFor(church, assessingChurch, pathname);
  const entryHere = (entry: NavLink) => entryFor(entry, church, assessingChurch);
  const sheet = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const labelId = useId();

  // Focus moves into the menu on open and back to the menu button on close.
  useEffect(() => {
    const returnTo = returnFocus.current;
    closeButton.current?.focus();
    return () => returnTo?.focus();
  }, [returnFocus]);

  // A modal menu: Escape closes it and Tab cycles within it.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      sheet.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={sheet}
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      className={styles.sheet}
      onKeyDown={onKeyDown}
    >
      <div className={styles.sheetHeader}>
        <div onClickCapture={onClose}>
          <Logo light wordmark={false} />
        </div>
        <span id={labelId} className="sr-only">
          Site navigation
        </span>
        <button
          ref={closeButton}
          type="button"
          aria-label="Close navigation"
          data-open="true"
          onClick={onClose}
          className="mobile-menu-toggle grid size-12 place-items-center"
        >
          <span aria-hidden="true" className="mobile-menu-icon">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <nav aria-label="Primary navigation" className={styles.sheetBody}>
        {navigation.map((entry) =>
          isNavGroup(entry) ? (
            <Fragment key={entry.label}>
            <div className={styles.sheetGroup} data-area={entry.label === "Editions" ? "editions" : "side"}>
              <p className={styles.sheetGroupLabel}>{entry.label}</p>
              <ul>
                {entry.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isCurrent(currentPathFor(pathname, church), item.href) ? "page" : undefined}
                      className={styles.sheetLink}
                      onClick={() => {
                        if (item.href === ministryCue.href) track("ministry_cue_clicked", { from: "mobile_menu" });
                        onClose();
                      }}
                    >
                      <span className={styles.sheetLinkText}>
                        <span className={styles.sheetLinkLabel}>{item.label}</span>
                        {item.description ? (
                          <span className={styles.sheetLinkDescription}>{item.description}</span>
                        ) : null}
                      </span>
                      <span aria-hidden="true" className={styles.sheetArrow}>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                {/* The desktop dropdown's assessment row, as one line: the way to the edition that fits. */}
                {entry.feature && !church ? (
                  <li>
                    <Link
                      href={entry.feature.href}
                      className={styles.sheetLink}
                      onClick={() => {
                        trackPrimary(entry.feature!.href, "mobile_menu_editions");
                        onClose();
                      }}
                    >
                      <span className={styles.sheetLinkText}>
                        <span className={styles.sheetLinkLabel}>{entry.feature.title}</span>
                        <span className={styles.sheetLinkDescription}>{entry.feature.eyebrow}</span>
                      </span>
                      <span aria-hidden="true" className={styles.sheetArrow}>
                        →
                      </span>
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>
            {/* The church path, right under the editions: a business owner sees the editions
                and the assessment first. Hidden where the reader is already in the church context. */}
            {entry.label === "Editions" && !church ? (
            <Link
              href={ministryCue.href}
              aria-label={ministryCue.ariaLabel}
              className={styles.sheetCue}
              data-area="cue"
              onClick={() => {
                track("ministry_cue_clicked", { from: "mobile_menu_cue" });
                onClose();
              }}
            >
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-gold" />
              <span className={styles.sheetCueText}>
                <span className={styles.sheetCueLead}>{ministryCue.lead}</span>
                <span className={styles.sheetCueLabel}>{ministryCue.label}</span>
              </span>
              <span aria-hidden="true" className={styles.sheetArrow}>
                →
              </span>
            </Link>
            ) : null}
            </Fragment>
          ) : (
            <div key={entry.label} className={cn(styles.sheetGroup, styles.sheetSingle)} data-area="side">
              <Link
                href={entryHere(entry).href}
                aria-current={entryHere(entry) === entry && isCurrent(pathname, entry.href) ? "page" : undefined}
                className={styles.sheetLink}
                onClick={onClose}
              >
                <span className={styles.sheetLinkLabel}>{entryHere(entry).label}</span>
                <span aria-hidden="true" className={styles.sheetArrow}>
                  →
                </span>
              </Link>
            </div>
          ),
        )}
      </nav>

      <div className={styles.sheetFooter}>
        <ConsultationButton
          href={primary.href}
          className="w-full"
          onClick={() => {
            trackPrimary(primary.href, "mobile_menu");
            onClose();
          }}
        >
          {primary.label}
        </ConsultationButton>
        {/* A second way out, within thumb reach of the bottom of the screen. */}
        <button type="button" onClick={onClose} className={styles.sheetClose}>
          Close Menu
        </button>
      </div>
    </div>
  );
}
